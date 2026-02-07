import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listCloudflareAccounts } from "./listCloudflareAccounts.js";

describe("listCloudflareAccounts", () => {
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
      expect(() => listCloudflareAccounts.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listCloudflareAccounts: fresh } = await import("./listCloudflareAccounts.js");
      await expect(fresh.execute({})).rejects.toThrow("listCloudflareAccounts not initialized");
    });

    it("makes correct API call and returns results", async () => {
      listCloudflareAccounts.initialize();
      const mockResponse = {
        data: [
          {
            id: "account-1",
            type: "cloudflare-accounts",
            attributes: {
              name: "Test Account",
              email: "test@example.com",
            },
          },
        ],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });
      const result = await listCloudflareAccounts.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/integrations/cloudflare/accounts"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      listCloudflareAccounts.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(listCloudflareAccounts.execute({})).rejects.toThrow();
    });
  });
});
