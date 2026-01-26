"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { ArrowLeft } from "lucide-react";

type DispatchDetail = {
  id: string;
  region_id: string;
  location_lat: number;
  location_lon: number;
  location_description: string | null;
  location_precision: string;
  description: string | null;
  urgency: string;
  status: string;
  created_at: string;
  updated_at?: string;
};

export default function DispatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { token } = useAuth();
  const [dispatch, setDispatch] = useState<DispatchDetail | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("loading");

  useEffect(() => {
    const loadDispatch = async () => {
      setStatus("loading");
      try {
        const response = await fetch(`/api/dispatches/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to load dispatch");
        }

        const data = await response.json();
        setDispatch(data);
        setStatus("success");
      } catch {
        setStatus("error");
      }
    };

    if (id) {
      loadDispatch();
    }
  }, [id, token]);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to feed
        </Button>

        {status === "loading" && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Loading dispatch details...
            </CardContent>
          </Card>
        )}

        {status === "error" && (
          <Card>
            <CardContent className="p-8 text-center text-destructive">
              Failed to load dispatch details
            </CardContent>
          </Card>
        )}

        {status === "success" && dispatch && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">Dispatch Details</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    ID: {dispatch.id}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="rounded-full bg-muted px-3 py-1 text-sm text-foreground">
                    {dispatch.status}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-sm ${dispatch.urgency === "critical"
                      ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
                      : dispatch.urgency === "normal"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
                      }`}
                  >
                    {dispatch.urgency}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                    Description
                  </h3>
                  <p className="text-foreground">
                    {dispatch.description ?? "PII redacted for unauthenticated users"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                    Location Description
                  </h3>
                  <p className="text-foreground">
                    {dispatch.location_description || "—"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                      Region
                    </h3>
                    <p className="font-mono text-primary">{dispatch.region_id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                      Precision
                    </h3>
                    <p className="text-foreground">{dispatch.location_precision}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                      Coordinates
                    </h3>
                    <p className="text-foreground font-mono text-sm">
                      {dispatch.location_lat.toFixed(4)}, {dispatch.location_lon.toFixed(4)}
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
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
