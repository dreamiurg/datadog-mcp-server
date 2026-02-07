import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-synthetics-private-locations");

type ListSyntheticsPrivateLocationsParams = Record<string, never>;

interface ListSyntheticsPrivateLocationsResponse {
  locations?: Array<{
    id?: string;
    name?: string;
    description?: string;
    tags?: string[];
    metadata?: { restricted_roles?: string[] };
  }>;
}

let initialized = false;

export const listSyntheticsPrivateLocations = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (_params: ListSyntheticsPrivateLocationsParams) => {
    if (!initialized) {
      throw new Error("listSyntheticsPrivateLocations not initialized. Call initialize() first.");
    }
    try {
      log.debug("Fetching synthetics private locations");
      const response = await datadogRequest<ListSyntheticsPrivateLocationsResponse>({
        service: "default",
        path: "/api/v1/synthetics/private-locations",
        method: "GET",
      });
      log.debug("Retrieved synthetics private locations");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-synthetics-private-locations failed");
      handleApiError(error, "Failed to list synthetics private locations");
    }
  },
};
