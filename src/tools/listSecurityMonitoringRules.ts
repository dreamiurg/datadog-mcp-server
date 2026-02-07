import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-security-monitoring-rules");

interface ListSecurityMonitoringRulesParams {
  page_size?: number;
  page_number?: number;
}

interface ListSecurityMonitoringRulesResponse {
  data?: Array<{
    id?: string;
    name?: string;
    type?: string;
    isEnabled?: boolean;
    message?: string;
    tags?: string[];
    createdAt?: number;
  }>;
}

let initialized = false;

export const listSecurityMonitoringRules = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: ListSecurityMonitoringRulesParams) => {
    if (!initialized) {
      throw new Error("listSecurityMonitoringRules not initialized. Call initialize() first.");
    }
    try {
      log.debug("Fetching security monitoring rules");
      const queryParams = new URLSearchParams();
      if (params.page_size !== undefined) {
        queryParams.append("page[size]", params.page_size.toString());
      }
      if (params.page_number !== undefined) {
        queryParams.append("page[number]", params.page_number.toString());
      }
      const path = `/api/v2/security_monitoring/rules${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await datadogRequest<ListSecurityMonitoringRulesResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.debug("Retrieved security monitoring rules");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-security-monitoring-rules failed");
      handleApiError(error, "Failed to list security monitoring rules");
    }
  },
};
