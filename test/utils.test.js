const utils = require('../bin/utils');

const fs = require('fs');
const npm = require('npm');
const ScriptData = require('../bin/script-data');
jest.mock('fs');
jest.mock('npm');

describe('Utils Test', () => {

    describe('Install Packages Test', () => {
        test('should install package as dev', async () => {
            npm.commands = jest.fn();
            npm.commands['install'] = jest.fn();
            npm.load.mockImplementationOnce((config, callback) => {
                callback(null);
            });
            npm.commands.install.mockImplementationOnce((packages, callback) => {
                callback(null);
            });
            npm.on.mockImplementationOnce((log, callback) => {
                callback(null);
            });
            let response = await utils.installPackages(['package'], true);
            expect(response).toBeTruthy();
        });

        test('should throw error install package', async () => {
            npm.commands = jest.fn();
            npm.commands['install'] = jest.fn();
            npm.load.mockImplementationOnce((config, callback) => {
                callback(null);
            });
            npm.commands.install.mockImplementationOnce((packages, callback) => {
                callback(new Error());
            });
            expect(utils.installPackages()).rejects.toThrow();
        });
    });

    describe('Uninstall Packages Test', () => {
        test('should uninstall package', async () => {
            npm.commands = jest.fn();
            npm.commands['uninstall'] = jest.fn();
            npm.load.mockImplementationOnce((callback) => {
                callback(null);
            });
            npm.commands.uninstall.mockImplementationOnce((packages, callback) => {
                callback(null);
            });
            npm.on.mockImplementationOnce((log, callback) => {
                callback(null);
            });
            let response = await utils.uninstallPackages(['package']);
            expect(response).toBeTruthy();
        });

        test('should throw error uninstall package', async () => {
            npm.commands = jest.fn();
            npm.commands['uninstall'] = jest.fn();
            npm.load.mockImplementationOnce((callback) => {
                callback(null);
            });
            npm.commands.uninstall.mockImplementationOnce((packages, callback) => {
                callback(new Error());
            });
            expect(utils.uninstallPackages()).rejects.toThrow();
        });
    });

    describe('Add Config File Test', () => {
        test('should add config file with force enabled', async () => {
            fs.existsSync.mockReturnValue(true);
            fs.copyFileSync.mockReturnValue(true);
            let response = await utils.addConfigFile('filePath', 'fileName', true);
            expect(response).toBeTruthy();
        });

        test('should add config file with force disabled', async () => {
            fs.existsSync.mockReturnValue(true);
            fs.copyFileSync.mockReturnValue(true);
            let response = await utils.addConfigFile('filePath', 'fileName', false);
            expect(response).toBeTruthy();
        });

        test('should throw error for add config file', async () => {
            fs.existsSync.mockReturnValue(false);
            fs.copyFileSync = jest.fn(() => { throw new Error() });
            expect(utils.addConfigFile('filePath', 'fileName')).rejects.toThrow();
        });
    });

    describe('Remove Config File Test', () => {
        jest.mock('fs', () => {
            const mFs = { unlink: jest.fn() };
            return mFs;
        });

        test('should remove config file if exist', async () => {
            fs.existsSync.mockReturnValue(true);
            fs.unlink.mockImplementationOnce((filename, callback) => {
                callback(null);
            });
            let response = await utils.removeConfigFile('fileName');
            expect(response).toBeTruthy();
        });

        test('should remove config file if not exist', async () => {
            fs.existsSync.mockReturnValue(false);
            let response = await utils.removeConfigFile('fileName');
            expect(response).toBeTruthy();
        });

        test('should throw error when remove config file', async () => {
            fs.existsSync.mockReturnValue(true);
            fs.unlink.mockImplementationOnce((filename, callback) => {
                callback(new Error());
            });
            expect(utils.removeConfigFile('fileName')).rejects.toThrow();
        });
    });

    describe('Add Script Package JSON Test', () => {
        test('should add script to package json file if no script available', async () => {
            let scripts = [];
            let sd = new ScriptData('name', 'value');
            scripts.push(sd);
            let rawData = '{}';
            fs.readFileSync.mockReturnValue(rawData);
            fs.writeFileSync.mockReturnValue(true);
            let response = await utils.addScriptPackageJSON(scripts);
            expect(response).toBeTruthy();
        });

        test('should add script to package json file if some script available', async () => {
            let rawData = '{"scripts":[]}';
            fs.readFileSync.mockReturnValue(rawData);
            fs.writeFileSync.mockReturnValue(true);
            let response = await utils.addScriptPackageJSON();
            expect(response).toBeTruthy();
        });
    });

    describe('Remove Script Package JSON Test', () => {
        test('should remove script from package json file if no script available', async () => {
            let rawData = '{}';
            fs.readFileSync.mockReturnValue(rawData);
            fs.writeFileSync.mockReturnValue(true);
            let response = await utils.removeScriptPackageJSON();
            expect(response).toBeTruthy();
        });

        test('should remove script from package json file if script available', async () => {
            let scripts = [];
            scripts.push('name');
            let rawData = '{"scripts":[]}';
            fs.readFileSync.mockReturnValue(rawData);
            fs.writeFileSync.mockReturnValue(true);
            let response = await utils.removeScriptPackageJSON(scripts);
            expect(response).toBeTruthy();
        });
    });

    describe('Create File Backup Test', () => {
        jest.mock('fs', () => {
            const mFs = {
                renameSync: jest.fn(),
                existsSync: jest.fn()
            };
            return mFs;
        });

        test('should create file backup if file exist', async () => {
            fs.existsSync.mockReturnValue(true);
            fs.renameSync.mockImplementationOnce((filename, newFileName, callback) => {
                callback(null);
            });
            const fileNameArray = ['fileName'];
            let response = await utils.createFileBackup(fileNameArray);
            expect(response).toBeTruthy();
        });

        test('should create file backup if file not exist', async () => {
            fs.existsSync.mockReturnValue(false);
            const fileNameArray = ['fileName'];
            let response = await utils.createFileBackup(fileNameArray);
            expect(response).toBeTruthy();
        });

        test('should throw error when create file backup if file exist', async () => {
            fs.existsSync.mockReturnValue(true);
            fs.renameSync.mockImplementationOnce((filename, newFileName, callback) => {
                callback(new Error());
            });
            const fileNameArray = ['fileName'];
            expect(utils.createFileBackup(fileNameArray)).rejects.toThrow();
        });

        test('call create file backup with blank array', async () => {
            let response = await utils.createFileBackup();
            expect(response).toBeTruthy();
        });
    });

    describe('Create New Directory Test', () => {
        test('should create new directory if does not exist', async () => {
            let dirPath = 'path';
            fs.existsSync.mockReturnValue(false);
            fs.mkdirSync.mockReturnValue(true);
            let response = await utils.createNewDirectory(dirPath);
            expect(response).toBeTruthy();
        });

        test('should skip create new directory if exist', async () => {
            let dirPath = 'path';
            fs.existsSync.mockReturnValue(true);
            let response = await utils.createNewDirectory(dirPath);
            expect(response).toBeTruthy();
        });
    });

    describe('Extend Value In Eslint Test', () => {
        test('should extend value in eslint with option 0', async () => {
            let parsedRowData = { 'extends': [] };
            let response = await utils.extendValueIneslint(parsedRowData, 0, 'entry');
            expect(response).toBeTruthy();
        });

        test('should extend value in eslint with option 1', async () => {
            let parsedRowData = { 'extends': ['entry'] };
            let response = await utils.extendValueIneslint(parsedRowData, 1, 'entry');
            expect(response).toBeTruthy();
        });

        test('should extend value in eslint with no parse row data', async () => {
            let parsedRowData = {};
            let response = await utils.extendValueIneslint(parsedRowData, 0, 'entry');
            expect(response).toBeTruthy();
        });
    });

    describe('Is Package Installed Test', () => {
        test('should resolve true if package exist in dependencies', async () => {
            fs.readFileSync.mockReturnValue('{"dependencies":{"valid":"1.0.1"}}');
            let response = await utils.isPackageInstalled ('valid');
            expect(response).toBeTruthy();
        });

        test('should resolve true if package exist in dev dependencies', async () => {
            fs.readFileSync.mockReturnValue('{"devDependencies":{"valid":"1.0.1"}}');
            let response = await utils.isPackageInstalled ('valid');
            expect(response).toBeTruthy();
        });

        test('should resolve false if package not exist', async () => {
            fs.readFileSync.mockReturnValue('{}');
            let response = await utils.isPackageInstalled ('invalid');
            expect(response).toBeFalsy();
        });
    });
});
