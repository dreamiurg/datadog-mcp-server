"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const logger_js_1 = require("./logger.js");
(0, vitest_1.describe)("logger", () => {
    (0, vitest_1.describe)("logger instance", () => {
        (0, vitest_1.it)("exports a pino logger", () => {
            (0, vitest_1.expect)(logger_js_1.logger).toBeDefined();
            (0, vitest_1.expect)(typeof logger_js_1.logger.info).toBe("function");
            (0, vitest_1.expect)(typeof logger_js_1.logger.error).toBe("function");
            (0, vitest_1.expect)(typeof logger_js_1.logger.warn).toBe("function");
            (0, vitest_1.expect)(typeof logger_js_1.logger.debug).toBe("function");
        });
    });
    (0, vitest_1.describe)("createToolLogger", () => {
        (0, vitest_1.it)("creates a child logger with tool context", () => {
            const toolLogger = (0, logger_js_1.createToolLogger)("getMonitors");
            (0, vitest_1.expect)(toolLogger).toBeDefined();
            (0, vitest_1.expect)(typeof toolLogger.info).toBe("function");
            (0, vitest_1.expect)(typeof toolLogger.error).toBe("function");
        });
        (0, vitest_1.it)("creates different loggers for different tools", () => {
            const logger1 = (0, logger_js_1.createToolLogger)("tool1");
            const logger2 = (0, logger_js_1.createToolLogger)("tool2");
            (0, vitest_1.expect)(logger1).not.toBe(logger2);
        });
    });
    (0, vitest_1.describe)("createHttpLogger", () => {
        (0, vitest_1.it)("creates a child logger with service context", () => {
            const httpLogger = (0, logger_js_1.createHttpLogger)("datadog");
            (0, vitest_1.expect)(httpLogger).toBeDefined();
            (0, vitest_1.expect)(typeof httpLogger.info).toBe("function");
            (0, vitest_1.expect)(typeof httpLogger.error).toBe("function");
        });
        (0, vitest_1.it)("creates different loggers for different services", () => {
            const logger1 = (0, logger_js_1.createHttpLogger)("service1");
            const logger2 = (0, logger_js_1.createHttpLogger)("service2");
            (0, vitest_1.expect)(logger1).not.toBe(logger2);
        });
    });
});
