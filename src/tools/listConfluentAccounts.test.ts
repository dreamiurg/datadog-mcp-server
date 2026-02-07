import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listConfluentAccounts } from "./listConfluentAccounts.js";

describe("listConfluentAccounts", () => {
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
      expect(() => listConfluentAccounts.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listConfluentAccounts: fresh } = await import("./listConfluentAccounts.js");
      await expect(fresh.execute({})).rejects.toThrow("listConfluentAccounts not initialized");
    });

    it("makes correct API call and returns results", async () => {
      listConfluentAccounts.initialize();
      const mockResponse = {
        data: [
          {
            id: "account-1",
            type: "confluent-cloud-accounts",
            attributes: {
              api_key: "test-api-key",
              tags: ["tag1", "tag2"],
            },
          },
        ],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });
      const result = await listConfluentAccounts.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/integrations/confluent-cloud/accounts"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      listConfluentAccounts.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(listConfluentAccounts.execute({})).rejects.toThrow();
    });
  });
});
