import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listRestrictionPolicies } from "./listRestrictionPolicies.js";

describe("listRestrictionPolicies", () => {
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
      expect(() => listRestrictionPolicies.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listRestrictionPolicies: fresh } = await import("./listRestrictionPolicies.js");
      await expect(fresh.execute({ resource_id: "test-resource" })).rejects.toThrow(
        "listRestrictionPolicies not initialized",
      );
    });

    it("throws if resource_id not provided", async () => {
      listRestrictionPolicies.initialize();
      await expect(listRestrictionPolicies.execute({ resource_id: "" })).rejects.toThrow(
        "resource_id is required",
      );
    });

    it("makes correct API call and returns results", async () => {
      listRestrictionPolicies.initialize();
      const mockResponse = {
        data: {
          id: "policy-1",
          type: "restriction_policy",
          attributes: {
            bindings: [
              {
                relation: "editor",
                principals: ["user:test@example.com"],
              },
            ],
          },
        },
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });
      const result = await listRestrictionPolicies.execute({
        resource_id: "test-resource",
      });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/restriction_policy/test-resource"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes params when provided", async () => {
      listRestrictionPolicies.initialize();
      const mockResponse = { data: {} };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });
      await listRestrictionPolicies.execute({
        resource_id: "my-resource-123",
      });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/restriction_policy/my-resource-123"),
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("handles API errors", async () => {
      listRestrictionPolicies.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(
        listRestrictionPolicies.execute({ resource_id: "test-resource" }),
      ).rejects.toThrow();
    });
  });
});
