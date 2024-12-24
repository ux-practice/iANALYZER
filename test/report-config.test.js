let report, childProcess;
describe('Report Config Test', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.resetModules()
        report = () => require('../bin/report-config')
        childProcess = require('child_process');
        jest.mock('child_process');
    })

    test('should generate report successfully', () => {
        process.argv[2] = null;
        childProcess.exec.mockImplementationOnce((execCommand, callback) => {
            callback(null);
        });
        expect(report()).toBeUndefined();
    });

    test('should not generate report for invalid format', () => {
        process.argv[2] = 'xyz';
        expect(report()).toBeUndefined();
    });

    test('should throw error for generate report', () => {
        process.argv[2] = 'json';
        childProcess.exec.mockImplementationOnce((execCommand, callback) => {
            callback(new Error(), 'data', 'getter');
        });
        expect(() => report()).toThrow();
    });

});
