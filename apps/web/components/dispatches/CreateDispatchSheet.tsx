"use client";

import { useState } from "react";
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
    location_description: "Test location",
  });

  const [dispatchMessage, setDispatchMessage] = useState<string>("");
  const [dispatchStatus, setDispatchStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const createDispatch = async () => {
    if (!isAuthenticated || !token) {
      setDispatchStatus("error");
      setDispatchMessage("You must be logged in to create a dispatch.");
      return;
    }

    setDispatchStatus("loading");
    setDispatchMessage("Submitting dispatch...");

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
        throw new Error(data.error || "Failed to create dispatch");
      }

      setDispatchStatus("success");
      setDispatchMessage(`Dispatch created with id ${data.dispatch_id}`);
      setDispatchForm((prev) => ({ ...prev, client_id: "" }));

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setDispatchStatus("error");
      setDispatchMessage(
        error instanceof Error ? error.message : "Dispatch failed"
      );
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Create Report</Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>Create Dispatch</SheetTitle>
          <SheetDescription>
            POST /api/dispatches with idempotency via client_id
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Region (zip)
              </label>
              <input
                className="w-full rounded-lg border border-border bg-background text-foreground px-3 py-2 text-sm focus:border-primary focus:outline-none"
                value={dispatchForm.region_id}
                onChange={(e) =>
                  setDispatchForm({ ...dispatchForm, region_id: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                client_id (optional UUID)
              </label>
              <input
                className="w-full rounded-lg border border-border bg-background text-foreground px-3 py-2 text-sm focus:border-primary focus:outline-none"
                value={dispatchForm.client_id}
                onChange={(e) =>
                  setDispatchForm({ ...dispatchForm, client_id: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Latitude
              </label>
              <input
                className="w-full rounded-lg border border-border bg-background text-foreground px-3 py-2 text-sm focus:border-primary focus:outline-none"
                value={dispatchForm.lat}
                onChange={(e) =>
                  setDispatchForm({ ...dispatchForm, lat: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Longitude
              </label>
              <input
                className="w-full rounded-lg border border-border bg-background text-foreground px-3 py-2 text-sm focus:border-primary focus:outline-none"
                value={dispatchForm.lon}
                onChange={(e) =>
                  setDispatchForm({ ...dispatchForm, lon: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Location precision
              </label>
              <Select value={dispatchForm.precision} onValueChange={(value) => setDispatchForm({ ...dispatchForm, precision: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exact">Exact</SelectItem>
                  <SelectItem value="block">Block</SelectItem>
                  <SelectItem value="neighborhood">Neighborhood</SelectItem>
                  <SelectItem value="city">City</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Urgency
              </label>
              <Select value={dispatchForm.urgency} onValueChange={(value) => setDispatchForm({ ...dispatchForm, urgency: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Location description
              </label>
              <input
                className="w-full rounded-lg border border-border bg-background text-foreground px-3 py-2 text-sm focus:border-primary focus:outline-none"
                value={dispatchForm.location_description}
                onChange={(e) =>
                  setDispatchForm({
                    ...dispatchForm,
                    location_description: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Description
              </label>
              <textarea
                className="w-full rounded-lg border border-border bg-background text-foreground px-3 py-2 text-sm focus:border-primary focus:outline-none"
                rows={3}
                value={dispatchForm.description}
                onChange={(e) =>
                  setDispatchForm({
                    ...dispatchForm,
                    description: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {!isAuthenticated && (
            <p className="text-xs text-destructive">Login required</p>
          )}

          {dispatchMessage && (
            <p
              className={`text-sm rounded-lg px-3 py-2 ${dispatchStatus === "success"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
                : dispatchStatus === "error"
                  ? "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200"
                  : "bg-muted text-muted-foreground"
                }`}
            >
              {dispatchMessage}
            </p>
          )}
        </div>

        <SheetFooter className="mt-6">
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button
            disabled={!isAuthenticated || dispatchStatus === "loading"}
            onClick={createDispatch}
          >
            {dispatchStatus === "loading" ? "Creating..." : "Create dispatch"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
