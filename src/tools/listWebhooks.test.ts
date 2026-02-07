import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listWebhooks } from "./listWebhooks.js";

describe("listWebhooks", () => {
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
      expect(() => listWebhooks.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listWebhooks: fresh } = await import("./listWebhooks.js");
      await expect(fresh.execute({})).rejects.toThrow("listWebhooks not initialized");
    });

    it("makes correct API call and returns results", async () => {
      listWebhooks.initialize();
      const mockResponse = [
        {
          name: "webhook-1",
          url: "https://example.com/webhook",
          custom_headers: '{"Authorization": "Bearer token"}',
          encode_as: "json",
          payload: '{"event": "$EVENT"}',
        },
        {
          name: "webhook-2",
          url: "https://example.com/webhook2",
          encode_as: "form",
        },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });
      const result = await listWebhooks.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/integration/webhooks/configuration/webhooks"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      listWebhooks.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(listWebhooks.execute({})).rejects.toThrow();
    });
  });
});
