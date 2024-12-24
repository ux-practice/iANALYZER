#!/usr/bin/env node
"use strict";

require('v8-compile-cache');

const fs = require('fs'),
    utils = require('../utils'),
    packageJson = require('../../package.json'),
    linterDependencies = require('../ianalyzer-dependencies.json');

const packageNameAboveEslint6 = '@babel/eslint-parser',
    versionNumberAboveEslint6 = '7.19.1',
    packageNameBelowEslint6 = 'babel-eslint',
    versionNumberBelowEslint6 = '10.1.0',
    peerDependencies = [
        {
            packageName: '@babel/core',
            version: '^7.11.0'
        },
    ];
let rcFilePath = '',
    templateJson = '';

/**
 * For updating parser in json file
 */
async function runCmdCommand() {
    const packageVersion = await utils.getPackageVersion('eslint');
    await setRcFilePath();

    let installPackName = [`${packageNameAboveEslint6}@${versionNumberAboveEslint6}`];
    if (packageVersion && packageVersion < 7) {
        installPackName = [`${packageNameBelowEslint6}@${versionNumberBelowEslint6}`];
        templateJson.parser = packageNameBelowEslint6;
        const data = JSON.stringify(templateJson, null, 4);
        fs.writeFileSync(rcFilePath, data);
    }
    if(utils.isPeerDepsInstallationReqd()) {
        peerDependencies.forEach(pkg => {
            const { packageName, version } = pkg;
            installPackName.push(`${packageName}@${version}`);
        })
    }
    await utils.installPackages(installPackName, true);
}

// For setting rc file path for
async function setRcFilePath() {
    const iAnalyzerDependencies = [...linterDependencies.frameworks];
    const configData = utils.readLinterConfig();
    const projTypeArr = iAnalyzerDependencies.filter((obj) => obj.type === configData.projectType);
    const projTypeObj = projTypeArr[0];
    templateJson = require(`../${projTypeObj.languageType[0].eslintrcPath}`);
    rcFilePath = `./node_modules/${packageJson.name}/bin/${projTypeObj.languageType[0].eslintrcPath}`;
}

module.exports = runCmdCommand();
