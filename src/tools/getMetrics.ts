import { v1 } from "@datadog/datadog-api-client";
import { createDatadogConfiguration, handleApiError } from "../lib/index.js";

interface GetMetricsParams {
  q?: string;
}

let apiInstance: v1.MetricsApi | null = null;

export const getMetrics = {
  initialize: () => {
    const configuration = createDatadogConfiguration({ service: "metrics" });
    apiInstance = new v1.MetricsApi(configuration);
  },

  execute: async (params: GetMetricsParams) => {
    if (!apiInstance) {
      throw new Error("getMetrics not initialized. Call initialize() first.");
    }

    try {
      const { q } = params;

      const response = await apiInstance.listMetrics({ q: q ?? "*" });
      return response;
    } catch (error: unknown) {
      handleApiError(error, "fetching metrics");
    }
  },
};
