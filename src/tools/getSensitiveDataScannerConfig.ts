import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-sensitive-data-scanner-config");

type GetSensitiveDataScannerConfigParams = Record<string, never>;

interface GetSensitiveDataScannerConfigResponse {
  data?: {
    id?: string;
    type?: string;
    relationships?: {
      groups?: {
        data?: Array<{
          id?: string;
          type?: string;
        }>;
      };
    };
  };
  included?: Array<{
    id?: string;
    type?: string;
    attributes?: Record<string, unknown>;
  }>;
}

let initialized = false;

export const getSensitiveDataScannerConfig = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (_params: GetSensitiveDataScannerConfigParams) => {
    if (!initialized) {
      throw new Error("getSensitiveDataScannerConfig not initialized. Call initialize() first.");
    }
    try {
      log.debug("Fetching sensitive data scanner config");
      const response = await datadogRequest<GetSensitiveDataScannerConfigResponse>({
        service: "default",
        path: "/api/v2/sensitive-data-scanner/config",
        method: "GET",
      });
      log.debug("Retrieved sensitive data scanner config");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "get-sensitive-data-scanner-config failed");
      handleApiError(error, "Failed to get sensitive data scanner config");
    }
  },
};
