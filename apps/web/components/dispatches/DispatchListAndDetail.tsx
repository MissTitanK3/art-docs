"use client";

import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from "@repo/ui";

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
  cursor: string | null;
  next_cursor: string | null;
  has_more: boolean;
};

type Filters = {
  region_id: string;
  status: string;
  urgency: string;
};

interface DispatchListAndDetailProps {
  dispatches: DispatchItem[];
  pagination: Pagination | null;
  listStatus: "idle" | "loading" | "success" | "error";
  filters: Filters;
  setFilters: (filters: Filters) => void;
  loadDispatches: (cursor?: string) => void;
}

export function DispatchListAndDetail({
  dispatches,
  pagination,
  listStatus,
  filters,
  setFilters,
  loadDispatches,
}: DispatchListAndDetailProps) {
  const router = useRouter();

  return (
    <section className="space-y-4">
      {/* Filters */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border pb-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Input
            placeholder="Filter by region (zip)"
            value={filters.region_id}
            onChange={(e) =>
              setFilters({ ...filters, region_id: e.target.value })
            }
            className="flex-1"
          />
          <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="acknowledged">Acknowledged</SelectItem>
              <SelectItem value="escalated">Escalated</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="reopened">Reopened</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.urgency} onValueChange={(value) => setFilters({ ...filters, urgency: value })}>
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="All Urgency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Urgency</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => loadDispatches()}>
            Apply
          </Button>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-3">
        {listStatus === "loading" && (
          <div className="text-center py-12 text-muted-foreground">
            Loading dispatches...
          </div>
        )}
        {listStatus === "error" && (
          <div className="text-center py-12 text-destructive">
            Failed to load dispatches.
          </div>
        )}
        {listStatus !== "loading" && dispatches.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No dispatches found. Try adjusting your filters.
          </div>
        )}
        {dispatches.map((item) => (
          <article
            key={item.id}
            className={`bg-card border rounded-lg p-4 transition-colors cursor-pointer ${item.urgency === "critical"
                ? "border-red-500 hover:border-red-600"
                : item.urgency === "normal"
                  ? "border-amber-500 hover:border-amber-600"
                  : "border-blue-500 hover:border-blue-600"
              }`}
            onClick={() => router.push(`/dispatches/${item.id}`)}
          >
            <div className="flex items-start justify-between gap-3 mb-3 flex-col">
              <div className="flex flex-wrap gap-1 items-center w-full m-auto justify-center">
                <Badge variant="outline" className="font-mono text-primary bg-primary/10">
                  {item.region_id}
                </Badge>
                <Badge variant="secondary">
                  {item.status.toUpperCase()}
                </Badge>
                <Badge
                  className={item.urgency === "critical"
                    ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
                    : item.urgency === "normal"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
                  }
                >
                  {item.urgency.toUpperCase()}
                </Badge>
              </div>
              <Separator />
              <time className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date(item.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </time>
            </div>

            <p className="text-sm text-foreground line-clamp-3">
              {item.description ?? "(PII redacted for unauthenticated users)"}
            </p>

            {item.location_description && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
                📍 {item.location_description}
              </p>
            )}
          </article>
        ))}
      </div>

      {/* Load More */}
      {pagination?.has_more && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={() => loadDispatches(pagination?.next_cursor || undefined)}
          >
            Load more
          </Button>
        </div>
      )}
    </section>
  );
}
