"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { Slider } from "@repo/ui";

type SelectionMode = "precision" | "general";
type LeafletModule = typeof import("leaflet");

interface LocationMapPickerProps {
  initialLat?: number;
  initialLon?: number;
  initialMode?: SelectionMode;
  initialRadius?: number;
  onLocationSelect: (
    lat: number,
    lon: number,
    mode?: SelectionMode,
    radiusMeters?: number
  ) => void;
}

function round6(n: number) {
  return Number(n.toFixed(6));
}

export function LocationMapPicker({
  initialLat = 45.512,
  initialLon = -122.658,
  initialMode = "precision",
  initialRadius,
  onLocationSelect,
}: LocationMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const circleRef = useRef<import("leaflet").Circle | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);

  const debounceTimerRef = useRef<number | null>(null);

  const [mode, setMode] = useState<SelectionMode>(initialMode);
  const [radius, setRadius] = useState(initialRadius ?? 1000);
  const [coordinates, setCoordinates] = useState(() => ({
    lat: initialLat,
    lon: initialLon,
  }));

  const modeRef = useRef(mode);
  const radiusRef = useRef(radius);
  const onLocationSelectRef = useRef(onLocationSelect);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    radiusRef.current = radius;
  }, [radius]);

  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  useEffect(() => {
    if (typeof initialRadius !== "number") return;
    setRadius(initialRadius);
    radiusRef.current = initialRadius;

    if (circleRef.current) {
      circleRef.current.setRadius(initialRadius);
    }
  }, [initialRadius]);

  const mapLabel = useMemo(() => {
    return "Interactive map. Crosshair marks the selected location. Use arrow keys to pan, plus or minus to zoom, and Enter to confirm.";
  }, []);

  const updateFromCenter = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const center = map.getCenter();
    const lat = round6(center.lat);
    const lon = round6(center.lng);

    setCoordinates({ lat, lon });
    const currentRadius =
      modeRef.current === "general" ? radiusRef.current : undefined;

    onLocationSelectRef.current(lat, lon, modeRef.current, currentRadius);

    if (modeRef.current === "general" && circleRef.current) {
      circleRef.current.setLatLng(center);
    }
  }, []);

  const scheduleUpdateFromCenter = useCallback(() => {
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = window.setTimeout(() => {
      updateFromCenter();
    }, 120);
  }, [updateFromCenter]);

  const confirmSelection = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const center = map.getCenter();
    const lat = round6(center.lat);
    const lon = round6(center.lng);

    const currentRadius =
      modeRef.current === "general" ? radiusRef.current : undefined;

    onLocationSelectRef.current(lat, lon, modeRef.current, currentRadius);
  }, []);

  // Initialize Leaflet map once
  useEffect(() => {
    let disposed = false;

    const init = async () => {
      if (!mapContainerRef.current) return;
      if (mapRef.current) return;

      const L = await import("leaflet");
      if (disposed) return;

      leafletRef.current = L;

      // HMR safety: Leaflet can leave an internal id on the container
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const containerAny = mapContainerRef.current as any;
      if (containerAny._leaflet_id) {
        delete containerAny._leaflet_id;
      }

      const map = L.map(mapContainerRef.current, {
        keyboard: false, // we handle keyboard ourselves on a separate focus layer
        dragging: true,
        scrollWheelZoom: true,
        touchZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        zoomControl: true,
      });

      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      map.setView([initialLat, initialLon], 13);

      map.on("moveend", scheduleUpdateFromCenter);
      map.on("zoomend", scheduleUpdateFromCenter);

      map.whenReady(() => {
        updateFromCenter();
      });
    };

    void init();

    return () => {
      disposed = true;

      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      if (circleRef.current) {
        circleRef.current.remove();
        circleRef.current = null;
      }

      const map = mapRef.current;
      if (map) {
        map.off("moveend", scheduleUpdateFromCenter);
        map.off("zoomend", scheduleUpdateFromCenter);
        map.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Respond to prop changes without reinitializing the map
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setView([initialLat, initialLon], map.getZoom(), { animate: false });
    updateFromCenter();
  }, [initialLat, initialLon, updateFromCenter]);

  // Circle lifecycle
  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L) return;

    if (mode === "general") {
      if (!circleRef.current) {
        circleRef.current = L.circle(map.getCenter(), {
          radius,
          color: "#60a5fa",
          weight: 2,
          fillOpacity: 0.05,
          interactive: false,
        }).addTo(map);
      } else {
        circleRef.current.setRadius(radius);
        circleRef.current.setLatLng(map.getCenter());
        if (!map.hasLayer(circleRef.current)) {
          circleRef.current.addTo(map);
        }
      }
    } else {
      if (circleRef.current) {
        circleRef.current.remove();
        circleRef.current = null;
      }
    }
  }, [mode, radius]);

  // Focus radius slider when entering general mode
  useEffect(() => {
    if (mode !== "general") return;
    const id = window.requestAnimationFrame(() => {
      const el = document.getElementById("radius-slider");
      if (el instanceof HTMLElement) el.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [mode]);

  const handleMapKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const map = mapRef.current;
      if (!map) return;

      const panStep = 80;

      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          map.panBy([0, -panStep]);
          break;
        case "ArrowDown":
          event.preventDefault();
          map.panBy([0, panStep]);
          break;
        case "ArrowLeft":
          event.preventDefault();
          map.panBy([-panStep, 0]);
          break;
        case "ArrowRight":
          event.preventDefault();
          map.panBy([panStep, 0]);
          break;
        case "+":
        case "=":
          event.preventDefault();
          map.zoomIn();
          break;
        case "-":
          event.preventDefault();
          map.zoomOut();
          break;
        case "Enter":
          event.preventDefault();
          confirmSelection();
          break;
        default:
          break;
      }
    },
    [confirmSelection]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2" role="group" aria-label="Location selection mode">
        <button
          type="button"
          onClick={() => setMode("precision")}
          className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${mode === "precision"
            ? "bg-blue-600 text-white"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          aria-pressed={mode === "precision"}
        >
          Pin
        </button>
        <button
          type="button"
          onClick={() => setMode("general")}
          className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${mode === "general"
            ? "bg-blue-600 text-white"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          aria-pressed={mode === "general"}
        >
          Radius
        </button>
      </div>

      <div className="relative w-full h-96 rounded-lg border border-border overflow-hidden">
        {/* Leaflet owns pointer events */}
        <div ref={mapContainerRef} className="absolute inset-0" />

        {/* Focus-only overlay for keyboard and screen readers.
            pointer-events-none ensures it never blocks dragging. */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 900 }}
        >
          <div
            tabIndex={0}
            onKeyDown={handleMapKeyDown}
            role="region"
            aria-roledescription="interactive map"
            aria-label={mapLabel}
            aria-describedby="map-interaction-instructions"
            className="absolute inset-0 outline-none pointer-events-none"
          />
        </div>

        {/* Crosshair overlay */}
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          style={{ zIndex: 1000 }}
        >
          <div className="relative w-12 h-12">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-500 -translate-y-1/2" />
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-blue-500 -translate-x-1/2" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500" />
          </div>
        </div>
      </div>

      <div className="bg-muted rounded-lg p-3 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">Latitude:</span>
          <span className="text-sm font-mono text-muted-foreground">
            {coordinates.lat.toFixed(6)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">Longitude:</span>
          <span className="text-sm font-mono text-muted-foreground">
            {coordinates.lon.toFixed(6)}
          </span>
        </div>
        {mode === "general" && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">Radius:</span>
            <span className="text-sm font-mono text-muted-foreground">
              {(radius / 1000).toFixed(1)} km
            </span>
          </div>
        )}
      </div>

      {mode === "general" && (
        <div className="space-y-2">
          <label htmlFor="radius-slider" className="text-sm font-medium text-foreground">
            Adjust Radius
          </label>
          <Slider
            id="radius-slider"
            min={100}
            max={5000}
            step={100}
            value={[radius]}
            onValueChange={(value) => {
              if (value[0] !== undefined) {
                setRadius(value[0]);
                radiusRef.current = value[0];

                if (modeRef.current === "general") {
                  onLocationSelectRef.current(
                    coordinates.lat,
                    coordinates.lon,
                    modeRef.current,
                    value[0]
                  );
                }
              }
            }}
            className="w-full"
            aria-label="Adjust radius of search area"
          />
          <p className="text-xs text-muted-foreground">
            {(radius / 1000).toFixed(1)} km radius
          </p>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3" id="map-interaction-instructions">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          {mode === "precision" ? (
            <>
              💡 <strong>Precision Mode:</strong> Drag the map to move the crosshair selection, or
              tab to the map and use arrow keys. Coordinates update after movement.
            </>
          ) : (
            <>
              💡 <strong>General Area Mode:</strong> Drag the map to move the circle center, or use
              arrow keys. Adjust radius with the slider. Press Enter or use confirm.
            </>
          )}
        </p>
      </div>

      <div className="sr-only" aria-live="polite">
        Selected location {coordinates.lat.toFixed(6)}, {coordinates.lon.toFixed(6)} in {mode} mode
        {mode === "general" ? ` with ${(radius / 1000).toFixed(1)} kilometer radius.` : "."}
      </div>
    </div>
  );
}
