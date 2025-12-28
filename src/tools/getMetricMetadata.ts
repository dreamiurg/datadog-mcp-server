import { v1 } from "@datadog/datadog-api-client";
import { createDatadogConfiguration, handleApiError } from "../lib/index.js";

interface GetMetricMetadataParams {
  metricName: string;
}

let apiInstance: v1.MetricsApi | null = null;

export const getMetricMetadata = {
  initialize: () => {
    const configuration = createDatadogConfiguration({ service: "metrics" });
    apiInstance = new v1.MetricsApi(configuration);
  },

  execute: async (params: GetMetricMetadataParams) => {
    if (!apiInstance) {
      throw new Error("getMetricMetadata not initialized. Call initialize() first.");
    }

    try {
      const { metricName } = params;

      const response = await apiInstance.getMetricMetadata({ metricName });
      return response;
    } catch (error: unknown) {
      handleApiError(error, `fetching metadata for metric ${params.metricName}`);
    }
  },
};
