/**
 * Custom error class for Datadog API errors with status code information
 */
export class DatadogApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly context?: string,
  ) {
    super(message);
    this.name = "DatadogApiError";
  }
}

/**
 * Error response structure from raw API calls
 */
interface RawApiError {
  status?: number;
  message?: string;
  code?: number;
  body?: unknown;
}

/**
 * Type guard to check if an error is a raw API error
 */
function isRawApiError(error: unknown): error is RawApiError {
  return typeof error === "object" && error !== null && ("status" in error || "code" in error);
}

/**
 * Handles Datadog API errors consistently across all tools.
 * Provides specific error messages for common error codes and logs appropriately.
 *
 * @param error - The error caught from an API call
 * @param context - A description of what operation was being attempted
 * @throws DatadogApiError with appropriate message
 */
export function handleApiError(error: unknown, context: string): never {
  const statusCode = isRawApiError(error) ? (error.status ?? error.code) : undefined;

  if (statusCode === 403) {
    console.error(
      `Authorization failed (403 Forbidden) during ${context}: Check that your API key and Application key are valid and have sufficient permissions.`,
    );
    throw new DatadogApiError(
      "Datadog API authorization failed. Please verify your API and Application keys have the correct permissions.",
      403,
      context,
    );
  }

  if (statusCode === 404) {
    console.error(`Resource not found (404) during ${context}`);
    throw new DatadogApiError("The requested resource was not found.", 404, context);
  }

  if (statusCode === 429) {
    console.error(`Rate limit exceeded (429) during ${context}`);
    throw new DatadogApiError(
      "Rate limit exceeded. Please wait before making more requests.",
      429,
      context,
    );
  }

  // Generic error handling
  console.error(`Error during ${context}:`, error);

  if (error instanceof Error) {
    throw new DatadogApiError(error.message, statusCode, context);
  }

  throw new DatadogApiError(`An unexpected error occurred during ${context}`, statusCode, context);
}
