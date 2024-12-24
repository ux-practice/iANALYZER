#!/usr/bin/env node
"use strict";

require('v8-compile-cache');

//Allowed report formats are mentioned below:
//compact, json, string, tap, unix, verbose

const { exec } = require('child_process');
const constants = require('./constants'),
      utils = require('./utils'),
      fs = require('fs');

const { allowedCSSFormats } = constants;
const outputDirectory = './reports';
let reportFilePath = '';

async function generateReport() {
  const nodeArgs = require('minimist')(process.argv.slice(2));
  const reportFormat = nodeArgs._[0] ? nodeArgs._[0].toLowerCase() : 'string';
  const linterType = nodeArgs.linter;
  const execCommand = await createReportCommand(reportFormat, linterType);
  if (execCommand) {
    executeReportCommand(execCommand);
  } else {
    console.error('\x1b[31m%s\x1b[0m', 'Error: Please select a valid report type or format.');
  }
}

function executeReportCommand(execCommand) {
  exec(execCommand, (error, data, getter) => {
    if (error && getter) {
      console.error('\x1b[31m%s\x1b[0m', `Error: ${getter} ${reportFilePath}`);
      throw error;
    }
    console.log('\x1b[32m%s\x1b[0m', `\n\nReport generated successfully and available at ${reportFilePath} location.`);
  });
}

async function createReportCommand(reportFormat, linterType) {
  console.log(`\nGenerating ${linterType} linter report in ${reportFormat} format...`);
  const fileNamePrefix = 'ianalyzer-css-report';
  const cssLintCmd = await utils.getLintCommand('css', 'Report');
  if (!fs.existsSync(outputDirectory)) fs.mkdirSync(outputDirectory);
  let execCommand;
  allowedCSSFormats.forEach((format) => {
    if (format.type === reportFormat) {
      reportFilePath = `${outputDirectory}/${fileNamePrefix}-${reportFormat}.${format.ext}`;
      execCommand = `${cssLintCmd} -f ${reportFormat} -o ${reportFilePath}`;
    }
  });
  return execCommand;
}

module.exports = generateReport();
