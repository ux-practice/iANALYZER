#!/usr/bin/env node
"use strict";

require('v8-compile-cache');

const utils = require('./utils'),
    constants = require('./constants');

const { cssLinterPackageName, cssUninstallPackageName } = constants;

const cssConfigFileName = '.stylelintrc.json';
const path = require('path'),
    eslintConfigFilePath = path.join(__dirname, `/templates/${cssConfigFileName}`);

// For starting the configuration for iAnalyzer css
function configureCssLinter(param) {
    return new Promise((resolve) => {
        if (param === 'remove') {
            uninstallCssLinter().then(() => { resolve(true) });
        } else {
            installCssLinter(eslintConfigFilePath, cssConfigFileName).then(() => { resolve(true) });
        }
    });
}

function isCssLinterInstalled() {
    return new Promise(async function (resolve) {
        const configData = utils.readLinterConfig();

        resolve(configData['css-linter']);
    })
}

async function installCssLinter(eslintConfigPath, cssConfigName) {
    await utils.installPackages(cssLinterPackageName, true);
    await utils.addConfigFile(eslintConfigPath, cssConfigName, true);
    return true;
}

async function uninstallCssLinter() {
    if (await isCssLinterInstalled()) {
        await utils.uninstallPackages(cssUninstallPackageName);
        await utils.removeConfigFile(cssConfigFileName);
    }
}

module.exports = { configureCssLinter, isCssLinterInstalled, installCssLinter };
