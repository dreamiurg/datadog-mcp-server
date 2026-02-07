import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listSyntheticsPrivateLocations } from "./listSyntheticsPrivateLocations.js";

describe("listSyntheticsPrivateLocations", () => {
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
      expect(() => listSyntheticsPrivateLocations.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listSyntheticsPrivateLocations: fresh } = await import(
        "./listSyntheticsPrivateLocations.js"
      );
      await expect(fresh.execute({})).rejects.toThrow(
        "listSyntheticsPrivateLocations not initialized",
      );
    });

    it("makes correct API call and returns results", async () => {
      listSyntheticsPrivateLocations.initialize();
      const mockResponse = {
        locations: [
          {
            id: "pl-123",
            name: "Private Location 1",
            description: "A private location",
            tags: ["env:prod", "region:us-east"],
            metadata: { restricted_roles: ["admin"] },
          },
          {
            id: "pl-456",
            name: "Private Location 2",
            tags: [],
          },
        ],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });
      const result = await listSyntheticsPrivateLocations.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/synthetics/private-locations"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      listSyntheticsPrivateLocations.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(listSyntheticsPrivateLocations.execute({})).rejects.toThrow();
    });
  });
});
