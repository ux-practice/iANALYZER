#!/usr/bin/env node
"use strict";

require('v8-compile-cache');

const readline = require('readline'),
    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

const utils = require('./utils'),
    iAnalyzer = require('./ianalyzer-config'),
    htmlLinter = require('./html-linter-config'),
    cssLinter = require('./css-linter-config'),
    prettier = require('./prettier-config'),
    sonarConfig = require('./sonar-config'),
    constants = require('./constants');

// Linter type option: lint-html, lint-css

const { allOptions, allowedFormats, allowedCSSFormats } = constants;

async function runCommands() {
    const nodeArgs = require('minimist')(process.argv.slice(2));
    // console.log(nodeArgs);

    const filterOptions = [];

    // to handle cicd pipeline args for linter type and format
    let isExtraArgs = false, linterTypes = [], formatTypes = [], fixArg = false;
    if (process.env.npm_config_linters) {
        linterTypes = process.env.npm_config_linters.split(","); 
        isExtraArgs = true;
    }

    if (process.env.npm_config_formats) {
        formatTypes = process.env.npm_config_formats.split(",");
        isExtraArgs = true;
    }

    if(process.env.npm_config_fix) fixArg = true;

    if (await iAnalyzer.isJsLinterInstalled()) {
        filterOptions.push(allOptions[0]);
    }
    if (nodeArgs._.indexOf('report') === -1 && await htmlLinter.isHtmlLinterInstalled()) {
        filterOptions.push(allOptions[1]);
    }
    if (await cssLinter.isCssLinterInstalled()) {
        filterOptions.push(allOptions[2]);
    }
    if (nodeArgs._.indexOf('report') === -1 && await prettier.isPrettierInstalled()) {
        filterOptions.push(allOptions[3]);
    }
    if (nodeArgs._.indexOf('sonar') !== -1) {
        await sonarConfig.runSonarScanner(nodeArgs);
    }

    const options = [];
    if (isExtraArgs && filterOptions.length > 0) {
        if (linterTypes.length > 0) {
            linterTypes.forEach((type) => {
                const filterObj = filterOptions.find(item => item.type === type);
                if (filterObj) {
                    options.push(filterObj.option);
                } else {
                    console.error('\x1b[31m%s\x1b[0m', 'Invalid linter type');
                    process.exit();
                }
            });
        } else if (linterTypes.length === 0 && filterOptions.length === 1) {
            linterTypes.push(filterOptions[0].type); 
            options.push(filterOptions[0].option);
        } else {
            console.error('\x1b[31m%s\x1b[0m', 'Please add atleast one linter type in command');
        }        
    } else if (filterOptions.length === 1) {
        options.push(filterOptions[0].option);
    }
    else if (filterOptions.length > 1) {
        let initMessage = 'Please choose linter type from below options';
        for (let i = 0; i < filterOptions.length; i++) {
            initMessage += '\n' + (i + 1) + '. ' + filterOptions[i].text;
        }
        initMessage += '\n\nYou can enter multiple options separated by comma(,):  ';
        const questionForOptionSelection = function () {
            return new Promise((resolve) => {
                rl.question(initMessage, async (initInput) => {
                    const selectOptions = initInput.split(',').map((opt) => {
                        const parseOption = parseInt(opt.trim(), 10);
                        //Validation for invalid option selection
                        if (!(parseOption > 0 && parseOption <= filterOptions.length)) {
                            console.log('\x1b[31m%s\x1b[0m', '\nPlease provide valid option.');
                            process.exit();
                        }
                        return parseOption;
                    });

                    for (let i = 0; i < selectOptions.length; i++) {
                        const filterOpt = filterOptions[(selectOptions[i] - 1)];
                        options.push(filterOpt.option);
                    }
                    resolve(true);
                });
            });
        }
        await questionForOptionSelection();
    } else if(nodeArgs._.indexOf('sonar') === -1){
        if (
            (nodeArgs._.indexOf('report') !== -1) && (nodeArgs._[1] && nodeArgs._[1].toLowerCase() === 'sonar')
        ) {
            console.error('\x1b[31m%s\x1b[0m', 'Please install iAnalyzer before using this command.');
            process.exit();
        }
        console.error('\x1b[31m%s\x1b[0m', 'Please install atleast one service before using this command.');
        return;
    }
    for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        let isJsLint = false, isHtmlLint = false, isCssLint = false, isPrettier = false;
        let currentOptionText = '';
        let currentLinter = '';
        switch (opt) {
            case 0:
                currentOptionText = allOptions[0].text;
                isJsLint = true;
                currentLinter = allOptions[0].type;
                break;
            case 1:
                currentOptionText = allOptions[1].text;
                isHtmlLint = true;
                currentLinter = allOptions[1].type;
                break;
            case 2:
                currentOptionText = allOptions[2].text;
                isCssLint = true;
                currentLinter = allOptions[2].type;
                break;
            case 3:
                currentOptionText = allOptions[3].text;
                isPrettier = true;
                currentLinter = allOptions[3].type;
                break;
            default:
                console.error('\x1b[31m%s\x1b[0m', '\nInvalid option received - ' + opt + '');
                return;
        }

        let execCommand = '';
        const linterProfile = utils.readLinterConfig('linterProfile');

        if(process.env.npm_config_init) {
            execCommand = 'ianalyzer --init';
        }
        else if ((nodeArgs._.indexOf('run') !== -1) || (nodeArgs._.indexOf('fix') !== -1) || (nodeArgs._.length == 0) || (isExtraArgs && nodeArgs._.length == 0) || fixArg) {
            const isFixCmd = (nodeArgs._.indexOf('fix') !== -1) || fixArg;
            console.log('\x1b[32m%s\x1b[0m', `\nAnalyzing ${linterProfile} profile with ${currentOptionText}...\n`);

            execCommand = await utils.getLintCommand(currentLinter, 'Lint');
            if (isPrettier) {
                execCommand += (isFixCmd ? ' --write' : ' --check');
            } else {
                execCommand += (isFixCmd ? ' --fix' : '');
            }
        } else if (nodeArgs._.indexOf('report') !== -1) {
            // console.log('\x1b[32m%s\x1b[0m', `\nGenerating report for ${currentOptionText}...\n`);

            const directArgs = [...nodeArgs._];
            const reportTypeArr = allowedFormats.filter((obj) => directArgs.includes(obj.type));
            let selectedType = (reportTypeArr && reportTypeArr.length > 0) ? reportTypeArr[0].type : '';
            let allReportTypeArr = [...allowedFormats];

            if (isCssLint) {
                allReportTypeArr = [...allowedCSSFormats];
                const cssReportTypeArr = allowedCSSFormats.filter(
                    (obj) => directArgs.includes(obj.type)
                );
                selectedType = (cssReportTypeArr && cssReportTypeArr.length > 0) ? cssReportTypeArr[0].type : '';
            }

            if ((!selectedType || selectedType.length <= 0) && !isExtraArgs) {
                const questionForReportType = function () {
                    return new Promise(async function (resolve) {
                        let reportTypeQuestion = `\nPlease choose report types for ${currentOptionText}`;
                        for (let j = 0; j < allReportTypeArr.length; j++) {
                            reportTypeQuestion += '\n' + (j + 1) + '. ' + allReportTypeArr[j].type;
                        }
                        reportTypeQuestion += `\n\nPlease provide any one option to generate report for ${currentOptionText}: `;
                        rl.question(reportTypeQuestion, async (initInput) => {
                            if (initInput.trim().length > 0) {
                                const parseOption = parseInt(initInput.trim(), 10);
                                //Validation for invalid option selection
                                if (!(parseOption > 0 && parseOption <= allReportTypeArr.length)) {
                                    selectedType = 'invalid';
                                } else {
                                    selectedType = allReportTypeArr[parseOption - 1].type;
                                }
                            }
                            resolve(true);
                        });
                    });
                }
                await questionForReportType();
            }

            if(isExtraArgs && formatTypes.length > 0) {
                selectedType = utils.getFormatTypeForLinter(formatTypes, linterTypes, allReportTypeArr, currentLinter);

                if (!selectedType) {
                    console.error('\x1b[31m%s\x1b[0m', '\nError: Please select a valid report command.');
                    process.exit();
                }
            }

            if (isHtmlLint) {
                // allReportTypeArr = allReportTypeArr.filter(obj => obj.type !== 'sonar')
                execCommand = `ianalyzer-report ${selectedType}`;
            } else if (isCssLint) {
                execCommand = `ianalyzer-css-report ${selectedType} --linter=${currentLinter}`;
            } else if (isJsLint) {
                execCommand = `ianalyzer-report ${selectedType}  --linter=${currentLinter}`;
            }
        } else if (nodeArgs._.indexOf('update') !== -1) {
            console.log('\x1b[32m%s\x1b[0m', 'Updating iAnalyzer Config...');
            execCommand = 'npm i -D eslint-config-impetus-basetest@latest';
        } else if (nodeArgs._.indexOf('init') !== -1) {
            // console.log('\x1b[32m%s\x1b[0m', 'Init Config...');
            execCommand = 'ianalyzer --init';
        }else {
            console.log('Error with commands');
        }

        if (execCommand) {
            await utils.executeCommand(execCommand, false);
        } else {
            console.error('\x1b[31m%s\x1b[0m', '\nError: Please provide a valid command.');
        }
    }
    process.exit();
}

module.exports = runCommands();
