"use client";

import { ArticleSource, SOURCE_CONFIG } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type FilterOption = ArticleSource | "all";

interface SourceFilterProps {
  selected: FilterOption;
  onChange: (source: FilterOption) => void;
  counts: Record<FilterOption, number>;
}

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: "all", label: "All" },
  { value: "hackernews", label: "HN" },
  { value: "arxiv", label: "Papers" },
  { value: "github", label: "GitHub" },
  { value: "blog", label: "Blogs" },
  { value: "devto", label: "DEV" },
  { value: "changelog", label: "Updates" },
];

export function SourceFilter({ selected, onChange, counts }: SourceFilterProps) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {FILTER_OPTIONS.map((option) => {
        const isSelected = selected === option.value;
        const config = option.value !== "all" ? SOURCE_CONFIG[option.value] : null;
        const count = counts[option.value] || 0;

        return (
          <Button
            key={option.value}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(option.value)}
            className={cn(
              "gap-1.5 text-xs h-8",
              isSelected && config && "text-white",
              !isSelected && "hover:bg-accent"
            )}
            style={
              isSelected && config
                ? { backgroundColor: config.color }
                : undefined
            }
          >
            {option.label}
            <span
              className={cn(
                "px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                isSelected
                  ? "bg-white/20 text-inherit"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {count}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
