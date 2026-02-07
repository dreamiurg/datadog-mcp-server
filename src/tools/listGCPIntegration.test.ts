import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listGCPIntegration } from "./listGCPIntegration.js";

describe("listGCPIntegration", () => {
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
      expect(() => listGCPIntegration.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listGCPIntegration: fresh } = await import("./listGCPIntegration.js");
      await expect(fresh.execute({})).rejects.toThrow("listGCPIntegration not initialized");
    });

    it("makes correct API call and returns results", async () => {
      listGCPIntegration.initialize();
      const mockResponse = [
        {
          project_id: "test-project",
          client_email: "test@example.com",
          host_filters: "filter1,filter2",
          automute: true,
        },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });
      const result = await listGCPIntegration.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/integration/gcp"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      listGCPIntegration.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(listGCPIntegration.execute({})).rejects.toThrow();
    });
  });
});
