import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-gcp-integration");

type ListGCPIntegrationParams = Record<string, never>;

type ListGCPIntegrationResponse = Array<{
  project_id?: string;
  client_email?: string;
  host_filters?: string;
  automute?: boolean;
}>;

let initialized = false;

export const listGCPIntegration = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (_params: ListGCPIntegrationParams) => {
    if (!initialized) {
      throw new Error("listGCPIntegration not initialized. Call initialize() first.");
    }
    try {
      log.debug("Fetching GCP integrations");
      const response = await datadogRequest<ListGCPIntegrationResponse>({
        service: "default",
        path: "/api/v1/integration/gcp",
        method: "GET",
      });
      log.debug({ count: response.length }, "Retrieved GCP integrations");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-gcp-integration failed");
      handleApiError(error, "Failed to list GCP integrations");
    }
  },
};
