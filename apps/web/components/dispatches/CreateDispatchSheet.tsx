"use client";

import { useCallback, useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
import { MapSelectionSheet } from "@/components/maps/MapSelectionSheet";
import { parseApiError, getErrorGuidance, getSuccessMessage } from "@/lib/error-handler";

interface CreateDispatchSheetProps {
  isAuthenticated: boolean;
  token: string | null;
  onSuccess?: () => void;
}

export function CreateDispatchSheet({
  isAuthenticated,
  token,
  onSuccess,
}: CreateDispatchSheetProps) {
  const [dispatchForm, setDispatchForm] = useState({
    region_id: "97201",
    client_id: "",
    lat: "45.512",
    lon: "-122.658",
    description: "",
    precision: "exact",
    urgency: "normal",
    location_description: "",
    radius_meters: null as number | null,
  });

  const [dispatchMessage, setDispatchMessage] = useState<string>("");
  const [dispatchStatus, setDispatchStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [errorDetails, setErrorDetails] = useState<{
    code?: string;
    actionLabel?: string;
    recoveryActions?: string[];
    isAuthError?: boolean;
  }>({});
  const [, setDispatchId] = useState<string>("");
  const [mapSheetOpen, setMapSheetOpen] = useState(false);
  const [locationSummary, setLocationSummary] = useState(
    "Pick a spot on the map to start."
  );
  const [geocodeStatus, setGeocodeStatus] = useState<
    "idle" | "loading" | "error"
  >("idle");
  const [geocodeHint, setGeocodeHint] = useState<string>("");
  const [locating, setLocating] = useState(false);
  const [mapInitialMode, setMapInitialMode] = useState<"precision" | "general">("general");
  const [mapRecenterToken, setMapRecenterToken] = useState(0);

  const radiusToPrecision = useCallback((radius?: number | null) => {
    if (typeof radius !== "number") return "exact";
    if (radius <= 150) return "exact";
    if (radius <= 400) return "block";
    if (radius <= 1500) return "neighborhood";
    return "city";
  }, []);

  const describePrecision = useCallback((precision: string, radius?: number | null) => {
    if (typeof radius === "number") {
      const km = (radius / 1000).toFixed(1);
      return `${precision} (~${km} km radius)`;
    }
    return precision;
  }, []);

  const reverseGeocode = useCallback(
    async (lat: number, lon: number) => {
      const fallbackDescription = `Lat ${lat.toFixed(4)}, Lon ${lon.toFixed(4)}`;
      try {
        setGeocodeStatus("loading");
        setGeocodeHint("Looking up address...");
        const url = `/api/geocode/reverse?lat=${lat}&lon=${lon}`;
        const res = await fetch(url, {
          headers: {
            Accept: "application/json",
          },
        });

        if (!res.ok) throw new Error("We couldn't look up the address right now.");

        const data = await res.json();
        const address = data?.address ?? {};

        const zipcode = address.postcode ?? dispatchForm.region_id;
        const city = address.city || address.town || address.village || address.hamlet;
        const road = address.road || address.neighbourhood || address.suburb;
        const state = address.state || address.county;

        const humanReadable = [road, city, state, zipcode].filter(Boolean).join(", ");
        const description =
          humanReadable || data?.display_name || fallbackDescription;

        setDispatchForm((prev) => ({
          ...prev,
          region_id: zipcode || prev.region_id,
          location_description: description || prev.location_description,
        }));

        setLocationSummary(
          humanReadable ? humanReadable : fallbackDescription
        );
        setGeocodeStatus("idle");
        setGeocodeHint(humanReadable ? "" : "Could not find a street address");
        return description;
      } catch (error) {
        setGeocodeStatus("error");
        setGeocodeHint(
          error instanceof Error ? error.message : "We couldn't find an address for that spot."
        );
        setDispatchForm((prev) => ({
          ...prev,
          location_description: fallbackDescription,
        }));
        setLocationSummary(fallbackDescription);
        return fallbackDescription;
      }
    },
    [dispatchForm.region_id]
  );

  const updateFromSelection = useCallback(
    async (
      newLat: number,
      newLon: number,
      mode?: "precision" | "general",
      radiusMeters?: number
    ) => {
      const inferredPrecision =
        typeof radiusMeters === "number"
          ? radiusToPrecision(radiusMeters)
          : mode === "general"
            ? "neighborhood"
            : "exact";

      setDispatchForm((prev) => ({
        ...prev,
        lat: newLat.toString(),
        lon: newLon.toString(),
        precision: mode === "general" ? inferredPrecision : "exact",
        radius_meters: radiusMeters ?? null,
      }));

      setMapSheetOpen(false);
      await reverseGeocode(newLat, newLon);

      setLocationSummary((prevSummary) => {
        const km = radiusMeters ? `${(radiusMeters / 1000).toFixed(1)} km radius` : "";
        const precisionText = describePrecision(
          mode === "general" ? inferredPrecision : "exact",
          radiusMeters ?? null
        );
        const base = prevSummary || `Lat ${newLat.toFixed(4)}, Lon ${newLon.toFixed(4)}`;
        return [base, km, precisionText].filter(Boolean).join(" · ");
      });
    },
    [describePrecision, radiusToPrecision, reverseGeocode]
  );

  const getBrowserLocation = useCallback(() => {
    return new Promise<GeolocationPosition>((resolve, reject) => {
      if (!navigator?.geolocation) {
        reject(new Error("Geolocation is not supported in this browser."));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0,
      });
    });
  }, []);

  const handleUseMapFirst = useCallback(async () => {
    setLocating(true);
    try {
      const pos = await getBrowserLocation();
      const { latitude, longitude, accuracy } = pos.coords;
      const approxRadius = Math.min(Math.max(Math.round(accuracy || 300), 100), 5000);

      await updateFromSelection(latitude, longitude, "general", approxRadius);
      setMapInitialMode("precision");
      setMapRecenterToken((prev) => prev + 1);
      setMapSheetOpen(true);
    } catch (error) {
      setDispatchMessage(
        error instanceof Error
          ? error.message
          : "We couldn't get your location. You can still pick it on the map."
      );
      setDispatchStatus("error");
      setMapSheetOpen(true);
    } finally {
      setLocating(false);
    }
  }, [getBrowserLocation, updateFromSelection, setDispatchMessage, setDispatchStatus]);

  const handleLocationSelect = (
    newLat: number,
    newLon: number,
    mode?: "precision" | "general",
    radiusMeters?: number
  ) => {
    void updateFromSelection(newLat, newLon, mode, radiusMeters);
  };

  const createDispatch = async () => {
    if (!isAuthenticated || !token) {
      setErrorDetails({
        code: "MISSING_TOKEN",
        actionLabel: "Sign in",
        isAuthError: true,
      });
      setDispatchStatus("error");
      setDispatchMessage("Your session expired. Please sign in again to send a report.");
      return;
    }

    // Validate location
    const errors: { [key: string]: string } = {};
    const lat = parseFloat(dispatchForm.lat);
    const lon = parseFloat(dispatchForm.lon);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.location = "Latitude must be between -90 and 90.";
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      errors.location = "Longitude must be between -180 and 180.";
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setErrorDetails({
        code: "VALIDATION_ERROR",
        actionLabel: "Fix and retry",
        recoveryActions: ["retry"],
      });
      setDispatchStatus("error");
      setDispatchMessage(
        "We couldn't send your report—please check your location and try again. Make sure latitude is between -90 and 90, and longitude is between -180 and 180."
      );
      return;
    }
    setFormErrors({});

    setDispatchStatus("loading");
    setDispatchMessage("Sending your report...");

    try {
      const payload = {
        region_id: dispatchForm.region_id,
        client_id: dispatchForm.client_id || crypto.randomUUID(),
        location: {
          lat: parseFloat(dispatchForm.lat),
          lon: parseFloat(dispatchForm.lon),
          description: dispatchForm.location_description || undefined,
          precision: dispatchForm.precision as
            | "exact"
            | "block"
            | "neighborhood"
            | "city",
          radius_meters: dispatchForm.radius_meters ?? undefined,
        },
        description: dispatchForm.description || undefined,
        urgency: dispatchForm.urgency as "low" | "normal" | "critical",
      };

      const response = await fetch("/api/dispatches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorContext = parseApiError(data);
        const guidance = getErrorGuidance(errorContext);
        setErrorDetails({
          code: guidance.code,
          actionLabel: guidance.actionLabel,
          recoveryActions: guidance.recoveryActions,
          isAuthError: guidance.isAuthError,
        });
        setDispatchStatus("error");
        setDispatchMessage(guidance.message);
        return;
      }

      // Success
      const successMsg = getSuccessMessage({
        dispatch_id: data.id,
        urgency: dispatchForm.urgency,
      });
      setDispatchId(data.id);
      setDispatchStatus("success");
      setDispatchMessage(successMsg);
      setDispatchForm((prev) => ({ ...prev, client_id: "" }));
      setErrorDetails({});

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const errorContext = parseApiError(error);
      const guidance = getErrorGuidance(errorContext);
      setErrorDetails({
        code: guidance.code,
        actionLabel: guidance.actionLabel,
        recoveryActions: guidance.recoveryActions,
        isAuthError: guidance.isAuthError,
      });
      setDispatchStatus("error");
      setDispatchMessage(guidance.message);
    }
  };

  const handleRetry = () => {
    setErrorDetails({});
    setDispatchStatus("idle");
    setDispatchMessage("");
    void createDispatch();
  };

  const handleReset = () => {
    setErrorDetails({});
    setDispatchStatus("idle");
    setDispatchMessage("");
    setDispatchForm({
      region_id: "97201",
      client_id: "",
      lat: "45.512",
      lon: "-122.658",
      description: "",
      precision: "exact",
      urgency: "normal",
      location_description: "",
      radius_meters: null,
    });
    setLocationSummary("Pick a spot on the map to start.");
    setFormErrors({});
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Report Something</Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto"
        role="dialog"
        aria-labelledby="dispatch-title"
        aria-describedby="dispatch-description"
      >
        <SheetTitle id="dispatch-title">Report something</SheetTitle>
        <SheetHeader>
          <SheetDescription id="dispatch-description" className="mt-3">
            Share what is happening in your area. Approximate location is fine.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          <fieldset className="rounded-lg border border-border bg-muted/40 p-4 space-y-2">
            <legend className="text-sm font-semibold text-foreground">Step 1: Pick location on map</legend>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{locationSummary}</p>
                {geocodeStatus === "loading" && (
                  <p className="text-xs text-primary">Looking up address...</p>
                )}
                {geocodeStatus === "error" && geocodeHint && (
                  <p className="text-xs text-destructive">{geocodeHint}</p>
                )}
                {geocodeStatus === "idle" && geocodeHint && (
                  <p className="text-xs text-muted-foreground">{geocodeHint}</p>
                )}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUseMapFirst}
                  disabled={locating}
                >
                  {locating ? "Locating..." : "Use my location"}
                </Button>
                <MapSelectionSheet
                  lat={parseFloat(dispatchForm.lat)}
                  lon={parseFloat(dispatchForm.lon)}
                  radius={dispatchForm.radius_meters ?? undefined}
                  initialMode={mapInitialMode}
                  triggerMode="general"
                  recenterToken={mapRecenterToken}
                  onLocationSelect={handleLocationSelect}
                  isOpen={mapSheetOpen}
                  onOpenChange={setMapSheetOpen}
                />
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              How close: {describePrecision(dispatchForm.precision, dispatchForm.radius_meters)}
            </div>
            {formErrors.location && (
              <p className="text-xs text-destructive bg-rose-50 dark:bg-rose-900/20 rounded px-2 py-1">
                {formErrors.location}
              </p>
            )}
          </fieldset>

          <fieldset className="grid grid-cols-1 gap-3">
            <legend className="sr-only">Report details</legend>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground" htmlFor="region-input">
                Area (Zipcode)
              </label>
              <input
                id="region-input"
                aria-label="Area zip code"
                aria-describedby="region-help"
                className="w-full rounded-lg border border-border bg-background text-foreground px-3 py-2 text-sm focus:border-primary focus:outline-none"
                value={dispatchForm.region_id}
                onChange={(e) =>
                  setDispatchForm({ ...dispatchForm, region_id: e.target.value })
                }
              />
              <p id="region-help" className="text-xs text-muted-foreground">5-digit ZIP code</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground" htmlFor="precision-select">
                How close is this?
              </label>
              <Select value={dispatchForm.precision} onValueChange={(value) => setDispatchForm({ ...dispatchForm, precision: value })}>
                <SelectTrigger className="w-full" id="precision-select" aria-label="How close is this?" aria-describedby="precision-help">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exact">Exact (pinpoint location)</SelectItem>
                  <SelectItem value="block">Block (one city block)</SelectItem>
                  <SelectItem value="neighborhood">Neighborhood (few blocks)</SelectItem>
                  <SelectItem value="city">City (general area)</SelectItem>
                </SelectContent>
              </Select>
              <p id="precision-help" className="text-xs text-muted-foreground">How precise is your location?</p>
              {dispatchForm.radius_meters && (
                <p className="text-xs text-muted-foreground">
                  Radius: {(dispatchForm.radius_meters / 1000).toFixed(1)} km
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground" htmlFor="urgency-select">
                How urgent is this?
              </label>
              <Select value={dispatchForm.urgency} onValueChange={(value) => setDispatchForm({ ...dispatchForm, urgency: value })}>
                <SelectTrigger className="w-full" id="urgency-select" aria-label="Report urgency level" aria-describedby="urgency-help">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">They are okay for now (low urgency)</SelectItem>
                  <SelectItem value="normal">Needs help soon (normal urgency)</SelectItem>
                  <SelectItem value="critical">Someone is in danger right now (critical urgency)</SelectItem>
                </SelectContent>
              </Select>
              <p id="urgency-help" className="text-xs text-muted-foreground">Select the urgency level that best describes the situation.</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground" htmlFor="location-desc-input">
                Anything else about this place?
              </label>
              <input
                id="location-desc-input"
                aria-label="Additional location details"
                aria-describedby="location-desc-help"
                className="w-full rounded-lg border border-border bg-background text-foreground px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="E.g., near the park, by the statue"
                value={dispatchForm.location_description}
                onChange={(e) =>
                  setDispatchForm({
                    ...dispatchForm,
                    location_description: e.target.value,
                  })
                }
              />
              <p id="location-desc-help" className="text-xs text-muted-foreground">Optional: add landmarks or details</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground" htmlFor="description-input">
                What is happening?
              </label>
              <p id="description-help" className="text-[11px] text-muted-foreground">
                Quick understanding (optional): What changed, who is affected, any hazards, and when it started.
              </p>
              <textarea
                id="description-input"
                aria-label="Report description"
                aria-describedby="description-help"
                className="w-full rounded-lg border border-border bg-background text-foreground px-3 py-2 text-sm focus:border-primary focus:outline-none"
                rows={3}
                placeholder="What is going on? A few words are enough."
                value={dispatchForm.description}
                onChange={(e) =>
                  setDispatchForm({
                    ...dispatchForm,
                    description: e.target.value,
                  })
                }
              />
            </div>
          </fieldset>

          {!isAuthenticated && (
            <div role="alert" className="text-xs text-destructive bg-rose-50 dark:bg-rose-900/20 rounded-lg px-3 py-2">
              Sign in to send a report.
            </div>
          )}

          {dispatchMessage && (
            <div className="space-y-2">
              <div
                id="form-status"
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className={`text-sm rounded-lg px-3 py-2 ${dispatchStatus === "success"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
                  : dispatchStatus === "error"
                    ? "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200"
                    : "bg-muted text-muted-foreground"
                  }`}
              >
                {dispatchMessage}
              </div>

              {/* Error recovery actions */}
              {dispatchStatus === "error" && errorDetails.recoveryActions && (
                <div className="flex flex-col gap-2">
                  {errorDetails.recoveryActions.includes("retry") && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRetry}
                      aria-label={errorDetails.actionLabel || "Retry"}
                      className="w-full"
                    >
                      {errorDetails.actionLabel || "Try again"}
                    </Button>
                  )}
                  {errorDetails.recoveryActions.includes("change-region") && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleReset}
                      aria-label="Change region and try again"
                      className="w-full"
                    >
                      Change region and try again
                    </Button>
                  )}
                  {errorDetails.recoveryActions.includes("sign-in") && (
                    <SheetClose asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        aria-label="Go to sign in"
                        className="w-full"
                      >
                        Go to sign in
                      </Button>
                    </SheetClose>
                  )}
                  {errorDetails.recoveryActions.includes("contact-support") && (
                    <p className="text-xs text-muted-foreground px-1">
                      If the issue persists, contact support.
                    </p>
                  )}
                </div>
              )}

              {/* Success next steps */}
              {dispatchStatus === "success" && (
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>✓ Your report is now visible to responders and the public in your area.</p>
                  <p>✓ You can send another report or close this window.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <SheetFooter className="mt-6">
          {dispatchStatus === "success" ? (
            <>
              <SheetClose asChild>
                <Button
                  variant="outline"
                  aria-label="Close report dialog"
                >
                  Close
                </Button>
              </SheetClose>
              <Button
                onClick={handleReset}
                aria-label="Send another report"
              >
                Send another report
              </Button>
            </>
          ) : (
            <>
              <SheetClose asChild>
                <Button
                  variant="outline"
                  aria-label="Close report dialog"
                  disabled={dispatchStatus === "loading"}
                >
                  Cancel
                </Button>
              </SheetClose>
              <Button
                disabled={!isAuthenticated || dispatchStatus === "loading"}
                onClick={createDispatch}
                aria-label={
                  dispatchStatus === "loading"
                    ? "Sending your report, please wait"
                    : "Send report"
                }
              >
                {dispatchStatus === "loading" ? "Sending your report..." : "Send report"}
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
