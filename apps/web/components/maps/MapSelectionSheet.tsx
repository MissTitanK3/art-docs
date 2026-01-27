"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@repo/ui";
import { LocationMapPicker } from "./LocationMapPicker";

interface MapSelectionSheetProps {
  lat: number;
  lon: number;
  radius?: number;
  initialMode?: "precision" | "general";
  triggerMode?: "precision" | "general";
  recenterToken?: number;
  onLocationSelect: (
    lat: number,
    lon: number,
    mode?: "precision" | "general",
    radiusMeters?: number
  ) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Sheet component that wraps the map picker
 * Allows users to visually select a location on a map
 */
export function MapSelectionSheet({
  lat,
  lon,
  radius,
  initialMode,
  triggerMode = "general",
  recenterToken,
  onLocationSelect,
  isOpen = false,
  onOpenChange,
}: MapSelectionSheetProps) {
  const [selectedLocation, setSelectedLocation] = useState({
    lat,
    lon,
  });
  const [selectedMode, setSelectedMode] = useState<"precision" | "general">(
    initialMode ?? (radius ? "general" : "precision")
  );
  const [selectedRadius, setSelectedRadius] = useState(radius ?? 1000);
  const [pickerKey, setPickerKey] = useState(0);

  useEffect(() => {
    if (typeof radius === "number") {
      setSelectedRadius(radius);
      setSelectedMode("general");
    }
  }, [radius]);

  useEffect(() => {
    setSelectedLocation({ lat, lon });
  }, [lat, lon]);

  useEffect(() => {
    if (!isOpen) return;
    const mode = initialMode ?? (radius ? "general" : "precision");
    setSelectedMode(mode);
  }, [isOpen, initialMode, radius]);

  useEffect(() => {
    if (typeof recenterToken === "number") {
      setPickerKey(recenterToken);
    }
  }, [recenterToken]);

  const handleLocationSelect = (
    newLat: number,
    newLon: number,
    mode?: "precision" | "general",
    radiusMeters?: number
  ) => {
    setSelectedLocation({ lat: newLat, lon: newLon });
    if (mode) {
      setSelectedMode(mode);
    }
    if (typeof radiusMeters === "number") {
      setSelectedRadius(radiusMeters);
    }
  };

  const handleConfirm = () => {
    onLocationSelect(
      selectedLocation.lat,
      selectedLocation.lon,
      selectedMode,
      selectedMode === "general" ? selectedRadius : undefined
    );
    onOpenChange?.(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedMode(triggerMode)}
        >
          📍 Pick on Map
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetTitle>Select Location on Map</SheetTitle>
        <SheetHeader className="mt-3">
          <SheetDescription>
            Click on the map to place a marker, or drag it to adjust. Your location will be sent with the report.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <LocationMapPicker
            key={pickerKey}
            initialLat={selectedLocation.lat}
            initialLon={selectedLocation.lon}
            initialMode={selectedMode}
            initialRadius={selectedRadius}
            onLocationSelect={handleLocationSelect}
          />
        </div>

        <SheetFooter className="mt-6">
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button onClick={handleConfirm}>
            ✓ Use This Location
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
