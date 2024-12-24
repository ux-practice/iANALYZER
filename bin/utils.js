"use strict";

require('v8-compile-cache');

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const fs = require('fs'),
    ScriptData = require('./script-data');
const {spawn} = require('child_process'),
    path = require('path'),
    constants = require('./constants'),
    htmlLinter = require('./html-linter-config'),
    cssLinter = require('./css-linter-config'),
    prettier = require('./prettier-config'),
    sonarConfig = require('./sonar-config');

const ianalyzerrcPath = path.join(__dirname, './../../../.ianalyzerrc.json');

const { ianalyzerrcInitialConfig, noPackageJson, defaultLinterPath, safeNodeVersionForPeerDeps, rules_category, jsLintCommand, jsHtmlLintCommand, packagesToInstall } = constants

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------
exports.installPackages = function installPackages(packages = [], isDev) {
    return new Promise(async function (resolve) {
        const packageNames = packages.reduce((original, newData) => original + ' ' + newData);
        const installPkgCmd = `npm install ${isDev ? '--save-dev' : ''} ${packageNames}`;
        await executeCommand(installPkgCmd, true);
        resolve(true);
    });
};

function executeCommand(fullCommand, isErrThrow) {
    return new Promise((resolve) => {
        try {
            let ls = spawn(fullCommand, [], { shell: true, stdio: "inherit" });
            ls.on('error', (err) => {
                console.error('Failed: ', err);
                if (isErrThrow) {
                    throw err;
                } else {
                    resolve(true);
                }
            });
            ls.on('exit', () => {
                resolve(true);
            });
        } catch (err) {
            console.error('Failed: ', err);
        }
    });
}

exports.uninstallPackages = function uninstallPackages(packages = []) {
    return new Promise(async function (resolve) {
        const packageNames = packages.reduce((original, newData) => original + ' ' + newData);
        const uninstallPkgCmd = `npm uninstall ${packageNames}`;
        await executeCommand(uninstallPkgCmd, true);
        resolve(true);
    });
};


exports.addConfigFile = function addConfigFile(filePath, fileName, force = true) {
    return new Promise((resolve) => {
        const ifFileExist = fs.existsSync(fileName);
        if (force || !ifFileExist) {
            fs.copyFileSync(filePath, fileName, fs.constants.COPYFILE_FICLONE);
            resolve(true);
        }
        else {
            resolve(true);
        }
    });
};

exports.removeConfigFile = function removeConfigFile(fileName) {
    return new Promise((resolve) => {
        const fileExist1 = fs.existsSync(fileName);
        if (fileExist1) {
            fs.unlink(fileName, (err) => {
                if (err) {
                    throw err;
                } else {
                    resolve(true);
                }
            });
        } else {
            resolve(true);
        }
    });
};

exports.addScriptPackageJSON = function addScriptPackageJSON(scripts = [new ScriptData('', '')], pkgJsonPath = 'package.json') {
    return new Promise((resolve) => {
        const rawdata = fs.readFileSync(pkgJsonPath);
        const loadDependancy = JSON.parse(rawdata);
        if (!loadDependancy?.scripts) {
            loadDependancy.scripts = {}
        }
        scripts.forEach((script) => {
            loadDependancy.scripts[script.name] = script.value;
        });

        const data = JSON.stringify(loadDependancy, null, 4);
        fs.writeFileSync(pkgJsonPath, data);
        resolve(true);
    });
};

exports.removeScriptPackageJSON = function removeScriptPackageJSON(scripts = []) {
    return new Promise((resolve) => {
        const rawdata = fs.readFileSync('package.json');
        const loadDependancy = JSON.parse(rawdata);
        if (loadDependancy?.scripts) {
            scripts.forEach((script) => {
                delete loadDependancy.scripts[script];
            });
        }
        const loadData = JSON.stringify(loadDependancy, null, 4);
        fs.writeFileSync('package.json', loadData);
        resolve(true);
    });
};


exports.createFileBackup = function createFileBackup(fileNameArray = [], suffix = '_backup') {
    return new Promise((resolve) => {
        for (const key in fileNameArray) {
            if (fs.existsSync(fileNameArray[key])) {
                fs.renameSync(fileNameArray[key], `${fileNameArray[key]}${suffix}`, (err) => {
                    if (err) {
                        throw err;
                    }
                });
            }
        }
        resolve(true);
    });
};

exports.restoreBackupFile = function restoreBackupFile(fileNameArray = [], suffix = '_backup') {
    return new Promise((resolve) => {
        for (const key in fileNameArray) {
            const backupFileName = fileNameArray[key] + suffix;
            if (fs.existsSync(backupFileName)) {
                const newFileName = backupFileName.replace(suffix, '');
                fs.renameSync(backupFileName, newFileName, (err) => {
                    if (err) {
                        throw err;
                    }
                });
            }
        }
        resolve(true);
    });
};

exports.createNewDirectory = function createNewDirectory(directoryPath) {
    return new Promise((resolve) => {
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath);
        }
        resolve(true);
    });
};

exports.extendValueIneslint = function (parsedRowData, option, entry) {
    return new Promise((resolve) => {
        const parsedRow = parsedRowData;
        if (parsedRow?.extends) {
            if (option === 0) {
                parsedRow.extends = [];
            }
            if (!parsedRow.extends.includes(entry)) {
                parsedRow.extends.push(entry);
            }
        }
        resolve(parsedRow);
    });
}

function isPackageInstalled(packageName) {
    return new Promise((resolve) => {
        const rawdata = fs.readFileSync('package.json');
        const loadDependency = JSON.parse(rawdata);
        if (
            loadDependency?.dependencies
            && loadDependency?.dependencies[packageName]
        ) {
            resolve(true);
        } else if (
            loadDependency?.devDependencies
            && loadDependency?.devDependencies[packageName]
        ) {
            resolve(true);
        } else {
            resolve(false);
        }
    });
}
exports.isPackageInstalled = isPackageInstalled;

function getLinterPath() {
    return new Promise(async function (resolve) {
        const config = readLinterConfig();
        resolve(config.path || '');
    });
}
exports.getLinterPath = getLinterPath;

exports.getProjectType = function getProjectType() {
    return new Promise(async function (resolve) {
        const config = readLinterConfig();
        resolve(config.projectType || '');
    });
}

exports.languageType = function languageType() {
    return new Promise(async function (resolve) {
        const config = readLinterConfig();
        resolve(config.languageType || '');
    });
}

/**
 * For fetching Linting command from linterrc file
 */
exports.getLintCommand = function getLintCommand(linterType, runType) {
    return new Promise(async function (resolve) {
        const config = readLinterConfig();
        const commandType = `${linterType}${runType}Command`;
        let command = config[commandType];
        if (linterType === 'css') {
            if (config.path !== '' && config.path.slice(-1) !== '/') {
                config.path = `${config.path}/`;
            }
        }
        if (command.indexOf('$path') > -1) {
            command = command.replace('$path', config.path);
        }
        resolve(command);
     });
}

function isPathAlreadySet() {
    return new Promise(async function (resolve) {
        const currentPath = await getLinterPath();
        resolve(currentPath.length !== 0);
    });
}

function askPathToLint(rl, currentPath = '') {
    return new Promise((resolve) => {
        rl.question(`\nPlease provide path to lint ( or Press Enter for current path: ${currentPath || defaultLinterPath} ) : `, async function (pathName) {
            if (pathName.length === 0) {
                updateLinterConfig({'path': (currentPath || defaultLinterPath)});
            }
            else {
                updateLinterConfig({'path': pathName.trim()});
                if (currentPath.length !== 0) console.log('\x1b[32m%s\x1b[0m', '\nPath updated successfully!');
            }

            resolve(true);
        })
    })
}

exports.askPathIfNotExist = async function (rl) {
    if (!await isPathAlreadySet()) await askPathToLint(rl);
}

exports.askPathToLint = askPathToLint;
exports.executeCommand = executeCommand;

exports.initializeLinterConfig = async function () {
    let initialData = ianalyzerrcInitialConfig;
    initialData = JSON.stringify(initialData, null, 4);
    writeLinterConfig(initialData);
}

function readLinterConfig(key) {
    let configData = fs.readFileSync(ianalyzerrcPath);
    configData = JSON.parse(configData)
    if (key) return configData[key];
    return configData;
}
exports.readLinterConfig = readLinterConfig;

function writeLinterConfig(data) {
    fs.writeFileSync(ianalyzerrcPath, data);
}

function updateLinterConfig(updateData) {
    return new Promise((resolve) => {
        let configData = readLinterConfig();
        for (const data in updateData) {
            configData[data] = updateData[data];
        }

        configData = JSON.stringify(configData, null, 4);
        writeLinterConfig(configData);
        resolve(true);
    });
}
exports.updateLinterConfig = updateLinterConfig;

/**
 * For deleting keys from ianalyzerrc file
 */
function deleteLinterConfig(deleteData) {
    return new Promise((resolve) => {
        let configData = readLinterConfig();
        for (const data of deleteData) {
            delete configData[data];
        }

        configData = JSON.stringify(configData, null, 4);
        writeLinterConfig(configData);
        resolve(true);
    });
}
exports.deleteLinterConfig = deleteLinterConfig;


/**
 * For creating Package Json file
 */
exports.initializePackageJson = async function () {
    let initialData = noPackageJson;
    initialData = JSON.stringify(initialData, null, 4);
    fs.writeFileSync(path.join(__dirname, './../../../package.json'), initialData);
}

/**
 * For checking required package version of user's project
 * @param key - Dependency for checking the versiom
 */
exports.getPackageVersion = function (key) {
    return new Promise((resolve) => {
        const rawdata = fs.readFileSync('package.json');
        const loadDependency = JSON.parse(rawdata);
        const keyVal = loadDependency.dependencies[key];
        let reqVersion = '';
        if (keyVal) {
            reqVersion = parseInt(keyVal.substring(1, keyVal.indexOf('.')));
        }
        resolve(reqVersion);
    });
}

exports.getProjectName = function () {
    return new Promise((resolve) => {
        const rawdata = fs.readFileSync('package.json');
        const loadDependency = JSON.parse(rawdata);
        const projName = loadDependency.name;
        resolve(projName);
    });
}

exports.getPackagesList = function (dependencies) {
    const packagesArr = [];
    if(dependencies.length) {
        dependencies.forEach((pkg) => {
            const { packageName, version } = pkg;
            let dependencyName = packageName;
            if (version && version.trim().length > 0) {
                dependencyName = dependencyName + '@' + version;
            }
            packagesArr.push(dependencyName);
        })
    }
    return packagesArr;
}

exports.isPeerDepsInstallationReqd = function () {
    return process.version && process.version.split('.')[0].slice(1,) < safeNodeVersionForPeerDeps;
}

exports.getJsLinterCommand = function () {
  let currentProfile = readLinterConfig("linterProfile");
  let jsHtmlProfile = rules_category.filter((r) => r.category === "recommended")[0].label;
  let jsLinterCommand = 
    (currentProfile === jsHtmlProfile) ? jsHtmlLintCommand : jsLintCommand;
  return jsLinterCommand;
};

exports.loggerHandler = function () {
    let util = require("util");
    let myPath = path.join(__dirname, "/../ianalyzer.log");
    let log_file = fs.createWriteStream(myPath, { flags: "a", encoding: "utf8" });
    let log_err = fs.createWriteStream(myPath, { flags: "a", encoding: "utf8" });
  
    let log_stdout = process.stdout;
    let log_stderr = process.stderr;
  
    let date = new Date();
    date = date.getTime();
  
    console.log = function (...d) {
      log_file.write(util.format(...d) + ` -${date}\n`);
      log_stdout.write(util.format(...d) + '\n');
    };
    console.error = function (...d) {
      log_err.write(util.format(...d) + ` -${date}\n`);
      log_stderr.write(util.format(...d) + '\n');
    };
};

exports.getFormatTypeForLinter = function (formatTypes, linterTypes, allReportTypeArr, type) {
    const i = linterTypes.indexOf(type);
    const reportType = allReportTypeArr.find((report) => report.type === formatTypes[i]);
    if (reportType) {
        return reportType.type;
    } else {
        return "";
    }
}

async function checkLinterPackagesInstalled (linterType) {
    let jsLinterPackageName = '';
    if(linterType === 'js-linter' && readLinterConfig('projectType') && readLinterConfig('languageType')){
        const ianalyzerDependencies = require('./ianalyzer-dependencies.json');
        let projectTypeDeps = ianalyzerDependencies?.frameworks?.filter(item => item.type === readLinterConfig('projectType'))[0];
        const languageTypeDeps = projectTypeDeps?.languageType;
        jsLinterPackageName = languageTypeDeps?.filter(item => item.subType === readLinterConfig('languageType'))[0]?.requiredPackages[0]?.packageName || '';
    } 

    const pkgNames = {
        'js-linter' : jsLinterPackageName,
        ...packagesToInstall
    }
    const pkgToCheck = pkgNames[linterType];
    
    if(!pkgToCheck || await isPackageInstalled(pkgToCheck))
        return true;

    return false;
}
exports.checkLinterPackagesInstalled = checkLinterPackagesInstalled;

exports.installRequestedLinter = async function (configData) {
    if (configData['js-linter'] && !(await checkLinterPackagesInstalled('js-linter'))) {
        console.log('\x1b[32m%s\x1b[0m', '\nStart: JS Linter installation.');
        const iAnalyzer = require('./ianalyzer-config');
        await iAnalyzer.installIAnalyzer()
        console.log("JS installation complete")
    }
    if (configData['html-linter'] && !(await checkLinterPackagesInstalled('html-linter'))) {
        console.log('\x1b[32m%s\x1b[0m', '\nStart: HTML Linter installation.');

        await htmlLinter.installHtmlLinter();
        console.log("HTML installation complete")
    }
    if (configData['css-linter'] && !(await checkLinterPackagesInstalled('css-linter'))) {
        console.log('\x1b[32m%s\x1b[0m', '\nStart: CSS Linter installation.');

        const cssConfigFileName = './.stylelintrc.json';
        const eslintConfigFilePath = path.join(__dirname, './templates/.stylelintrc.json');

        await cssLinter.installCssLinter(eslintConfigFilePath, cssConfigFileName);
        console.log("CSS installation complete")
    }
    if (configData['prettier'] && !(await checkLinterPackagesInstalled('prettier'))) {
        console.log('\x1b[32m%s\x1b[0m', '\nStarting: Prettier installation...');

        await prettier.installPrettier();
        console.log("Prettier installation complete")
    }
    if (configData['sonar-scanner'] && !(await checkLinterPackagesInstalled('sonar-scanner'))) {
        console.log('\x1b[32m%s\x1b[0m', '\nStarting: Sonarqube Scanner installation...');

        await sonarConfig.configureSonarScanner();
        console.log("Sonarqube Scanner installation complete")
    }
}
