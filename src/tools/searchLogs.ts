import { createDatadogConfiguration, datadogRequest, handleApiError } from "../lib/index.js";
import type { LogsSearchResponse } from "../lib/types.js";

interface SearchLogsParams {
  filter?: {
    query?: string;
    from?: string;
    to?: string;
    indexes?: string[];
  };
  sort?: string;
  page?: {
    limit?: number;
    cursor?: string;
  };
  limit?: number;
}

// We still need to call initialize() for API compatibility,
// but the configuration is created per-request for the HTTP client
let initialized = false;

export const searchLogs = {
  initialize: () => {
    // Validate that configuration can be created (this checks env vars)
    createDatadogConfiguration({
      service: "logs",
      unstableOperations: ["v2.listLogsGet"],
    });
    initialized = true;
  },

  execute: async (params: SearchLogsParams) => {
    if (!initialized) {
      throw new Error("searchLogs not initialized. Call initialize() first.");
    }

    try {
      const { filter, sort, page, limit } = params;

      const body = { filter, sort, page };

      const data = await datadogRequest<LogsSearchResponse>({
        service: "logs",
        path: "/api/v2/logs/events/search",
        method: "POST",
        body,
      });

      if (limit && data.data && data.data.length > limit) {
        data.data = data.data.slice(0, limit);
      }

      return data;
    } catch (error: unknown) {
      handleApiError(error, "searching logs");
    }
  },
};
