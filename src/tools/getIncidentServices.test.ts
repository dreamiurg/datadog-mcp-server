import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getIncidentServices } from "./getIncidentServices.js";

describe("getIncidentServices", () => {
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
      expect(() => getIncidentServices.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getIncidentServices: fresh } = await import("./getIncidentServices.js");
      await expect(fresh.execute({})).rejects.toThrow("getIncidentServices not initialized");
    });

    it("makes correct API call and returns results", async () => {
      getIncidentServices.initialize();
      const mockResponse = {
        data: [
          {
            id: "service-1",
            type: "services",
            attributes: {
              name: "Test Service",
              created: "2024-01-01T00:00:00Z",
              modified: "2024-01-02T00:00:00Z",
            },
          },
        ],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });
      const result = await getIncidentServices.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/services"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes params when provided", async () => {
      getIncidentServices.initialize();
      const mockResponse = { data: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });
      await getIncidentServices.execute({
        page_size: 10,
        page_offset: 20,
        filter: "test",
      });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("filter=test"),
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("handles API errors", async () => {
      getIncidentServices.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(getIncidentServices.execute({})).rejects.toThrow();
    });
  });
});
