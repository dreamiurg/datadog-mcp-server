import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getSensitiveDataScannerConfig } from "./getSensitiveDataScannerConfig.js";

describe("getSensitiveDataScannerConfig", () => {
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
      expect(() => getSensitiveDataScannerConfig.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getSensitiveDataScannerConfig: fresh } = await import(
        "./getSensitiveDataScannerConfig.js"
      );
      await expect(fresh.execute({})).rejects.toThrow(
        "getSensitiveDataScannerConfig not initialized",
      );
    });

    it("makes correct API call and returns results", async () => {
      getSensitiveDataScannerConfig.initialize();
      const mockResponse = {
        data: {
          id: "config-123",
          type: "sensitive_data_scanner_configuration",
          relationships: {
            groups: {
              data: [
                { id: "group-1", type: "scanning_group" },
                { id: "group-2", type: "scanning_group" },
              ],
            },
          },
        },
        included: [
          {
            id: "group-1",
            type: "scanning_group",
            attributes: {
              name: "PII Scanner",
              is_enabled: true,
            },
          },
          {
            id: "group-2",
            type: "scanning_group",
            attributes: {
              name: "Credit Card Scanner",
              is_enabled: false,
            },
          },
        ],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });
      const result = await getSensitiveDataScannerConfig.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/sensitive-data-scanner/config"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      getSensitiveDataScannerConfig.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(getSensitiveDataScannerConfig.execute({})).rejects.toThrow();
    });
  });
});
