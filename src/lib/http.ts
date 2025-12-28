import { type DatadogService, getCredentials, getServiceBaseUrl } from "./config.js";

/**
 * Options for making an HTTP request to the Datadog API
 */
interface RequestOptions {
  /**
   * The service determines which base URL and site to use
   */
  service: DatadogService;
  /**
   * The API path (e.g., "/api/v2/logs/events/search")
   */
  path: string;
  /**
   * HTTP method (defaults to POST)
   */
  method?: "GET" | "POST" | "PUT" | "DELETE";
  /**
   * Request body (will be JSON-serialized)
   */
  body?: unknown;
}

/**
 * Error thrown when an HTTP request fails
 */
interface HttpError {
  status: number;
  message: string;
}

/**
 * Makes an authenticated HTTP request to the Datadog API.
 * This is useful for endpoints not fully supported by the official SDK.
 *
 * @param options - Request configuration
 * @returns Parsed JSON response
 * @throws HttpError if the request fails
 */
export async function datadogRequest<T = unknown>(options: RequestOptions): Promise<T> {
  const { service, path, method = "POST", body } = options;
  const { apiKey, appKey } = getCredentials();
  const baseUrl = getServiceBaseUrl(service);

  const url = `${baseUrl}${path}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "DD-API-KEY": apiKey,
    "DD-APPLICATION-KEY": appKey,
  };

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error: HttpError = {
      status: response.status,
      message: await response.text(),
    };
    throw error;
  }

  return response.json() as Promise<T>;
}
