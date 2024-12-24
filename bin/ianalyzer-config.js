#!/usr/bin/env node
"use strict";

require('v8-compile-cache');

const fs = require('fs'),
    utils = require('./utils'),
    path = require('path'),
    lintIgnore = path.join(__dirname, '.eslintignore'),
    packageJson = require('../package.json'),
    constants = require('./constants');

const { fileTypeArray, outputDirectory, rules_category, eslintPrefix } = constants;
const linterDependencies = require('./ianalyzer-dependencies.json');
const installPeerDependencies = utils.isPeerDepsInstallationReqd();

// For starting the configuration for iAnalyzer
function configureLinter(rl, param, type) {
    return new Promise((resolve) => {
        if (param === 'remove') {
            uninstallIAnalyzer(type).then(() => { resolve(true) });
        } else {
            installIAnalyzer(rl).then(() => { resolve(true) });
        }
    });
}

async function installIAnalyzer(rl = {}) {
    await installRequestedLinter(rl);
}

async function installRequestedLinter(rl) {
    return new Promise((resolve) => {
        const projectOptions = [];

        const iAnalyzerDependencies = [...linterDependencies.frameworks];
        iAnalyzerDependencies.sort((opt1, opt2) => {
            return opt1.seqNo - opt2.seqNo;
        });

        if ((typeof (rl.question) !== 'function')) {
            const configData = utils.readLinterConfig();
            const projTypeArr = iAnalyzerDependencies.filter(
                (obj) => obj.type === configData.projectType
            );
            if (projTypeArr.length <= 0) {
                console.error('\x1b[31m%s\x1b[0m', 'No data available!');
                process.kill(0);
            }
            const projTypeObj = projTypeArr[0];
            handlePackageInstallationForIAnalyzer(rl, projTypeObj, resolve);
        } else {
            for (let i = 0; i < iAnalyzerDependencies.length; i++) {
                projectOptions.push(
                    { option: iAnalyzerDependencies[i].seqNo, text: iAnalyzerDependencies[i].type }
                );
            }
            let projTypeMsg = '\nWhich framework does your project use?';
            for (let i = 0; i < projectOptions.length; i++) {
                projTypeMsg += '\n' + projectOptions[i].option + '. ' + projectOptions[i].text;
            }
            projTypeMsg += '\nPlease provide any one option: ';
            rl.question(projTypeMsg, async (selectedOption) => {
                const projTypeArr = iAnalyzerDependencies.filter((obj) => obj.seqNo == selectedOption);
                if (projTypeArr.length <= 0) {
                    console.error('\x1b[31m%s\x1b[0m', 'Invalid option selected.');
                    process.kill(0);
                }
                const projTypeObj = projTypeArr[0];
                handlePackageInstallationForIAnalyzer(rl, projTypeObj, resolve)
            });
        }
    });
}

async function handlePackageInstallationForIAnalyzer(rl, projTypeObj, resolve) {
    const languageTypeObj = await askLanguageTypeForIAnalyzer(rl, projTypeObj);

    const updateConfig = {projectType: projTypeObj.type,
                    languageType: languageTypeObj.subType }

    await utils.updateLinterConfig(updateConfig);

    console.log('\x1b[33m%s\x1b[0m', '\nInstalling required packages. Please wait...');

    const installPackageArr = [];
    const defaultPackagesArr = linterDependencies.defaultPackages;
    if (defaultPackagesArr && defaultPackagesArr.length > 0) {
        for (let i = 0; i < defaultPackagesArr.length; i++) {
            const packageObj = defaultPackagesArr[i];
            let installPackName = packageObj.packageName;
            if (packageObj.version && packageObj.version.trim().length > 0) {
                installPackName = installPackName + '@' + packageObj.version;
            }
            installPackageArr.push(installPackName);
            if(installPeerDependencies && packageObj.peerDependencies) {
                const pkgs = utils.getPackagesList(packageObj.peerDependencies);
                installPackageArr.push(...pkgs);
            }
        }
    }
    for (let i = 0; i < languageTypeObj.requiredPackages.length; i++) {
        const packageObj = languageTypeObj.requiredPackages[i];
        let installPackName = packageObj.packageName;
        // If dependency has cmd array
        if (packageObj.cmd && packageObj.cmd.length > 0) {
            for (let j = 0; j < packageObj.cmd.length; j++) {
                await require(packageObj.cmd[j]);
            }
        } else if (packageObj.version && packageObj.version.trim().length > 0) {
            installPackName = installPackName + '@' + packageObj.version;
            installPackageArr.push(installPackName);
        }
        if(installPeerDependencies && packageObj.peerDependencies) {
            const pkgs = utils.getPackagesList(packageObj.peerDependencies);
            installPackageArr.push(...pkgs);
        }
    }

    if (installPackageArr.length > 0) {
        await utils.installPackages(installPackageArr, true);
    }

    // For creating backup of all eslintrc files
    await utils.createFileBackup(fileTypeArray, '_backup');

    // For Copying New eslint file
    const eslintrcFilePath = path.join(__dirname, languageTypeObj.eslintrcPath);

    await utils.addConfigFile(eslintrcFilePath, '.eslintrc', true);

    await utils.createNewDirectory(outputDirectory);

    await utils.addConfigFile(lintIgnore, '.eslintignore', false);

    resolve(true);
}

function getInstalledProjectType() {
    return new Promise(async function (resolve) {
        const rawdata = fs.readFileSync('package.json');
        const loadDependancy = JSON.parse(rawdata);
        let projectType = null;
        if (loadDependancy?.config?.iAnalyzer?.projectType) {
            projectType = loadDependancy.config.iAnalyzer.projectType;
        }
        resolve(projectType);
    });
}

function getInstalledLanguageType() {
    return new Promise(async function (resolve) {
        const rawdata = fs.readFileSync('package.json');
        const loadDependancy = JSON.parse(rawdata);
        let languageType = null;
        if (loadDependancy?.config?.iAnalyzer?.languageType) {
            languageType = loadDependancy.config.iAnalyzer.languageType;
        }
        resolve(languageType);
    });
}

function uninstallIAnalyzer(type) {
    return new Promise(async function (resolve) {
        const removePackageNames = [];
        const defaultPackagesArr = linterDependencies.defaultPackages;
        if (defaultPackagesArr && defaultPackagesArr.length > 0) {
            for (let i = 0; i < defaultPackagesArr.length; i++) {
                removePackageNames.push(defaultPackagesArr[i].packageName);
                if(installPeerDependencies && defaultPackagesArr[i].peerDependencies) {
                    const pkgs = utils.getPackagesList(defaultPackagesArr[i].peerDependencies);
                    removePackageNames.push(...pkgs);
                }
            }
        }
        const projectType = await getInstalledProjectType();
        const languageType = await getInstalledLanguageType();
        if (projectType && languageType) {
            const iAnalyzerDependencies = [...linterDependencies.frameworks];
            const projTypeArr = iAnalyzerDependencies.filter((obj) => obj.type === projectType);
            if (projTypeArr.length > 0) {
                const projTypeObj = projTypeArr[0];
                const languageTypeArr = projTypeObj.languageType.filter(
                    (obj) => obj.subType === languageType
                );
                if (languageTypeArr.length > 0) {
                    const languageTypeObj = languageTypeArr[0];
                    for (let i = 0; i < languageTypeObj.requiredPackages.length; i++) {
                        const packageObj = languageTypeObj.requiredPackages[i];
                        // If dependency has cmd array
                        if (packageObj.cmd && packageObj.cmd.length > 0) {
                            for (let j = 0; j < packageObj.cmd.length; j++) {
                                await require('./scripts/uninstall-cmd-package.js');
                            }
                        } else {
                            removePackageNames.push(packageObj.packageName);
                        }
                    }
                }
            }
        }
        if (type === 'all') {
            removeConfigFiles();
            removePackageNames.push(packageJson.name);
        }
        if (removePackageNames.length > 0) {
            await utils.uninstallPackages(removePackageNames);
        }

        resolve(true);
    });
}

async function removeConfigFiles() {
    const fileExistEslintrc = fs.existsSync('.eslintrc');
    if (fileExistEslintrc) {
        fs.unlink('.eslintrc', (err) => {
            if (err) throw err;
        });
        await utils.restoreBackupFile(fileTypeArray, '_backup');
    }

    const fileExistIAnalyzerrc = fs.existsSync('.ianalyzerrc.json');
    if (fileExistIAnalyzerrc) {
        fs.unlink('.ianalyzerrc.json', (err) => {
            if (err) throw err;
        });
        await utils.restoreBackupFile(fileTypeArray, '_backup');
    }

    const fileEslintIgnore = fs.existsSync('.eslintignore');
    if (fileEslintIgnore) {
        fs.unlink('.eslintignore', (err) => {
            if (err) throw err;
        });
        await utils.restoreBackupFile(['eslintignore'], '_backup');
    }

    // Need to add once Sonar Integration is implemented
    // var fileSonar = fs.existsSync('sonar-project.properties');
    // if (fileSonar) {
    //     fs.unlink('sonar-project.properties', function (err) {
    //         if (err) throw err;
    //     });
    //     await utils.restoreBackupFile(['sonar-project'], '_backup');
    // }
}

function runCategoryScript(rl, rules_profile, option) {
    return new Promise(async function (resolve) {
        let runCategory = false;
        const projectType = await utils.getProjectType();
        const config = utils.readLinterConfig();
        const language = config.languageType.toLowerCase()

        let prefix = '';
        if (projectType === 'React') {
            prefix = `${eslintPrefix}/react`;
            runCategory = true;
        } else if (projectType === 'Angular') {
            prefix = `${eslintPrefix}/angular`;
            runCategory = true;
        } else if (projectType === 'Vue') {
            prefix = `${eslintPrefix}/vue`;
            runCategory = true;
        } else if (projectType === 'TypeScript') {
            prefix = `${eslintPrefix}/typescript`;
            runCategory = true;
        } else if (projectType === 'Vanilla JS/ES6') {
            prefix = `${eslintPrefix}/javascript`;
            runCategory = true;
        } else {
            console.error('\x1b[31m%s\x1b[0m', 'Please install iAnalyzer before selecting any rules.');
            resolve(true);
        }
        if (runCategory) {
            const fileExist1 = fs.existsSync('.eslintrc'),
                fileExist2 = fs.existsSync('.eslintrc.js'),
                getFileName = fileExist1 ? '.eslintrc' : fileExist2 ? '.eslintrc.js' : null;
            let readRowData,
                parsedRowData,
                getPromiseData;

            if (getFileName) {
                readRowData = fs.readFileSync(getFileName);
                parsedRowData = JSON.parse(readRowData);
            }

            let questionForCustomRules, inputFileExist, filePath;
            switch (rules_profile) {
                case 'custom':
                    questionForCustomRules = function () {
                        return new Promise(async function (resolve) {
                            rl.question('\nPlease enter the path of rules file (File should be in json format): ', (input) => {
                                inputFileExist = fs.existsSync(input);
                                if (!inputFileExist) {
                                    console.log('\x1b[31m%s\x1b[0m', 'Unable to add custom rules! Input file not found.');
                                    resolve(true);
                                } else {
                                    let inputVal = input;
                                    if (!inputVal.startsWith('./')) {
                                        inputVal = './' + inputVal;
                                    }
                                    getPromiseData = utils.extendValueIneslint(
                                        parsedRowData, option, inputVal
                                    );
                                    resolve(true);
                                }
                            });
                        });
                    }
                    await questionForCustomRules();
                    break;

                case 'sonar':
                    getPromiseData = utils.extendValueIneslint(parsedRowData, option, `${eslintPrefix}/sonar-${language}-essential.js`);
                    break

                case `${rules_profile}`:
                    if (projectType === 'TypeScript' || projectType === 'Vanilla JS/ES6') filePath = `${prefix}-${rules_profile}.js`;
                    else filePath = `${prefix}-${language}-${rules_profile}.js`;
                    getPromiseData = utils.extendValueIneslint(parsedRowData, option, filePath);
                    break;
            }

            let rulesProfile = rules_category.filter((e) => e.category === rules_profile);
            rulesProfile = rulesProfile && rulesProfile[0] ? rulesProfile[0].label : '';
            if (getFileName && !!getPromiseData) {
                getPromiseData.then((resolve) => {
                    utils.updateLinterConfig({linterProfile: rulesProfile});
                    let jsLintCommand = utils.getJsLinterCommand();
                    utils.updateLinterConfig({ jsLintCommand })
                    let data = JSON.stringify(resolve, null, 4);
                    fs.writeFileSync(getFileName, data);
                }).catch((err) => {
                    console.error(err);
                });
                resolve(true);
            } else {
                resolve(true);
            }
        }
    });
}

function isJsLinterInstalled() {
    return new Promise(async function (resolve) {
        const configData = utils.readLinterConfig();
        if (configData['js-linter'] && configData.projectType && configData.languageType) {
            resolve(true);
        } else {
            resolve(false);
        }
    });
}

function selectLinterRule(rl, i) {
    return new Promise(async function (resolve) {
        const linterProfile = utils.readLinterConfig('linterProfile');
        const initialMessage = `\nPlease select a profile name (Current profile: ${linterProfile}) \n`
        let finalMessage = rules_category.reduce((message, currentCategory, index) => {
            const { label, description } = currentCategory;
            return message + `\n ${(index + 1)}. ${label} (${description})`;
        }, initialMessage);

        finalMessage += '\n\nPlease provide any one option: ';

        rl.question(finalMessage, async function (input) {
            const index = parseInt(input) - 1;

            if (index > -1 && index < rules_category.length) {
                async function showCategoryOption(opt) {
                    const currentCategory = rules_category.filter((el) => el.option === opt)[0];
                    const { category, label } = currentCategory;
                    console.log('\x1b[32m%s\x1b[0m', `\n${label} rules profile has been successfully configured for JS Linter.`);
                    await runCategoryScript(rl, category, i)
                }
                await showCategoryOption(index);
            }
            else {
                console.log('\x1b[31m%s\x1b[0m', '\nSorry you have entered wrong option. Please try again.');
            }
            resolve(true);
        });
    });
}

function askLanguageTypeForIAnalyzer(rl, projTypeObj) {
    return new Promise(async function (resolve, reject) {
        let languageTypeObj;
        if ((typeof (rl.question) !== 'function')) {
            const configData = utils.readLinterConfig();

            languageTypeObj = projTypeObj.languageType.filter(
                (obj) => obj.subType === configData.languageType
            )[0];
        } else if (projTypeObj.languageType.length === 1) {
                languageTypeObj = projTypeObj.languageType[0];
            } else if (projTypeObj.languageType.length > 1) {
                const languageOptions = [];

                for (let i = 0; i < projTypeObj.languageType.length; i++) {
                    languageOptions.push(
                        { option: (i + 1), text: projTypeObj.languageType[i].subType }
                    );
                }
                let initMessage = '\nWhat type of language does your project use?';
                for (let i = 0; i < languageOptions.length; i++) {
                    initMessage += '\n' + languageOptions[i].option + '. ' + languageOptions[i].text;
                }
                initMessage += '\n\nPlease provide any one option: ';
                const questionForlanguageOptionSelection = function () {
                    return new Promise(async function (resolve) {
                        rl.question(initMessage, async (selectedOption) => {
                            const languageEsOptionArr = languageOptions.filter(
                                (obj) => obj.option == selectedOption
                            );
                            if (languageEsOptionArr.length <= 0) {
                                console.error('\x1b[31m%s\x1b[0m', 'You have chosen invalid option. Please try again.');
                                process.kill(0);
                            }
                            const languageEsArr = projTypeObj.languageType.filter(
                                (obj) => obj.subType === languageEsOptionArr[0].text
                            );
                            resolve(languageEsArr[0]);
                        });
                    });
                }
                languageTypeObj = await questionForlanguageOptionSelection();
            } else {
                console.error('\x1b[31m%s\x1b[0m', '\nLanguage type not available for selected project type!');
                process.kill(0);
                reject();
            }

        resolve(languageTypeObj);
    });
}

module.exports = {
    configureLinter,
    selectLinterRule,
    isJsLinterInstalled,
    getInstalledLanguageType,
    installIAnalyzer
};
