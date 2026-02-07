import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listAzureIntegration } from "./listAzureIntegration.js";

describe("listAzureIntegration", () => {
  const originalEnv = process.env;
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      DD_API_KEY: "test-api-key",
      DD_APP_KEY: "test-app-key",
      DD_SITE: "datadoghq.com",
    };
    vi.stubGlobal("fetch", mockFetch);
    mockFetch.mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.unstubAllGlobals();
  });

  describe("initialize", () => {
    it("sets initialized state", () => {
      expect(() => listAzureIntegration.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listAzureIntegration: fresh } = await import("./listAzureIntegration.js");
      await expect(fresh.execute({})).rejects.toThrow("listAzureIntegration not initialized");
    });

    it("makes correct API call and returns results", async () => {
      listAzureIntegration.initialize();
      const mockResponse = [
        {
          tenant_name: "test-tenant",
          client_id: "test-client-id",
          host_filters: "filter1,filter2",
          automute: true,
        },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });
      const result = await listAzureIntegration.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/integration/azure"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      listAzureIntegration.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(listAzureIntegration.execute({})).rejects.toThrow();
    });
  });
});
