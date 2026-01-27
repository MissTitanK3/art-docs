'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { CreateDispatchSheet } from "@/components/dispatches/CreateDispatchSheet";
import { DispatchListAndDetail } from "@/components/dispatches/DispatchListAndDetail";

type DispatchItem = {
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

type Pagination = {
  limit: number;
  offset: number;
  next_offset: number | null;
  prev_offset: number | null;
  has_more: boolean;
  total: number;
};

type DispatchResponse = {
  dispatches: DispatchItem[];
  pagination: Pagination;
};

export default function Home() {
  const { isAuthenticated, token } = useAuth();

  const [filters, setFilters] = useState({
    region_id: "",
    status: "all",
    urgency: "all",
  });

  const [listStatus, setListStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [dispatches, setDispatches] = useState<DispatchItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const loadDispatches = async (nextOffset?: number) => {
    setListStatus("loading");

    const params = new URLSearchParams();
    if (filters.region_id) params.set("region_id", filters.region_id);
    if (filters.status && filters.status !== "all") params.set("status", filters.status);
    if (filters.urgency && filters.urgency !== "all") params.set("urgency", filters.urgency);
    params.set("limit", "20");
    params.set("offset", String(nextOffset ?? 0));

    try {
      const response = await fetch(`/api/dispatches?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        credentials: "include",
      });

      const data = (await response.json()) as DispatchResponse | { error?: string };

      if (!response.ok) {
        const msg = 'error' in data && data.error ? data.error : "Failed to load dispatches";
        throw new Error(msg);
      }

      const list = data as DispatchResponse;
      setDispatches(nextOffset && nextOffset > 0 ? [...dispatches, ...list.dispatches] : list.dispatches);
      setPagination(list.pagination);
      setListStatus("success");
    } catch {
      setListStatus("error");
    }
  };

  useEffect(() => {
    loadDispatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]);

  return (
    <main className="min-h-screen bg-background">
      <div className="pt-3 flex justify-center">
        <CreateDispatchSheet
          isAuthenticated={isAuthenticated}
          token={token}
          onSuccess={loadDispatches}
        />
      </div>
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Report Feed</h1>
            <p className="text-sm text-muted-foreground">Live reports from your community</p>
          </div>
        </div>

        <DispatchListAndDetail
          dispatches={dispatches}
          pagination={pagination}
          listStatus={listStatus}
          filters={filters}
          setFilters={setFilters}
          loadDispatches={loadDispatches}
        />
      </div>
    </main>
  );
}
