import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-webhooks");

type ListWebhooksParams = Record<string, never>;

type ListWebhooksResponse = Array<{
  name?: string;
  url?: string;
  custom_headers?: string;
  encode_as?: string;
  payload?: string;
}>;

let initialized = false;

export const listWebhooks = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (_params: ListWebhooksParams) => {
    if (!initialized) {
      throw new Error("listWebhooks not initialized. Call initialize() first.");
    }
    try {
      log.debug("Fetching webhooks");
      const response = await datadogRequest<ListWebhooksResponse>({
        service: "default",
        path: "/api/v1/integration/webhooks/configuration/webhooks",
        method: "GET",
      });
      log.debug("Retrieved webhooks");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-webhooks failed");
      handleApiError(error, "Failed to list webhooks");
    }
  },
};
