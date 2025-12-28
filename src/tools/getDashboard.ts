import { v1 } from "@datadog/datadog-api-client";
import { createDatadogConfiguration, handleApiError } from "../lib/index.js";

interface GetDashboardParams {
  dashboardId: string;
}

let apiInstance: v1.DashboardsApi | null = null;

export const getDashboard = {
  initialize: () => {
    const configuration = createDatadogConfiguration({ service: "default" });
    apiInstance = new v1.DashboardsApi(configuration);
  },

  execute: async (params: GetDashboardParams) => {
    if (!apiInstance) {
      throw new Error("getDashboard not initialized. Call initialize() first.");
    }

    try {
      const { dashboardId } = params;

      const response = await apiInstance.getDashboard({ dashboardId });
      return response;
    } catch (error: unknown) {
      handleApiError(error, `fetching dashboard ${params.dashboardId}`);
    }
  },
};
