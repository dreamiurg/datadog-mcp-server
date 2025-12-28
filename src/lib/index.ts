export type { DatadogService } from "./config.js";
export { createDatadogConfiguration, getCredentials, getServiceBaseUrl } from "./config.js";
export { DatadogApiError, handleApiError } from "./errors.js";
export { datadogRequest } from "./http.js";
