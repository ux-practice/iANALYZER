#!/usr/bin/env node
"use strict";

require('v8-compile-cache');

const fs = require('fs'),
    utils = require('./utils'),
    path = require('path'),
    constants = require('./constants'),
    prettierIgnoreFilename = '.prettierignore';

const prettierIngoreFilePath = path.join(__dirname, `templates/${prettierIgnoreFilename}`);
const { prettierPackageName, prettierTypeArray } = constants;

// For starting the configuration for prettier
function configurePrettier(param) {
    return new Promise(function (resolve) {
        if (param === 'remove') {
            uninstallPrettier().then(() => { resolve(true) });
        } else {
            installPrettier().then(() => { resolve(true) });
        }
    });
}

function isPrettierInstalled() {
    return new Promise(async function (resolve) {
        const configData = utils.readLinterConfig();
        resolve(configData.prettier);
    })
}

async function installPrettier() {
    await utils.installPackages(prettierPackageName, true);

    // For adding prettierrc file
    await utils.createFileBackup(prettierTypeArray, '_backup');
    const eslintrcFilePath = path.join(__dirname, 'templates/prettier.json');
    await utils.addConfigFile(eslintrcFilePath, '.prettierrc', true);
    await utils.addConfigFile(prettierIngoreFilePath, prettierIgnoreFilename, true);

    return true;
}

async function uninstallPrettier() {
    if (await isPrettierInstalled()) {
        await utils.removeConfigFile(prettierIgnoreFilename);  // Remove prettierignore file
        // For restoring backup file
        const fileExist = fs.existsSync('.prettierrc');
        if (fileExist) {
            fs.unlink('.prettierrc', (err) => {
                if (err) throw err;
            });
            await utils.restoreBackupFile(prettierTypeArray, '_backup');
        }

        await utils.uninstallPackages(prettierPackageName);
    }
}

module.exports = { configurePrettier, isPrettierInstalled, installPrettier };
