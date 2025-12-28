import { v1 } from "@datadog/datadog-api-client";
import { createDatadogConfiguration, handleApiError } from "../lib/index.js";

interface GetMonitorParams {
  monitorId: number;
}

let apiInstance: v1.MonitorsApi | null = null;

export const getMonitor = {
  initialize: () => {
    const configuration = createDatadogConfiguration({ service: "metrics" });
    apiInstance = new v1.MonitorsApi(configuration);
  },

  execute: async (params: GetMonitorParams) => {
    if (!apiInstance) {
      throw new Error("getMonitor not initialized. Call initialize() first.");
    }

    try {
      const { monitorId } = params;

      const response = await apiInstance.getMonitor({ monitorId });
      return response;
    } catch (error: unknown) {
      handleApiError(error, `fetching monitor ${params.monitorId}`);
    }
  },
};
