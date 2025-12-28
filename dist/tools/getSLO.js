"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSLO = void 0;
const datadog_api_client_1 = require("@datadog/datadog-api-client");
const index_js_1 = require("../lib/index.js");
const log = (0, index_js_1.createToolLogger)("get-slo");
let apiInstance = null;
exports.getSLO = {
    initialize: () => {
        log.debug("initialize() called");
        const configuration = (0, index_js_1.createDatadogConfiguration)({ service: "default" });
        apiInstance = new datadog_api_client_1.v1.ServiceLevelObjectivesApi(configuration);
    },
    execute: async (params) => {
        if (!apiInstance) {
            throw new Error("getSLO not initialized. Call initialize() first.");
        }
        log.debug({ sloId: params.sloId }, "executing get-slo");
        try {
            const apiParams = {
                sloId: params.sloId,
                withConfiguredAlertIds: params.withConfiguredAlertIds,
            };
            const response = await apiInstance.getSLO(apiParams);
            log.info({ sloId: params.sloId }, "get-slo completed");
            return response;
        }
        catch (error) {
            log.error({ sloId: params.sloId, error }, "get-slo failed");
            (0, index_js_1.handleApiError)(error, "fetching SLO");
        }
    },
};
