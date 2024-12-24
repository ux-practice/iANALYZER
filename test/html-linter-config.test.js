const htmlLinter = require('../bin/html-linter-config');

const utils = require('../bin/utils');
jest.mock('../bin/utils');

describe('HTML Linter Test', () => {
    test('should install html linter', async () => {
        utils.installPackages.mockResolvedValue(true);
        let response = await htmlLinter.configureHtmlLinter('init');
        expect(response).toBeTruthy();
    });

    test('should uninstall html linter', async () => {
        utils.uninstallPackages.mockResolvedValue(true);
        let response = await htmlLinter.configureHtmlLinter('remove');
        expect(response).toBeTruthy();
    });
});
