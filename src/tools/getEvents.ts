import { v1 } from "@datadog/datadog-api-client";
import { createDatadogConfiguration, handleApiError } from "../lib/index.js";

interface GetEventsParams {
  start: number;
  end: number;
  priority?: "normal" | "low";
  sources?: string;
  tags?: string;
  unaggregated?: boolean;
  excludeAggregation?: boolean;
  limit?: number;
}

let apiInstance: v1.EventsApi | null = null;

export const getEvents = {
  initialize: () => {
    const configuration = createDatadogConfiguration({ service: "default" });
    apiInstance = new v1.EventsApi(configuration);
  },

  execute: async (params: GetEventsParams) => {
    if (!apiInstance) {
      throw new Error("getEvents not initialized. Call initialize() first.");
    }

    try {
      const { start, end, priority, sources, tags, unaggregated, excludeAggregation, limit } =
        params;

      const apiParams: v1.EventsApiListEventsRequest = {
        start,
        end,
        priority,
        sources,
        tags,
        unaggregated,
        excludeAggregate: excludeAggregation,
      };

      const response = await apiInstance.listEvents(apiParams);

      if (limit && response.events && response.events.length > limit) {
        response.events = response.events.slice(0, limit);
      }

      return response;
    } catch (error: unknown) {
      handleApiError(error, "fetching events");
    }
  },
};
