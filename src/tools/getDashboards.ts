import { v1 } from "@datadog/datadog-api-client";
import { createDatadogConfiguration, handleApiError } from "../lib/index.js";

interface GetDashboardsParams {
  filterConfigured?: boolean;
  limit?: number;
}

let apiInstance: v1.DashboardsApi | null = null;

export const getDashboards = {
  initialize: () => {
    const configuration = createDatadogConfiguration({ service: "default" });
    apiInstance = new v1.DashboardsApi(configuration);
  },

  execute: async (params: GetDashboardsParams) => {
    if (!apiInstance) {
      throw new Error("getDashboards not initialized. Call initialize() first.");
    }

    try {
      const { limit } = params;
      // Note: filterConfigured is accepted for API compatibility but not used
      // as the Datadog API doesn't support server-side filtering

      const response = await apiInstance.listDashboards();

      let filteredDashboards = response.dashboards ?? [];

      if (limit && filteredDashboards.length > limit) {
        filteredDashboards = filteredDashboards.slice(0, limit);
      }

      return {
        ...response,
        dashboards: filteredDashboards,
      };
    } catch (error: unknown) {
      handleApiError(error, "fetching dashboards");
    }
  },
};
