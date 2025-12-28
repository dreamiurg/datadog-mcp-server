import { client, v2 } from "@datadog/datadog-api-client";

type SearchLogsParams = {
  filter?: {
    query?: string;
    from?: string;
    to?: string;
    indexes?: string[];
  };
  sort?: string;
  page?: {
    limit?: number;
    cursor?: string;
  };
  limit?: number;
  apiKey?: string;
  appKey?: string;
};

let configuration: client.Configuration;

export const searchLogs = {
  initialize: () => {
    const configOpts = {
      authMethods: {
        apiKeyAuth: process.env.DD_API_KEY,
        appKeyAuth: process.env.DD_APP_KEY,
      },
    };

    configuration = client.createConfiguration(configOpts);

    if (process.env.DD_LOGS_SITE) {
      configuration.setServerVariables({
        site: process.env.DD_LOGS_SITE,
      });
    }

    // Enable any unstable operations
    configuration.unstableOperations["v2.listLogsGet"] = true;
  },

  execute: async (params: SearchLogsParams) => {
    try {
      const {
        apiKey = process.env.DD_API_KEY,
        appKey = process.env.DD_APP_KEY,
        filter,
        sort,
        page,
        limit,
      } = params;

      if (!apiKey || !appKey) {
        throw new Error("API Key and App Key are required");
      }

      const _apiInstance = new v2.LogsApi(configuration);

      // Use a more flexible approach with POST
      // Create the search request based on API docs
      const body = {
        filter: filter,
        sort: sort,
        page: page,
      };

      // Use DD_LOGS_SITE environment variable instead of DD_SITE
      const apiUrl = `https://${
        process.env.DD_LOGS_SITE || "datadoghq.com"
      }/api/v2/logs/events/search`;

      const headers = {
        "Content-Type": "application/json",
        "DD-API-KEY": apiKey,
        "DD-APPLICATION-KEY": appKey,
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw {
          status: response.status,
          message: await response.text(),
        };
      }

      const data = await response.json();

      // Apply client-side limit if specified
      if (limit && data.data && data.data.length > limit) {
        data.data = data.data.slice(0, limit);
      }

      return data;
    } catch (error: any) {
      if (error.status === 403) {
        console.error(
          "Authorization failed (403 Forbidden): Check that your API key and Application key are valid and have sufficient permissions to access logs.",
        );
        throw new Error(
          "Datadog API authorization failed. Please verify your API and Application keys have the correct permissions.",
        );
      } else {
        console.error("Error searching logs:", error);
        throw error;
      }
    }
  },
};
