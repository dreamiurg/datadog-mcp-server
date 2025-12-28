"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHosts = void 0;
const datadog_api_client_1 = require("@datadog/datadog-api-client");
const index_js_1 = require("../lib/index.js");
const log = (0, index_js_1.createToolLogger)("get-hosts");
let apiInstance = null;
exports.getHosts = {
    initialize: () => {
        log.debug("initialize() called");
        const configuration = (0, index_js_1.createDatadogConfiguration)({ service: "default" });
        apiInstance = new datadog_api_client_1.v1.HostsApi(configuration);
    },
    execute: async (params) => {
        if (!apiInstance) {
            throw new Error("getHosts not initialized. Call initialize() first.");
        }
        log.debug({
            filter: params.filter,
            sortField: params.sortField,
            count: params.count,
        }, "executing get-hosts");
        try {
            const apiParams = {
                filter: params.filter,
                sortField: params.sortField,
                sortDir: params.sortDir,
                start: params.start,
                count: params.count,
                from: params.from,
                includeMutedHostsData: params.includeMutedHostsData,
                includeHostsMetadata: params.includeHostsMetadata,
            };
            const response = await apiInstance.listHosts(apiParams);
            log.info({ hostCount: response.hostList?.length || 0 }, "get-hosts completed");
            return response;
        }
        catch (error) {
            log.error({ error }, "get-hosts failed");
            (0, index_js_1.handleApiError)(error, "fetching hosts");
        }
    },
};
