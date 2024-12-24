#!/usr/bin/env node
"use strict";

require('v8-compile-cache');

const utils = require('./utils'),
    constants = require('./constants');

const { htmlLinterPackageName } = constants;

// For starting the configuration for iAnalyzer html
function configureHtmlLinter(param) {
    return new Promise(function (resolve) {
        if (param === 'remove') {
            uninstallHtmlLinter().then(() => { resolve(true) });
        } else {
            installHtmlLinter().then(() => { resolve(true) });
        }
    });
}

function isHtmlLinterInstalled() {
    return new Promise(async function (resolve) {
        const configData = utils.readLinterConfig();
        resolve(configData['html-linter']);
    })
}

async function installHtmlLinter() {
    await utils.installPackages(htmlLinterPackageName, true);
    return true;
}

async function uninstallHtmlLinter() {
    if (await isHtmlLinterInstalled()) {
        await utils.uninstallPackages(htmlLinterPackageName);
    }
}

module.exports = { configureHtmlLinter, isHtmlLinterInstalled, installHtmlLinter };
