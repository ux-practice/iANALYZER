#!/usr/bin/env node
"use strict";

require("v8-compile-cache");

const fs = require('fs'),
    path = require('path'),
    utils = require('./bin/utils'),
    ScriptData = require('./bin/script-data');

async function initializeConfig() {
    let scripts = [];
    let iAnalyzerInitCmd = `ianalyzer --init`;
    let sd = new ScriptData('ianalyzer:init', iAnalyzerInitCmd);
    scripts.push(sd);

    if (!fs.existsSync(path.join(__dirname, './../../package.json'))) {
        await utils.initializePackageJson();
    } else {
        await utils.addScriptPackageJSON(scripts, path.join(__dirname, './../../package.json'));
    }

    if (!fs.existsSync(path.join(__dirname, './../../.ianalyzerrc.json'))) {
        await utils.initializeLinterConfig();
        // require('./bin/index');
    } else {
        let configData = utils.readLinterConfig();
        await utils.installRequestedLinter(configData);
    }
}

module.exports = initializeConfig();
