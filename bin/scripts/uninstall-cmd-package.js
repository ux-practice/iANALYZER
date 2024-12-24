#!/usr/bin/env node
"use strict";

require('v8-compile-cache');

const utils = require('../utils');

const uninstallPackageNames = ['@angular-eslint/schematics', '@babel/eslint-parser', 'babel-eslint'];

/**
 * For uninstalling packages installed via Cmd
 */
async function uninstallPackage() {
    let uninstallExistPackage = [];
    if(utils.isPeerDepsInstallationReqd()) {
        uninstallPackageNames.push('@babel/core');
    }
    for (let i = 0; i < uninstallPackageNames.length; i++) {
        const response = await utils.isPackageInstalled(uninstallPackageNames[i]);
        if (response === true) {
            uninstallExistPackage.push(uninstallPackageNames[i]);
        }
    }

    if (uninstallExistPackage.length > 0) {
        await utils.uninstallPackages(uninstallExistPackage);
    }
}

module.exports = uninstallPackage();
