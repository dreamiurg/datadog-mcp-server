import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-organization");

type GetOrganizationParams = Record<string, never>;

interface GetOrganizationResponse {
  orgs?: Array<{
    public_id?: string;
    name?: string;
    description?: string;
    plan?: { name?: string };
    settings?: Record<string, unknown>;
    created?: string;
  }>;
}

let initialized = false;

export const getOrganization = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (_params: GetOrganizationParams) => {
    if (!initialized) {
      throw new Error("getOrganization not initialized. Call initialize() first.");
    }
    try {
      log.debug("Fetching organization details");
      const response = await datadogRequest<GetOrganizationResponse>({
        service: "default",
        path: "/api/v1/org",
        method: "GET",
      });
      log.debug("Retrieved organization details");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "get-organization failed");
      handleApiError(error, "Failed to get organization details");
    }
  },
};
