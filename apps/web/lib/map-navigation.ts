"use client";

/**
 * Map navigation utilities for opening locations in different map applications
 *
 * Supports:
 * - Google Maps
 * - Apple Maps
 * - OpenStreetMap
 * - Waze
 * - Auto-detects user's platform
 */

export interface LocationCoordinates {
  lat: number;
  lon: number;
  label?: string;
}

/**
 * Opens Google Maps for the given coordinates
 */
export function openGoogleMaps(location: LocationCoordinates): void {
  const { lat, lon, label } = location;
  const query = label ? `${label}@${lat},${lon}` : `${lat},${lon}`;
  const url = `https://maps.google.com/maps?q=${query}&z=15`;
  window.open(url, "_blank");
}

/**
 * Opens Apple Maps for the given coordinates
 * Works best on iOS devices
 */
export function openAppleMaps(location: LocationCoordinates): void {
  const { lat, lon } = location;
  const params = new URLSearchParams();
  params.set("ll", `${lat},${lon}`);
  params.set("z", "15");

  const url = `maps://maps.apple.com/?${params.toString()}`;
  window.location.href = url;
}

/**
 * Opens OpenStreetMap for the given coordinates
 */
export function openOpenStreetMap(location: LocationCoordinates): void {
  const { lat, lon } = location;
  const zoom = 15;
  const url = `https://www.openstreetmap.org/?zoom=${zoom}&lat=${lat}&lon=${lon}`;
  window.open(url, "_blank");
}

/**
 * Opens Waze for the given coordinates
 */
export function openWaze(location: LocationCoordinates): void {
  const { lat, lon } = location;
  const url = `https://waze.com/ul?ll=${lat},${lon}&navigate=yes`;
  window.open(url, "_blank");
}

/**
 * Detects the user's platform and opens the appropriate map
 * Priority: Apple Maps (iOS) > Google Maps > OpenStreetMap
 */
export function openMapAuto(location: LocationCoordinates): void {
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);

  if (isIOS) {
    try {
      openAppleMaps(location);
    } catch {
      // Fallback to Google Maps if Apple Maps fails
      openGoogleMaps(location);
    }
  } else if (isAndroid) {
    openGoogleMaps(location);
  } else {
    // Desktop - use Google Maps as default
    openGoogleMaps(location);
  }
}

/**
 * Component for "Go To" buttons
 * Shows available map options based on platform
 */
export function getMapOptions(location: LocationCoordinates): Array<{
  label: string;
  icon: string;
  action: () => void;
}> {
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);

  return [
    {
      label: "Google Maps",
      icon: "🗺️",
      action: () => openGoogleMaps(location),
    },
    ...(isIOS
      ? [
          {
            label: "Apple Maps",
            icon: "🍎",
            action: () => openAppleMaps(location),
          },
        ]
      : []),
    {
      label: "OpenStreetMap",
      icon: "🌍",
      action: () => openOpenStreetMap(location),
    },
    {
      label: "Waze",
      icon: "📍",
      action: () => openWaze(location),
    },
  ];
}
