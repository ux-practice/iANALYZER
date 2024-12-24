const cssLinter = require('../bin/css-linter-config');

const utils = require('../bin/utils');
jest.mock('../bin/utils');

describe('CSS Linter Test', () => {
    test('should install css linter', async () => {
        utils.installPackages.mockResolvedValue(true);
        let response = await cssLinter.configureCssLinter('init');
        expect(response).toBeTruthy();
    });

    test('should uninstall css linter', async () => {
        utils.uninstallPackages.mockResolvedValue(true);
        let response = await cssLinter.configureCssLinter('remove');
        expect(response).toBeTruthy();
    });
});
