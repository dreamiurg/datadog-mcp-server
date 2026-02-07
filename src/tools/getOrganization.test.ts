import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getOrganization } from "./getOrganization.js";

describe("getOrganization", () => {
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
      expect(() => getOrganization.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getOrganization: fresh } = await import("./getOrganization.js");
      await expect(fresh.execute({})).rejects.toThrow("getOrganization not initialized");
    });

    it("makes correct API call and returns results", async () => {
      getOrganization.initialize();
      const mockResponse = {
        orgs: [
          {
            public_id: "org-123",
            name: "Test Org",
            description: "A test organization",
            plan: { name: "enterprise" },
            settings: { private_widget_share: false },
            created: "2023-01-01T00:00:00Z",
          },
        ],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });
      const result = await getOrganization.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/org"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      getOrganization.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(getOrganization.execute({})).rejects.toThrow();
    });
  });
});
