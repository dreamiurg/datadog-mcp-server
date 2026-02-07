import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-restriction-policies");

interface ListRestrictionPoliciesParams {
  resource_id: string;
}

interface ListRestrictionPoliciesResponse {
  data?: {
    id?: string;
    type?: string;
    attributes?: {
      bindings?: Array<{
        relation?: string;
        principals?: string[];
      }>;
    };
  };
}

let initialized = false;

export const listRestrictionPolicies = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: ListRestrictionPoliciesParams) => {
    if (!initialized) {
      throw new Error("listRestrictionPolicies not initialized. Call initialize() first.");
    }
    if (!params.resource_id) {
      throw new Error("resource_id is required");
    }
    try {
      const path = `/api/v2/restriction_policy/${params.resource_id}`;
      log.debug({ path }, "Fetching restriction policies");
      const response = await datadogRequest<ListRestrictionPoliciesResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.debug("Retrieved restriction policies");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-restriction-policies failed");
      handleApiError(error, "Failed to list restriction policies");
    }
  },
};
