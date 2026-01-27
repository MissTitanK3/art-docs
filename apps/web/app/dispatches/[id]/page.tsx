"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { getDispatch, type Dispatch } from "@/lib/api";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { ArrowLeft } from "lucide-react";
import "leaflet/dist/leaflet.css";

export default function DispatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();
  const [dispatch, setDispatch] = useState<Dispatch | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("loading");
  const [locationArea, setLocationArea] = useState<string | null>(null);
  const [locationAreaStatus, setLocationAreaStatus] = useState<
    "idle" | "loading" | "error"
  >("idle");
  const mapPreviewRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<import("leaflet").CircleMarker | null>(null);
  const statusLabel = dispatch?.status_display || dispatch?.status || "";

  useEffect(() => {
    const loadDispatch = async () => {
      setStatus("loading");
      try {
        const data = await getDispatch(id, token || undefined);
        setDispatch(data);
        setStatus("success");
      } catch (err) {
        console.error("[DispatchDetailPage] Failed to load dispatch:", err instanceof Error ? err.message : err);
        setStatus("error");
      }
    };

    if (id) {
      loadDispatch();
    }
  }, [id, token]);

  useEffect(() => {
    const lookupCityState = async () => {
      if (!dispatch) return;
      setLocationAreaStatus("loading");
      try {
        const res = await fetch(
          `/api/geocode/reverse?lat=${dispatch.location.lat}&lon=${dispatch.location.lon}`
        );
        if (!res.ok) {
          throw new Error("Lookup failed");
        }
        const data = await res.json();
        const address = data?.address ?? {};
        const city =
          address.city ||
          address.town ||
          address.village ||
          address.hamlet ||
          address.suburb;
        const state = address.state || address.county;
        const label = [city, state].filter(Boolean).join(", ");
        setLocationArea(label || null);
        setLocationAreaStatus("idle");
      } catch {
        setLocationArea(null);
        setLocationAreaStatus("error");
      }
    };

    lookupCityState();
  }, [dispatch?.location?.lat, dispatch?.location?.lon, dispatch]);

  useEffect(() => {
    if (!dispatch) return;

    let disposed = false;

    const renderMap = async () => {
      if (!mapPreviewRef.current) return;
      const L = await import("leaflet");
      if (disposed) return;

      // HMR safety: Leaflet can leave an internal id on the container
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const containerAny = mapPreviewRef.current as any;
      if (containerAny._leaflet_id) {
        delete containerAny._leaflet_id;
      }

      if (!mapInstanceRef.current) {
        const map = L.map(mapPreviewRef.current, {
          center: [dispatch.location.lat, dispatch.location.lon],
          zoom: 13,
          zoomControl: false,
          attributionControl: false,
          dragging: true,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          boxZoom: false,
          keyboard: false,
          touchZoom: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      map.setView([dispatch.location.lat, dispatch.location.lon], 13, {
        animate: false,
      });

      if (!markerRef.current) {
        markerRef.current = L.circleMarker(
          [dispatch.location.lat, dispatch.location.lon],
          {
            radius: 7,
            color: "#2563eb",
            fillColor: "#1d4ed8",
            fillOpacity: 0.85,
            weight: 2,
            interactive: false,
          }
        ).addTo(map);
      } else {
        markerRef.current.setLatLng([dispatch.location.lat, dispatch.location.lon]);
      }
    };

    void renderMap();

    return () => {
      disposed = true;
    };
  }, [dispatch]);

  useEffect(() => {
    const container = mapPreviewRef.current;
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch {
          // ignore if map was already disposed
        }
        mapInstanceRef.current = null;
      }
      if (container) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const containerAny = container as any;
        if (containerAny._leaflet_id) {
          delete containerAny._leaflet_id;
        }
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push("/dispatches");
            }
          }}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to list
        </Button>

        {status === "loading" && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Loading details…
            </CardContent>
          </Card>
        )}

        {status === "error" && (
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <p className="text-destructive">
                We couldn&apos;t load this dispatch right now.
              </p>
              <p className="text-sm text-muted-foreground">
                It might have been removed, or there could be a connection issue.
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Try again
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/dispatches")}
                >
                  Back to list
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {status === "success" && dispatch && (
          <Card>
            <CardHeader>
              <div className="flex flex-col items-start justify-between">
                <CardTitle className="text-2xl">Report Details</CardTitle>
                <div className="flex gap-2 justify-evenly w-full mt-4">
                  <Badge>
                    ID: {dispatch.id}
                  </Badge>
                  <Badge variant="outline" className="bg-muted text-foreground border-transparent capitalize">
                    {statusLabel}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`capitalize border-transparent ${dispatch.urgency === "critical"
                      ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
                      : dispatch.urgency === "normal"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
                      }`}
                  >
                    {dispatch.urgency}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Limited view for unauthenticated users */}
              {!isAuthenticated && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                      Status overview
                    </h3>
                    <p className="text-foreground text-sm">
                      This report is currently <span className="font-semibold">{statusLabel}</span> with an urgency of <span className="font-semibold">{dispatch.urgency}</span>.
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Sign in to view full details, location, and coordination updates.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                      Created
                    </h3>
                    <p className="text-foreground text-sm">
                      {new Date(dispatch.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Full view for authenticated users */}
              {isAuthenticated && (
                <div className="grid gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                      What&apos;s happening?
                    </h3>
                    <p className="text-foreground">
                      {dispatch.description ?? "No description provided."}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                      Anything else about this place?
                    </h3>
                    <p className="text-foreground">
                      {dispatch.location_description || "—"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                        Area (Zipcode)
                      </h3>
                      <p className="font-mono text-primary">{dispatch.region_id}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                        How close is this?
                      </h3>
                      <p className="text-foreground capitalize">{dispatch.location_precision}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                        Submitted by
                      </h3>
                      <p className="text-foreground text-sm">
                        {dispatch.client_id || "—"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                        Last updated
                      </h3>
                      <p className="text-foreground text-sm">
                        {new Date(dispatch.updated_at ?? dispatch.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                      Created
                    </h3>
                    <p className="text-foreground text-sm">
                      {new Date(dispatch.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                          Location overview
                        </h3>
                        <p className="text-foreground text-sm">
                          {locationAreaStatus === "loading" && "Looking this up..."}
                          {locationAreaStatus === "error" && "Couldn't look up the area name right now."}
                          {locationAreaStatus === "idle" && (locationArea || "—")}
                        </p>
                      </div>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="font-normal"
                      >
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${dispatch.location.lat},${dispatch.location.lon}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open map
                        </a>
                      </Button>
                    </div>

                    <div className="h-56 w-full overflow-hidden rounded-lg border border-border">
                      <div
                        ref={mapPreviewRef}
                        className="h-full w-full"
                        aria-label="Map preview"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
