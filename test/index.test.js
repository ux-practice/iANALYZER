let askQuestion, cssLinter, htmlLinter, iAnalyzer;

describe('Index File Ask Question Test', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.resetModules()
        askQuestion = () => require('../bin/index');
        cssLinter = require('../bin/css-linter-config');
        htmlLinter = require('../bin/html-linter-config');
        iAnalyzer = require('../bin/ianalyzer-config');

        jest.mock('../bin/css-linter-config');
        jest.mock('../bin/html-linter-config');
        jest.mock('../bin/utils');
        jest.mock('../bin/ianalyzer-config');

        jest.spyOn(process, 'exit').mockImplementation(() => { return Promise.resolve(true) });
    })

    test('should install for options (1,2,3,7,8,9,10)', () => {
        jest.mock('readline', () => {
            return {
                createInterface: jest.fn().mockReturnValue({
                    question: jest.fn()
                        .mockImplementationOnce((questionText, cb) => { cb('1,2,3,7,8,9,10') })
                })
            }
        });
        iAnalyzer.configureLinter.mockResolvedValue(true);
        htmlLinter.configureHtmlLinter.mockResolvedValue(true);
        cssLinter.configureCssLinter.mockResolvedValue(true);
        iAnalyzer.runCategoryScript.mockResolvedValue(true);
        expect(askQuestion()).toBeDefined();
    });

    test('should uninstall for options (4,5,6)', () => {
        jest.mock('readline', () => {
            return {
                createInterface: jest.fn().mockReturnValue({
                    question: jest.fn()
                        .mockImplementationOnce((questionText, cb) => { cb('4,5,6') })
                })
            }
        });
        htmlLinter.configureHtmlLinter.mockResolvedValue(true);
        cssLinter.configureCssLinter.mockResolvedValue(true);
        iAnalyzer.configureLinter.mockResolvedValue(true);
        expect(askQuestion()).toBeDefined();
    });

    test('should not do anything for invalid option', () => {
        jest.mock('readline', () => {
            return {
                createInterface: jest.fn().mockReturnValue({
                    question: jest.fn()
                        .mockImplementationOnce((questionText, cb) => { cb('23') })
                })
            }
        });
        expect(askQuestion()).toBeDefined();
    });

    test('should not do anything if install and uninstall codes are together', () => {
        jest.mock('readline', () => {
            return {
                createInterface: jest.fn().mockReturnValue({
                    question: jest.fn()
                        .mockImplementationOnce((questionText, cb) => { cb('1,4') })
                })
            }
        });
        expect(askQuestion()).toBeDefined();
    });

});
