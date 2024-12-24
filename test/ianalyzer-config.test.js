const iAnalyzer = require('../bin/ianalyzer-config');
const fs = require('fs');
const utils = require('../bin/utils');

jest.mock('fs');
jest.mock('npm');
jest.mock('path');
jest.mock('../bin/utils');
let rl = {
    question: jest.fn()
        .mockImplementationOnce((questionText, cb) => { cb('Y') })
        .mockImplementationOnce((questionText, cb) => { cb('N') })
        .mockImplementationOnce((questionText, cb) => { cb('INVALID') })
        .mockImplementationOnce((questionText, cb) => { cb('fileName') })
        .mockImplementationOnce((questionText, cb) => { cb('fileName2') })
};
describe('iAnalyzer Config Test', () => {
    describe('iAnalyzer Config Install Test', () => {
        test('should install if projectType is Y', () => {
            utils.installPackages.mockResolvedValue(true);
            utils.createFileBackup.mockResolvedValue(true);
            utils.addConfigFile.mockResolvedValue(true);
            utils.addScriptPackageJSON.mockResolvedValue(true);
            utils.createNewDirectory.mockResolvedValue(true);
            expect(iAnalyzer.configureLinter(rl, 'init')).toBeTruthy();
        });

        test('should install if projectType is N', () => {
            utils.installPackages.mockResolvedValue(true);
            utils.createFileBackup.mockResolvedValue(true);
            utils.addConfigFile.mockResolvedValue(true);
            utils.addScriptPackageJSON.mockResolvedValue(true);
            utils.createNewDirectory.mockResolvedValue(true);
            expect(iAnalyzer.configureLinter(rl, 'init')).toBeTruthy();
        });

        test('should not install for invalid option', () => {
            jest.spyOn(process, 'kill').mockImplementation(() => { return Promise.resolve(true) });
            expect(iAnalyzer.configureLinter(rl, 'init')).toBeTruthy();
        });
    });

    describe('iAnalyzer Config Uninstall Test', () => {
        test('should uninstall if no file exist', () => {
            fs.existsSync.mockReturnValue(false);
            utils.isPackageInstalled.mockResolvedValueOnce(true).mockResolvedValue(false);
            utils.uninstallPackages.mockResolvedValue(true);
            utils.removeScriptPackageJSON.mockResolvedValue(true);
            expect(iAnalyzer.configureLinter(rl, 'remove')).toBeTruthy();
        });

        test('should uninstall if .eslintrc and .eslintrc-old file exist', () => {
            fs.existsSync.mockReturnValue(true);
            utils.isPackageInstalled.mockResolvedValueOnce(true).mockResolvedValue(false);
            utils.uninstallPackages.mockResolvedValue(true);
            utils.removeScriptPackageJSON.mockResolvedValue(true);
            fs.unlink.mockImplementationOnce((filename, callback) => {
                callback(null);
            });
            fs.copyFile.mockImplementationOnce((filename, newFileName, callback) => {
                callback(null);
            });
            expect(iAnalyzer.configureLinter(rl, 'remove')).toBeTruthy();
        });

        test('should uninstall if .eslintrc file exist and .eslintrc-old file not exist', () => {
            fs.existsSync.mockReturnValueOnce(true).mockReturnValue(false);
            utils.isPackageInstalled.mockResolvedValueOnce(true).mockResolvedValue(false);
            utils.uninstallPackages.mockResolvedValue(true);
            utils.removeScriptPackageJSON.mockResolvedValue(true);
            fs.unlink.mockImplementationOnce((filename, callback) => {
                callback(null);
            });
            expect(iAnalyzer.configureLinter(rl, 'remove')).toBeTruthy();
        });

        test('should throw error if error while copy from .eslintrc-old', () => {
            fs.existsSync.mockReturnValue(true);
            utils.isPackageInstalled.mockResolvedValueOnce(true).mockResolvedValue(false);
            utils.uninstallPackages.mockResolvedValue(true);
            utils.removeScriptPackageJSON.mockResolvedValue(true);
            fs.unlink.mockImplementationOnce((filename, callback) => {
                callback(null);
            });
            fs.copyFile.mockImplementationOnce((filename, newFileName, callback) => {
                callback(new Error());
            });
            expect(iAnalyzer.configureLinter(rl, 'remove')).toBeTruthy();
        });

        test('should throw error while deleting file .eslintrc', () => {
            fs.existsSync.mockReturnValue(true);
            utils.isPackageInstalled.mockResolvedValueOnce(true).mockResolvedValue(false);
            utils.uninstallPackages.mockResolvedValue(true);
            utils.removeScriptPackageJSON.mockResolvedValue(true);
            fs.unlink.mockImplementationOnce((filename, callback) => {
                callback(new Error());
            });
            expect(iAnalyzer.configureLinter(rl, 'remove')).toBeTruthy();
        });

        test('should uninstall if .eslintrc.js and .eslintrc-old file exist', () => {
            fs.existsSync.mockReturnValueOnce(false).mockReturnValue(true);
            utils.isPackageInstalled.mockResolvedValueOnce(false).mockResolvedValue(true);
            utils.uninstallPackages.mockResolvedValue(true);
            utils.removeScriptPackageJSON.mockResolvedValue(true);
            fs.unlink.mockImplementationOnce((filename, callback) => {
                callback(null);
            });
            fs.copyFile.mockImplementationOnce((filename, newFileName, callback) => {
                callback(null);
            });
            expect(iAnalyzer.configureLinter(rl, 'remove')).toBeTruthy();
        });

        test('should uninstall if .eslintrc file exist and .eslintrc-old file not exist', () => {
            fs.existsSync.mockReturnValueOnce(false).mockReturnValueOnce(true).mockReturnValue(false);
            utils.isPackageInstalled.mockResolvedValueOnce(false).mockResolvedValue(true);
            utils.uninstallPackages.mockResolvedValue(true);
            utils.removeScriptPackageJSON.mockResolvedValue(true);
            fs.unlink.mockImplementationOnce((filename, callback) => {
                callback(null);
            });
            expect(iAnalyzer.configureLinter(rl, 'remove')).toBeTruthy();
        });

        test('should throw error if error while copy from .eslintrc-old', () => {
            fs.existsSync.mockReturnValueOnce(false).mockReturnValue(true);
            utils.isPackageInstalled.mockResolvedValueOnce(false).mockResolvedValue(true);
            utils.uninstallPackages.mockResolvedValue(true);
            utils.removeScriptPackageJSON.mockResolvedValue(true);
            fs.unlink.mockImplementationOnce((filename, callback) => {
                callback(null);
            });
            fs.copyFile.mockImplementationOnce((filename, newFileName, callback) => {
                callback(new Error());
            });
            expect(iAnalyzer.configureLinter(rl, 'remove')).toBeTruthy();
        });

        test('should throw error while deleting file .eslintrc', () => {
            fs.existsSync.mockReturnValueOnce(false).mockReturnValue(true);
            utils.isPackageInstalled.mockResolvedValue(false);
            utils.uninstallPackages.mockResolvedValue(true);
            utils.removeScriptPackageJSON.mockResolvedValue(true);
            fs.unlink.mockImplementationOnce((filename, callback) => {
                callback(new Error());
            });
            expect(iAnalyzer.configureLinter(rl, 'remove')).toBeTruthy();
        });
    });

    describe('iAnalyzer Run Category Script Test', () => {
        test('should run category script for amber and .eslintrc file', () => {
            utils.isPackageInstalled.mockResolvedValueOnce(true).mockResolvedValue(false);
            fs.existsSync.mockReturnValue(true);
            let rawData = '{}';
            fs.readFileSync.mockReturnValue(rawData);
            utils.extendValueIneslint.mockResolvedValue({});
            fs.writeFileSync.mockReturnValue(true);
            expect(iAnalyzer.runCategoryScript(rl, 'amber', 0, 1)).toBeTruthy();
        });

        test('should run category script for amber and .eslintrc.js file', () => {
            utils.isPackageInstalled.mockResolvedValueOnce(true).mockResolvedValue(false);
            fs.existsSync.mockReturnValueOnce(false).mockReturnValue(true);
            let rawData = '{}';
            fs.readFileSync.mockReturnValue(rawData);
            utils.extendValueIneslint.mockResolvedValue({});
            fs.writeFileSync.mockReturnValue(true);
            expect(iAnalyzer.runCategoryScript(rl, 'amber', 0, 1)).toBeTruthy();
        });

        test('should run category script if .eslintrc file not found', () => {
            utils.isPackageInstalled.mockResolvedValueOnce(true).mockResolvedValue(false);
            fs.existsSync.mockReturnValue(false);
            let rawData = '{}';
            fs.readFileSync.mockReturnValue(rawData);
            utils.extendValueIneslint.mockResolvedValue({});
            fs.writeFileSync.mockReturnValue(true);
            expect(iAnalyzer.runCategoryScript(rl, 'amber', 0, 1)).toBeTruthy();
        });

        test('should run category script if error while writing data in file', () => {
            utils.isPackageInstalled.mockResolvedValueOnce(true).mockResolvedValue(false);
            fs.existsSync.mockReturnValue(true);
            let rawData = '{}';
            fs.readFileSync.mockReturnValue(rawData);
            utils.extendValueIneslint.mockResolvedValue({});
            fs.writeFileSync.mockImplementation(() => {
                throw new Error();
            });
            expect(iAnalyzer.runCategoryScript(rl, 'amber', 0, 1)).toBeTruthy();
        });

        test('should run category script for green', () => {
            utils.isPackageInstalled.mockResolvedValueOnce(true).mockResolvedValue(false);
            fs.existsSync.mockReturnValue(false);
            let rawData = '{}';
            fs.readFileSync.mockReturnValue(rawData);
            utils.extendValueIneslint.mockResolvedValue({});
            fs.writeFileSync.mockReturnValue(true);
            expect(iAnalyzer.runCategoryScript(rl, 'green', 0, 1)).toBeTruthy();
        });

        test('should run category script for red', () => {
            utils.isPackageInstalled.mockResolvedValueOnce(false).mockResolvedValue(true);
            fs.existsSync.mockReturnValue(false);
            let rawData = '{}';
            fs.readFileSync.mockReturnValue(rawData);
            utils.extendValueIneslint.mockResolvedValue({});
            fs.writeFileSync.mockReturnValue(true);
            expect(iAnalyzer.runCategoryScript(rl, 'red', 0, 1)).toBeTruthy();
        });

        test('should run category script for custom', () => {
            utils.isPackageInstalled.mockResolvedValueOnce(true).mockResolvedValue(false);
            fs.existsSync.mockReturnValue(false);
            let rawData = '{}';
            fs.readFileSync.mockReturnValue(rawData);
            fs.writeFileSync.mockReturnValue(true);
            expect(iAnalyzer.runCategoryScript(rl, 'custom', 0, 1)).toBeTruthy();
        });

        test('should run category script for custom if file not found', () => {
            utils.isPackageInstalled.mockResolvedValueOnce(true).mockResolvedValue(false);
            fs.existsSync.mockReturnValueOnce(false).mockReturnValueOnce(false)
                .mockReturnValue(true);
            let rawData = '{}';
            fs.readFileSync.mockReturnValue(rawData);
            expect(iAnalyzer.runCategoryScript(rl, 'custom', 0, 1)).toBeTruthy();
        });

        test('should not run category script if iAnalyzer not installed', () => {
            utils.isPackageInstalled.mockResolvedValue(false);
            expect(iAnalyzer.runCategoryScript(rl, 'red', 0, 1)).toBeTruthy();
        });

        test('should not run category script if both iAnalyzer type installed', () => {
            utils.isPackageInstalled.mockResolvedValue(true);
            expect(iAnalyzer.runCategoryScript(rl, 'red', 0, 1)).toBeTruthy();
        });
    });

});
