#!/usr/bin/env node
'use strict';

require('v8-compile-cache');
const path = require('path'),
    fs = require('fs');

const utils = require('./utils'),
ScriptData = require('./script-data'),
constants = require('./constants');

const sonarPropFileName = 'sonar-project.properties';
const sonarPropFilePath = path.join(__dirname, sonarPropFileName);

const { sonarProperties, sonarScannerVersion } = constants;

async function initializeSonarProperties() {
    await utils.addConfigFile(sonarPropFilePath, path.join(__dirname, './../../../sonar-project.properties'), true);
    await utils.updateLinterConfig({'sonar-properties-initialized': true});
    console.log('\x1b[32m%s\x1b[0m', `\n\nSonar project properties file has been initialized at ./${sonarPropFileName}. Please configure the desired properties values as per your server configuration. 
    \n\nPlease make sure sonar.externalIssuesReportPaths correctly points to Sonar report created through JS Linter, to see all the issues on your Sonar dashboard.`);
    return true;
}

async function uninitializeSonarProperties() {
    await utils.removeConfigFile(sonarPropFileName);
    console.log('\x1b[32m%s\x1b[0m', '\nSonar project properties removed successfully.');
    return true;
}

async function askUserToInitializeSonar(rl) {
    return new Promise(function (resolve) {
        rl.question('\nDo you want to import JS Linter report on SonarQube dashboard? Y/N (Y) :', async function (value) {
            const val = value.toUpperCase();
            if (val.length === 0 || val === 'Y') {
                await initializeSonarProperties();
            } else {
                await utils.updateLinterConfig({'sonar-properties-initialized': false});
            }
            resolve();
        })
    })
}

const createSonarConfigJson = (reportFilePath) => {
    let iAnalyzerEslintRules = fs.readFileSync(path.join(__dirname, '../../eslint-config-impetus-basetest/rules/master-ruleset-eslint.json'));
    iAnalyzerEslintRules = JSON.parse(iAnalyzerEslintRules)

    let issues = [];
    const sonarConfig = { iAnalyzerEslintRules }
    let jsonReport = fs.readFileSync(reportFilePath);
    jsonReport = JSON.parse(jsonReport)

    jsonReport.forEach((file) => {
        const t = file.messages.map((el) => {
            const error = {}
            error.engineId = 'IANALYZER';
            error.ruleId = el.ruleId;
            error.severity = sonarConfig[el.ruleId] ? sonarConfig.severity : 'MAJOR';
            error.type = sonarConfig[el.ruleId] ? sonarConfig.type : 'CODE_SMELL';
            error.effortMinutes = sonarConfig[el.effortMinutes] ? sonarConfig[el.effortMinutes] : 5;
            error.primaryLocation = {
                message: el.message,
                filePath: file.filePath,
                textRange: {
                    startLine: el.line,
                    endLine: el.endLine,
                    startColumn: el.column - 1,
                    endColumn: el.endColumn - 1
                }
            }
            return error;
        })
        issues = issues.concat(t)
    })

    let sonarIssues = { issues: [...issues] }
    sonarIssues = JSON.stringify(sonarIssues);

    fs.writeFileSync(reportFilePath, sonarIssues);
}

async function addSonarqubeScanner() {
    let execCommand = `npm i sonarqube-scanner@${sonarScannerVersion}`;

    if (execCommand) {
        await utils.executeCommand(execCommand, false);
    } else {
        console.error('\x1b[31m%s\x1b[0m', '\nError encountered while installing sonarqube-scanner');
    }

    await utils.updateLinterConfig({'sonar-scanner': true});
    await utils.updateLinterConfig({'sonarProperties': JSON.parse(sonarProperties)});

    const scripts = [];
    let sd = new ScriptData('ianalyzer:sonar', 'ianalyzer-cmd sonar');
    scripts.push(sd);
    await utils.addScriptPackageJSON(scripts);
}

async function removeSonarqubeScanner(){
    await utils.uninstallPackages([`sonarqube-scanner`]);
    await utils.deleteLinterConfig(['sonar-scanner', 'sonarProperties']);

    const removeScripts = ['ianalyzer:sonar'];
    await utils.removeScriptPackageJSON(removeScripts);
}

function configureSonarScanner(param) {
    return new Promise(function (resolve) {
        if (param === 'remove') {
            removeSonarqubeScanner().then(() => { resolve(true) });
        } else {
            addSonarqubeScanner().then(() => { resolve(true) });
        }
    });
}

function isSonarScannerInstalled () {
    return new Promise(async function (resolve) {
        const configData = utils.readLinterConfig('sonar-scanner');
        if (configData) {
            resolve(true);
        } else {
            resolve(false);
        }
    });
}

async function runSonarScanner(nodeArgs) {
    let userSonarProperties = utils.readLinterConfig('sonarProperties');
    let projectName = '', execCommand = '';
    let scanner = null;
    let pathToCheck = path.join(__dirname, './../../../sonar-project.properties');

    if(nodeArgs && nodeArgs._[1])
    {
        projectName = nodeArgs._[1];
        scanner = require('sonarqube-scanner');
    } else {
        if (fs.existsSync(pathToCheck)) {
            console.log('sonar-project.properties exists..');
            execCommand = 'sonar-scanner';
        } else{
            projectName='default';
            scanner = require('sonarqube-scanner');
        }
    }

    console.log('\x1b[32m%s\x1b[0m', '\nStarting: Sonarqube scanner...');
    if (scanner) {
        let { serverUrl, login, [projectName] : options} = userSonarProperties;
        let scannerProperties = { serverUrl, login, options};
        
        await scanner( 
            scannerProperties,
            () => process.exit(),
        );
        process.exit();
    } else {
        if (fs.existsSync(pathToCheck) && execCommand) {
            await utils.executeCommand(execCommand, false);
        } 
    }
}

module.exports = {
    initializeSonarProperties,
    uninitializeSonarProperties,
    createSonarConfigJson,
    askUserToInitializeSonar,
    isSonarScannerInstalled,
    configureSonarScanner,
    runSonarScanner,
    addSonarqubeScanner,
};
