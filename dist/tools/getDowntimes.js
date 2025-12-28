"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDowntimes = void 0;
const datadog_api_client_1 = require("@datadog/datadog-api-client");
const index_js_1 = require("../lib/index.js");
const log = (0, index_js_1.createToolLogger)("get-downtimes");
let apiInstance = null;
exports.getDowntimes = {
    initialize: () => {
        log.debug("initialize() called");
        const configuration = (0, index_js_1.createDatadogConfiguration)({ service: "default" });
        apiInstance = new datadog_api_client_1.v2.DowntimesApi(configuration);
    },
    execute: async (params) => {
        if (!apiInstance) {
            throw new Error("getDowntimes not initialized. Call initialize() first.");
        }
        log.debug({
            currentOnly: params.currentOnly,
            pageLimit: params.pageLimit,
        }, "executing get-downtimes");
        try {
            const apiParams = {
                currentOnly: params.currentOnly,
                include: params.include,
                pageOffset: params.pageOffset,
                pageLimit: params.pageLimit,
            };
            const response = await apiInstance.listDowntimes(apiParams);
            log.info({ downtimeCount: response.data?.length || 0 }, "get-downtimes completed");
            return response;
        }
        catch (error) {
            log.error({ error }, "get-downtimes failed");
            (0, index_js_1.handleApiError)(error, "fetching downtimes");
        }
    },
};
