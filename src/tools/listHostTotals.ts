import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-host-totals");

type ListHostTotalsParams = Record<string, never>;

interface ListHostTotalsResponse {
  total_active?: number;
  total_up?: number;
}

let initialized = false;

export const listHostTotals = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (_params: ListHostTotalsParams) => {
    if (!initialized) {
      throw new Error("listHostTotals not initialized. Call initialize() first.");
    }
    try {
      log.debug("Fetching host totals");
      const response = await datadogRequest<ListHostTotalsResponse>({
        service: "default",
        path: "/api/v1/hosts/totals",
        method: "GET",
      });
      log.debug("Retrieved host totals");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-host-totals failed");
      handleApiError(error, "Failed to list host totals");
    }
  },
};
