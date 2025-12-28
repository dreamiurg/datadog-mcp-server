"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.createToolLogger = createToolLogger;
exports.createHttpLogger = createHttpLogger;
const pino_1 = __importDefault(require("pino"));
/**
 * Detect if we should use pretty printing for development.
 * Enable with LOG_FORMAT=pretty or NODE_ENV=development
 */
const isPretty = process.env.LOG_FORMAT === "pretty" || process.env.NODE_ENV === "development";
/**
 * Transport configuration based on environment.
 * - Development: pretty-printed, colorized output
 * - Production: JSON format for log aggregators
 */
const transport = isPretty
    ? {
        target: "pino-pretty",
        options: {
            destination: 2, // stderr
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
        },
    }
    : {
        target: "pino/file",
        options: { destination: 2 }, // stderr
    };
/**
 * Structured logger for the Datadog MCP Server.
 *
 * Logs to stderr to avoid interfering with MCP protocol on stdout.
 *
 * Configuration:
 * - LOG_LEVEL: debug, info, warn, error (default: info)
 * - LOG_FORMAT: pretty for human-readable, json for structured (default: json)
 * - NODE_ENV: development enables pretty format automatically
 */
exports.logger = (0, pino_1.default)({
    name: "datadog-mcp-server",
    level: process.env.LOG_LEVEL || "info",
    transport,
    timestamp: pino_1.default.stdTimeFunctions.isoTime,
    base: {
        pid: process.pid,
    },
    serializers: {
        err: pino_1.default.stdSerializers.err,
        error: pino_1.default.stdSerializers.err,
    },
});
/**
 * Create a child logger with additional context.
 * Use this for tool-specific logging.
 */
function createToolLogger(toolName) {
    return exports.logger.child({ tool: toolName });
}
/**
 * Create a child logger for HTTP operations.
 */
function createHttpLogger(service) {
    return exports.logger.child({ service, component: "http" });
}
