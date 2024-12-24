#!/usr/bin/env node
"use strict";

require('v8-compile-cache');

const readline = require('readline'),
    fs = require('fs'),
    path = require('path'),
    iAnalyzer = require('./ianalyzer-config'),
    htmlLinter = require('./html-linter-config'),
    cssLinter = require('./css-linter-config'),
    prettier = require('./prettier-config'),
    sonarConfig = require('./sonar-config'),
    utils = require('./utils'),
    constants = require('./constants'),
    ScriptData = require('./script-data'),
    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

const { allLinterOptions, jsReportCommand, htmlLintCommand,
    cssLintCommand, cssReportCommand, prettierLintCommand, defaultLinterPath } = constants

// For asking user for required package
async function askQuestion() {
    utils.loggerHandler();
    if (!fs.existsSync(path.join(__dirname, './../../../.ianalyzerrc.json'))) {
        await utils.initializeLinterConfig();
    } else{
        let configData = utils.readLinterConfig();
        await utils.installRequestedLinter(configData);
    }

    const filterOptions = [];
    if (!await iAnalyzer.isJsLinterInstalled()) {
        filterOptions.push(allLinterOptions[0]);
    } else {
        filterOptions.push(allLinterOptions[5]);
        filterOptions.push(allLinterOptions[6]);
        filterOptions.push(allLinterOptions[11]);
        filterOptions.push(allLinterOptions[12]);
        // if (!fs.existsSync('./sonar-project.properties')) {
        //    filterOptions.push(allLinterOptions[11]);
        // }
        // else {
        //     filterOptions.push(allLinterOptions[12]);
        // }
    }

    // For HTML Linter
    if (!await htmlLinter.isHtmlLinterInstalled()) {
        filterOptions.push(allLinterOptions[1]);
    } else {
        filterOptions.push(allLinterOptions[7]);
    }

    // For CSS Linter
    if (!await cssLinter.isCssLinterInstalled()) {
        filterOptions.push(allLinterOptions[2]);
    } else {
        filterOptions.push(allLinterOptions[8]);
    }

    // For Prettier
    if (!await prettier.isPrettierInstalled()) {
        filterOptions.push(allLinterOptions[3]);
    } else {
        filterOptions.push(allLinterOptions[9]);
    }

    // For Sonarqube Scanner
    if (!await sonarConfig.isSonarScannerInstalled()) {
        filterOptions.push(allLinterOptions[4]);
    }
    else{
        filterOptions.push(allLinterOptions[10]);
    }

    if (filterOptions.indexOf(allLinterOptions[5]) < 0
    && (
        filterOptions.indexOf(allLinterOptions[7]) > 0
        || filterOptions.indexOf(allLinterOptions[8]) > 0
        || filterOptions.indexOf(allLinterOptions[9]) > 0)
    ) {
        filterOptions.push(allLinterOptions[5]);
    }

    filterOptions.sort((opt1, opt2) => {
        return opt1.option - opt2.option;
    });
    let initMessage = '\nHow would you like to use iAnalyzer?\n';
    for (let i = 0; i < filterOptions.length; i++) {
        initMessage += '\n' + (i + 1) + '. ' + filterOptions[i].text;
    }
    initMessage += '\n\nYou can enter multiple options separated by comma(,): ';
    const installCodes = [0, 1, 2, 3, 4];
    const uninstallCodes = [5, 6, 7, 8, 9, 10];

    rl.question(initMessage, async (initInput) => {
        const selectOptions = initInput.split(',').map((opt) => {
            const parseOption = parseInt(opt.trim(), 10);
            //Validation for invalid option selection
            if (!(parseOption > 0 && parseOption <= filterOptions.length)) {
                console.log('\x1b[31m%s\x1b[0m', '\nPlease provide any valid option.');
                process.exit();
            }
            return parseOption;
        });

        const options = [];
        for (let i = 0; i < selectOptions.length; i++) {
            const filterOpt = filterOptions[(selectOptions[i] - 1)];
            options.push(filterOpt.option);
        }

        options.sort((a, b) => {
            return a - b;
        });

        const hasInstallCodes = installCodes.some((ic) => options.includes(ic));
        const hasUninstallCodes = uninstallCodes.some((uc) => options.includes(uc));
        if (hasInstallCodes && hasUninstallCodes) {
            console.log('\x1b[32m%s\x1b[0m', '\nYou shouldn\'t provide install and uninstall both options together.');
            process.exit();
        }
        let updateConfig = {}, currentPath;

        for (let i = 0; i < options.length; i++) {
            const opt = options[i];
            switch (opt) {
                case 0:
                    await utils.askPathIfNotExist(rl);
                    await iAnalyzer.configureLinter(rl);
                    // if (!fs.existsSync('./sonar-project.properties')) {
                    //     await sonarConfig.askUserToInitializeSonar(rl);
                    // }
                    updateConfig = {'js-linter': true,
                    'jsLintCommand': utils.getJsLinterCommand(),
                    'jsReportCommand': jsReportCommand }
                    await utils.updateLinterConfig(updateConfig);
                    await manageIAnalyzerScriptCmds();
                    console.log('\x1b[32m%s\x1b[0m', `\n${utils.readLinterConfig('linterProfile')} rules profile has been successfully configured for JS Linter.`);
                    break;
                case 1:
                    await utils.askPathIfNotExist(rl);
                    console.log('\x1b[32m%s\x1b[0m', '\nStarting: HTML Linter installation...');
                    await htmlLinter.configureHtmlLinter('init');
                    updateConfig = {'html-linter': true,
                    'htmlLintCommand': htmlLintCommand }
                    await utils.updateLinterConfig(updateConfig);
                    await manageIAnalyzerScriptCmds();
                    break;
                case 2:
                    await utils.askPathIfNotExist(rl);
                    console.log('\x1b[32m%s\x1b[0m', '\nStarting: CSS Linter installation...');
                    await cssLinter.configureCssLinter('init');
                    updateConfig = {'css-linter': true,
                    cssLintCommand,
                    cssReportCommand }
                    await utils.updateLinterConfig(updateConfig);
                    await manageIAnalyzerScriptCmds();
                    break;
                case 3:
                    await utils.askPathIfNotExist(rl);
                    console.log('\x1b[32m%s\x1b[0m', '\nStarting: Prettier installation...');
                    await prettier.configurePrettier('init');
                    updateConfig = {prettier: true,
                    prettierLintCommand }
                    await utils.updateLinterConfig(updateConfig);
                    await manageIAnalyzerScriptCmds();
                    break;
                case 4:
                    console.log('\x1b[32m%s\x1b[0m', '\nStarting: Sonarqube Scanner installation...');
                    await sonarConfig.configureSonarScanner();
                    break;
                case 5:
                    console.log('\x1b[33m%s\x1b[0m', '\nUninstalling packages. Please wait...');
                    await htmlLinter.configureHtmlLinter('remove');
                    await cssLinter.configureCssLinter('remove');
                    await prettier.configurePrettier('remove');
                    await sonarConfig.configureSonarScanner('remove');
                    await iAnalyzer.configureLinter(rl, 'remove', 'all');
                    await manageIAnalyzerScriptCmds('removeAll');
                    break;
                case 6:
                    console.log('\x1b[32m%s\x1b[0m', '\nStarting: JS Linter un-installation...');
                    await iAnalyzer.configureLinter(rl, 'remove', 'js');
                    await utils.updateLinterConfig({'js-linter': false});
                    await utils.deleteLinterConfig(['jsLintCommand', 'jsReportCommand']);
                    await manageIAnalyzerScriptCmds();
                    break;
                case 7:
                    console.log('\x1b[32m%s\x1b[0m', '\nStarting: HTML Linter un-installation...');
                    await htmlLinter.configureHtmlLinter('remove');
                    await utils.updateLinterConfig({'html-linter': false});
                    await utils.deleteLinterConfig(['htmlLintCommand']);
                    await manageIAnalyzerScriptCmds();
                    break;
                case 8:
                    console.log('\x1b[32m%s\x1b[0m', '\nStarting: CSS Linter un-installation...');
                    await cssLinter.configureCssLinter('remove');
                    await utils.updateLinterConfig({'css-linter': false});
                    await utils.deleteLinterConfig(['cssLintCommand', 'cssReportCommand']);
                    await manageIAnalyzerScriptCmds();
                    break;
                case 9:
                    console.log('\x1b[32m%s\x1b[0m', '\nStarting: Prettier un-installation...');
                    await prettier.configurePrettier('remove');
                    await utils.updateLinterConfig({prettier: false});
                    await utils.deleteLinterConfig(['prettierLintCommand']);
                    await manageIAnalyzerScriptCmds();
                    break;
                case 10:
                    console.log('\x1b[32m%s\x1b[0m', '\nStarting: Sonarqube Scanner un-installation...');
                    await sonarConfig.configureSonarScanner('remove');
                    break;
                case 11:
                    await iAnalyzer.selectLinterRule(rl, i, options);
                    break;
                case 12:
                    currentPath = await utils.getLinterPath();
                    await utils.askPathToLint(rl, currentPath || defaultLinterPath);
                    break;
                // case 11:
                //     await sonarConfig.initializeSonarProperties();
                //     break;
                // case 12:
                //     await sonarConfig.uninitializeSonarProperties();
                //     break;
                default:
                    console.log('\x1b[32m%s\x1b[0m', '\nYou have provided invalid option - ' + opt + '');
            }
        }
        process.exit();
    });
}

// For adding/removing scripts
async function manageIAnalyzerScriptCmds(manageParam) {
    return new Promise(async function (resolve) {
        const linterMainCmd = 'ianalyzer-cmd';

        let addScriptFlag = false;
        const iAnalyzerRunCmd = `${linterMainCmd}`,
            iAnalyzerFixCmd = `${linterMainCmd} fix`,
            iAnalyzerReportCmd = `${linterMainCmd} report`,
            iAnalyzerUpdateCmd = `${linterMainCmd} update`;

        if (!manageParam) {
            const isJsLinter = await iAnalyzer.isJsLinterInstalled();
            const isHtmlLinter = await htmlLinter.isHtmlLinterInstalled();
            const isCssLinter = await cssLinter.isCssLinterInstalled();
            const isPrettier = await prettier.isPrettierInstalled();
            if (isJsLinter || isHtmlLinter || isCssLinter || isPrettier) {
                addScriptFlag = true;
            }
        }

        if (addScriptFlag) {
            const scripts = [];
            let sd = '';
            sd = new ScriptData('ianalyzer', iAnalyzerRunCmd);
            scripts.push(sd);
            sd = new ScriptData('ianalyzer:fix', iAnalyzerFixCmd);
            scripts.push(sd);
            sd = new ScriptData('ianalyzer:report', iAnalyzerReportCmd);
            scripts.push(sd);
            sd = new ScriptData('ianalyzer:update', iAnalyzerUpdateCmd);
            scripts.push(sd);
            await utils.addScriptPackageJSON(scripts);
        } else {
            const removeScripts = ['ianalyzer', 'ianalyzer:fix', 'ianalyzer:report', 'ianalyzer:update', 'prettier:run', 'ianalyzer:sonar'];
            if (manageParam && manageParam === 'removeAll') {
                removeScripts.push('ianalyzer:init');
            }
            await utils.removeScriptPackageJSON(removeScripts);
        }
        resolve(true);
    });
}


module.exports = askQuestion();
