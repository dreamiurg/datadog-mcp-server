"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSLOs = void 0;
const datadog_api_client_1 = require("@datadog/datadog-api-client");
const index_js_1 = require("../lib/index.js");
const log = (0, index_js_1.createToolLogger)("get-slos");
let apiInstance = null;
exports.getSLOs = {
    initialize: () => {
        log.debug("initialize() called");
        const configuration = (0, index_js_1.createDatadogConfiguration)({ service: "default" });
        apiInstance = new datadog_api_client_1.v1.ServiceLevelObjectivesApi(configuration);
    },
    execute: async (params) => {
        if (!apiInstance) {
            throw new Error("getSLOs not initialized. Call initialize() first.");
        }
        log.debug({
            query: params.query,
            tagsQuery: params.tagsQuery,
            limit: params.limit,
        }, "executing get-slos");
        try {
            const apiParams = {
                ids: params.ids,
                query: params.query,
                tagsQuery: params.tagsQuery,
                metricsQuery: params.metricsQuery,
                limit: params.limit,
                offset: params.offset,
            };
            const response = await apiInstance.listSLOs(apiParams);
            log.info({ sloCount: response.data?.length || 0 }, "get-slos completed");
            return response;
        }
        catch (error) {
            log.error({ error }, "get-slos failed");
            (0, index_js_1.handleApiError)(error, "fetching SLOs");
        }
    },
};
