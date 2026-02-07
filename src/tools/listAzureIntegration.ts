import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-azure-integration");

type ListAzureIntegrationParams = Record<string, never>;

type ListAzureIntegrationResponse = Array<{
  tenant_name?: string;
  client_id?: string;
  host_filters?: string;
  automute?: boolean;
}>;

let initialized = false;

export const listAzureIntegration = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (_params: ListAzureIntegrationParams) => {
    if (!initialized) {
      throw new Error("listAzureIntegration not initialized. Call initialize() first.");
    }
    try {
      log.debug("Fetching Azure integrations");
      const response = await datadogRequest<ListAzureIntegrationResponse>({
        service: "default",
        path: "/api/v1/integration/azure",
        method: "GET",
      });
      log.debug({ count: response.length }, "Retrieved Azure integrations");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-azure-integration failed");
      handleApiError(error, "Failed to list Azure integrations");
    }
  },
};
