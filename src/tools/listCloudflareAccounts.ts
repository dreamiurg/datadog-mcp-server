import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-cloudflare-accounts");

type ListCloudflareAccountsParams = Record<string, never>;

interface ListCloudflareAccountsResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      name?: string;
      email?: string;
    };
  }>;
}

let initialized = false;

export const listCloudflareAccounts = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (_params: ListCloudflareAccountsParams) => {
    if (!initialized) {
      throw new Error("listCloudflareAccounts not initialized. Call initialize() first.");
    }
    try {
      log.debug("Fetching Cloudflare accounts");
      const response = await datadogRequest<ListCloudflareAccountsResponse>({
        service: "default",
        path: "/api/v2/integrations/cloudflare/accounts",
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved Cloudflare accounts");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-cloudflare-accounts failed");
      handleApiError(error, "Failed to list Cloudflare accounts");
    }
  },
};
