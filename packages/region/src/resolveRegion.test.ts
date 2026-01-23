import { describe, it, expect } from "vitest";
import { resolveRegion, DEFAULT_REGION } from "./resolveRegion.js";

describe("resolveRegion", () => {
    describe("subdomain extraction", () => {
        it("extracts region from subdomain with port", () => {
            expect(resolveRegion({ host: "pnw.example.com:3000" })).toBe("PNW");
        });

        it("extracts region from subdomain without port", () => {
            expect(resolveRegion({ host: "nyc.example.com" })).toBe("NYC");
        });

        it("handles multi-level subdomains", () => {
            expect(resolveRegion({ host: "api.pnw.example.com" })).toBe("API");
        });
    });

    describe("header fallback", () => {
        it("uses headerRegion when host has no subdomain", () => {
            expect(
                resolveRegion({ host: "example.com", headerRegion: "ca" })
            ).toBe("CA");
        });

        it("uses headerRegion when host is null", () => {
            expect(resolveRegion({ host: null, headerRegion: "nyc" })).toBe("NYC");
        });
    });

    describe("default fallback", () => {
        it("returns DEFAULT_REGION when no region found", () => {
            expect(resolveRegion({})).toBe(DEFAULT_REGION);
        });

        it("returns custom fallback when provided", () => {
            expect(resolveRegion({ fallbackRegion: "custom" })).toBe("CUSTOM");
        });

        it("uses default for two-part hosts", () => {
            expect(resolveRegion({ host: "example.com" })).toBe(DEFAULT_REGION);
        });
    });
});
