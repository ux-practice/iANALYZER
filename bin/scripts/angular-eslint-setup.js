#!/usr/bin/env node
"use strict";

require('v8-compile-cache');

const utils = require('../utils');

const cmdAngular = ["ng add @angular-eslint/schematics --skip-confirmation=true",
"ng g @angular-eslint/schematics:convert-tslint-to-eslint your_project_name"];

async function runCmdCommand() {
    const angVersion = await utils.getPackageVersion('@angular/core');
    for (let j = 0; j < cmdAngular.length; j++) {
        let pckgToInstall = cmdAngular[j];
        if (j > 0 && angVersion < 12 && pckgToInstall.indexOf('your_project_name') > 0) {
            const projName = await utils.getProjectName();
            pckgToInstall = pckgToInstall.replace('your_project_name', projName);
        }
        if (j === 0 || angVersion < 12) {
            await utils.executeCommand(pckgToInstall, true);
        }
    }
}

module.exports = runCmdCommand();
