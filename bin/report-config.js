#!/usr/bin/env node
"use strict";

require('v8-compile-cache');

const constants = require('./constants');
const sonarConfig = require('./sonar-config');
const utils = require('./utils');

/* Allowed report formats are mentioned below:
html, checkstyle, compact, jslint-xml,
json-with-metadata, json, junit, stylish, tap, unix, visualstudio, sonar */

const { exec } = require('child_process');
const { allowedFormats, outputDirectory } = constants;

let reportFilePath = '';

async function generateReport() {
  const nodeArgs = require('minimist')(process.argv.slice(2));
  const reportFormat = nodeArgs._[0] ? nodeArgs._[0].toLowerCase() : 'html';
  const lintingType = !!nodeArgs.ext && nodeArgs.ext === 'html' ? 'html-lint' : 'lint';
  const linterType = nodeArgs.linter;

  const execCommand = await createReportCommand(reportFormat, lintingType, linterType);
  if (execCommand) {
    executeReportCommand(execCommand, reportFormat);
  } else {
    console.error('\x1b[31m%s\x1b[0m', '\nError: Please select a valid report command.');
  }
}

function executeReportCommand(execCommand, reportFormat) {
  exec(execCommand, (error, data, getter) => {
    if (error && getter) {
      console.error('\x1b[31m%s\x1b[0m', `\nError: ${getter} ${reportFilePath}`);
      throw error;
    }
    if (reportFormat === 'sonar') {
      sonarConfig.createSonarConfigJson(reportFilePath);
    }
    console.log('\x1b[32m%s\x1b[0m', `\n\nReport generated successfully and available at ${reportFilePath} location.`);
  });
}

async function createReportCommand(reportFormat, lintingType, linterType) {
  console.log(`\nGenerating ${linterType} linter report in ${reportFormat} format...`);
  let commonCommand;
  let fileNamePrefix;
  if (lintingType === 'lint') {
    commonCommand = await utils.getLintCommand('js', 'Report');
    fileNamePrefix = 'ianalyzer-report';
  } else {
    return;
  }
  if (commonCommand === '') {
    return;
  }
  let execCommand;
  allowedFormats.forEach((format) => {
    if (format.type === reportFormat) {
      reportFilePath = `${outputDirectory}/${fileNamePrefix}-${reportFormat}.${format.ext}`;
      if (reportFormat === 'sonar') {
        execCommand = `${commonCommand} --format json > ${reportFilePath}`;
        return;
      }
      execCommand = `${commonCommand} --format ${reportFormat} > ${reportFilePath}`;
    }
  });
  return execCommand;
}

module.exports = generateReport();
