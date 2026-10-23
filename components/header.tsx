"use client";

import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { RefreshCw, Star, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onRefresh: () => void;
  onShowStarred: () => void;
  onExport: () => void;
  isRefreshing: boolean;
  starredCount: number;
  lastUpdated?: string;
}

export function Header({
  onRefresh,
  onShowStarred,
  onExport,
  isRefreshing,
  starredCount,
  lastUpdated,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between gap-4 px-4 mx-auto max-w-7xl">
        {/* Logo and title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            AI
          </div>
          <div className="flex flex-col">
            <h1 className="font-semibold text-lg leading-none tracking-tight">
              AI Pulse
            </h1>
            {lastUpdated && (
              <span className="text-[10px] text-muted-foreground">
                Updated {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onShowStarred}
            className="gap-1.5 h-8"
          >
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Starred</span>
            {starredCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium">
                {starredCount}
              </span>
            )}
          </Button>

          <Button
            variant="outline"
            size="icon-sm"
            onClick={onExport}
            className="h-8 w-8"
            title="Export starred articles"
          >
            <Download className="h-4 w-4" />
            <span className="sr-only">Export</span>
          </Button>

          <Button
            variant="outline"
            size="icon-sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-8 w-8"
            title="Refresh feed"
          >
            <RefreshCw
              className={cn("h-4 w-4", isRefreshing && "animate-spin")}
            />
            <span className="sr-only">Refresh</span>
          </Button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
