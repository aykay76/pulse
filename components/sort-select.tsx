"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown, Calendar, Layers } from "lucide-react";

export type SortOption = "date-desc" | "date-asc" | "source";

interface SortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: "date-desc", label: "Newest First", icon: <Calendar className="h-3.5 w-3.5" /> },
  { value: "date-asc", label: "Oldest First", icon: <Calendar className="h-3.5 w-3.5" /> },
  { value: "source", label: "Group by Source", icon: <Layers className="h-3.5 w-3.5" /> },
];

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as SortOption)}>
      <SelectTrigger className="w-[180px] h-8 text-xs">
        <ArrowUpDown className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
        <SelectValue placeholder="Sort by..." />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value} className="text-xs">
            <span className="flex items-center gap-2">
              {option.icon}
              {option.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
