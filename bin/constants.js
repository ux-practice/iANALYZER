exports.rules_category = [
  { category: 'essential', option: 0, label: 'Essential', description: 'to prevent uninteded behavior' },
  { category: 'recommended', option: 1, label: 'Recommended', description: 'to further improve code quality' },
  { category: 'custom', option: 2, label: 'Custom', description: 'reads rules from user-defined file' },
  { category: 'sonar', option: 3, label: 'Sonar', description: 'shows errors which sonarqube captures' }
];
const cssLinterPackageName = ['stylelint@13.13.1', 'stylelint-config-standard@22.0.0', 'stylelint-rscss'];
exports.cssUninstallPackageName = ['stylelint', 'stylelint-config-standard', 'stylelint-rscss'];
const htmlLinterPackageName = ['w3c-html-validator'];
const prettierPackageName = ['prettier'];
const sonarScannerPackageName = ['sonarqube-scanner@3.3.0'];
exports.cssLinterPackageName = cssLinterPackageName;
exports.htmlLinterPackageName = htmlLinterPackageName;
exports.prettierPackageName = prettierPackageName;
exports.sonarScannerPackageName = sonarScannerPackageName;
exports.fileTypeArray = [".eslintrc.js", ".eslintrc.cjs", ".eslintrc.yaml", ".eslintrc.yml", ".eslintrc.json", ".eslintrc"];
exports.prettierTypeArray = [".prettierrc", ".prettierignore"];
exports.allowedFormats = [
  { type: 'html', ext: 'html' },
  { type: 'checkstyle', ext: 'xml' },
  { type: 'compact', ext: 'txt' },
  { type: 'jslint-xml', ext: 'xml' },
  { type: 'json-with-metadata', ext: 'json' },
  { type: 'json', ext: 'json' },
  { type: 'junit', ext: 'xml' },
  { type: 'stylish', ext: 'txt' },
  { type: 'tap', ext: 'txt' },
  { type: 'unix', ext: 'txt' },
  { type: 'visualstudio', ext: 'txt' },
  { type: 'sonar', ext: 'json' },
];
exports.outputDirectory = './reports';
exports.allOptions = [
  { option: 0, text: 'JS Linter.', type: 'js' },
  { option: 1, text: 'HTML Linter.', type: 'html' },
  { option: 2, text: 'CSS Linter.', type: 'css' },
  { option: 3, text: 'Prettier', type: 'prettier' },
];
exports.allLinterOptions = [
  { option: 0, text: 'Install JS Linter.' },
  { option: 1, text: 'Install HTML Linter.' },
  { option: 2, text: 'Install CSS Linter.' },
  { option: 3, text: 'Install Prettier.' },
  { option: 4, text: 'Install Sonarqube Scanner.' },
  { option: 5, text: 'Uninstall iAnalyzer completely.' },
  { option: 6, text: 'Uninstall JS Linter.' },
  { option: 7, text: 'Uninstall HTML Linter.' },
  { option: 8, text: 'Uninstall CSS Linter.' },
  { option: 9, text: 'Uninstall Prettier.' },
  { option: 10, text: 'Uninstall Sonarqube Scanner.' },
  { option: 11, text: 'Select JS Linter Rules Profile.' },
  { option: 12, text: 'Change Linter Path.' },
  // { 'option': 11, 'text': 'Initialize Sonar Properties file' },
  // { 'option': 12, 'text': 'Remove Sonar Properties file' },
];
exports.allowedCSSFormats = [
  { type: 'compact', ext: 'txt' },
  { type: 'json', ext: 'json' },
  { type: 'string', ext: 'txt' },
  { type: 'tap', ext: 'txt' },
  { type: 'unix', ext: 'txt' },
  { type: 'verbose', ext: 'txt' },
];
exports.defaultRule = 'advance';
exports.eslintPrefix = 'eslint-config-impetus-basetest';
exports.ianalyzerrcInitialConfig = {
  'js-linter': false,
  'html-linter': false,
  'css-linter': false,
  prettier: false,
  'sonar-scanner': false,
  path: '',
  projectType: '',
  languageType: '',
  linterProfile: 'Essential',
  // "sonar-properties-initialized": false
};
exports.noPackageJson = {
  scripts: {}
};
exports.jsLintCommand = 'eslint --ext ts,tsx,js,jsx,vue $path';
exports.jsHtmlLintCommand = 'eslint --ext ts,tsx,js,jsx,vue,html $path';
exports.jsReportCommand = 'eslint --quiet --ext js,jsx,snap,md,ts,tsx,vue $path';
exports.htmlLintCommand = 'html-validator $path';
exports.cssLintCommand = 'stylelint $path**/**.{css,scss,sass}';
exports.cssReportCommand = 'stylelint $path**/**.{css,scss,sass}';
exports.prettierLintCommand = 'npx prettier $path';
exports.defaultLinterPath = './';
exports.safeNodeVersionForPeerDeps = '16';
exports.sonarScannerVersion = '3.3.0';
exports.sonarProperties = '{"serverUrl":"","login":"","default":{"sonar.projectName":"","sonar.projectDescription":"","sonar.sources":"","sonar.tests":""}}'
exports.packagesToInstall = {
  'html-linter' : htmlLinterPackageName[0]?.split('@')[0] || 'w3c-html-validator',
  'css-linter' : cssLinterPackageName[0]?.split('@')[0] || 'stylelint@13.13.1',
  'prettier' : prettierPackageName[0]?.split('@')[0] || 'prettier',
  'sonar-scanner' : sonarScannerPackageName[0]?.split('@')[0] || 'sonarqube-scanner@3.3.0',
}