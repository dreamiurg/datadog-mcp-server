import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-confluent-accounts");

type ListConfluentAccountsParams = Record<string, never>;

interface ListConfluentAccountsResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      api_key?: string;
      tags?: string[];
    };
  }>;
}

let initialized = false;

export const listConfluentAccounts = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (_params: ListConfluentAccountsParams) => {
    if (!initialized) {
      throw new Error("listConfluentAccounts not initialized. Call initialize() first.");
    }
    try {
      log.debug("Fetching Confluent accounts");
      const response = await datadogRequest<ListConfluentAccountsResponse>({
        service: "default",
        path: "/api/v2/integrations/confluent-cloud/accounts",
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved Confluent accounts");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-confluent-accounts failed");
      handleApiError(error, "Failed to list Confluent accounts");
    }
  },
};
