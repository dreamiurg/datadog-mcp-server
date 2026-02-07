import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-incident-services");

interface GetIncidentServicesParams {
  page_size?: number;
  page_offset?: number;
  filter?: string;
}

interface GetIncidentServicesResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      name?: string;
      created?: string;
      modified?: string;
    };
  }>;
}

let initialized = false;

export const getIncidentServices = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: GetIncidentServicesParams) => {
    if (!initialized) {
      throw new Error("getIncidentServices not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.page_size !== undefined) {
        queryParams.append("page[size]", params.page_size.toString());
      }
      if (params.page_offset !== undefined) {
        queryParams.append("page[offset]", params.page_offset.toString());
      }
      if (params.filter !== undefined) {
        queryParams.append("filter", params.filter);
      }
      const queryString = queryParams.toString();
      const path = queryString ? `/api/v2/services?${queryString}` : "/api/v2/services";
      log.debug({ path }, "Fetching incident services");
      const response = await datadogRequest<GetIncidentServicesResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved incident services");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "get-incident-services failed");
      handleApiError(error, "Failed to fetch incident services");
    }
  },
};
