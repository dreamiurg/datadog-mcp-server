import { v1 } from "@datadog/datadog-api-client";
import { createDatadogConfiguration, handleApiError } from "../lib/index.js";

interface GetMonitorsParams {
  groupStates?: string[];
  tags?: string;
  monitorTags?: string;
  limit?: number;
}

let apiInstance: v1.MonitorsApi | null = null;

export const getMonitors = {
  initialize: () => {
    const configuration = createDatadogConfiguration({ service: "metrics" });
    apiInstance = new v1.MonitorsApi(configuration);
  },

  execute: async (params: GetMonitorsParams) => {
    if (!apiInstance) {
      throw new Error("getMonitors not initialized. Call initialize() first.");
    }

    try {
      const { groupStates, tags, monitorTags, limit } = params;

      const apiParams: v1.MonitorsApiListMonitorsRequest = {
        groupStates: groupStates?.join(","),
        tags,
        monitorTags,
      };

      const response = await apiInstance.listMonitors(apiParams);

      if (limit && response.length > limit) {
        return response.slice(0, limit);
      }

      return response;
    } catch (error: unknown) {
      handleApiError(error, "fetching monitors");
    }
  },
};
