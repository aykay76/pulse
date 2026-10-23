"use client";

import { Topic, TOPIC_CONFIG } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Brain, Code2, Container, Shield, Globe, ChevronDown, Check } from "lucide-react";

const TOPIC_ICONS: Record<Topic, React.ElementType> = {
  'ai': Brain,
  'software-engineering': Code2,
  'devops': Container,
  'security': Shield,
  'web-dev': Globe,
};

interface TopicSelectorProps {
  selected: Topic;
  onChange: (topic: Topic) => void;
}

const TOPICS: Topic[] = ['ai', 'software-engineering', 'devops', 'security', 'web-dev'];

export function TopicSelector({ selected, onChange }: TopicSelectorProps) {
  const selectedConfig = TOPIC_CONFIG[selected];
  const SelectedIcon = TOPIC_ICONS[selected];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 min-w-[180px] justify-between"
          style={{ borderColor: selectedConfig.color + '40' }}
        >
          <span className="flex items-center gap-2">
            <SelectedIcon
              className="h-4 w-4"
              style={{ color: selectedConfig.color }}
            />
            <span className="font-medium">{selectedConfig.label}</span>
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[280px]">
        {TOPICS.map((topic) => {
          const config = TOPIC_CONFIG[topic];
          const Icon = TOPIC_ICONS[topic];
          const isSelected = selected === topic;

          return (
            <DropdownMenuItem
              key={topic}
              onClick={() => onChange(topic)}
              className={cn(
                "flex items-start gap-3 p-3 cursor-pointer",
                isSelected && "bg-accent"
              )}
            >
              <Icon
                className="h-5 w-5 mt-0.5 shrink-0"
                style={{ color: config.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{config.label}</span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {config.description}
                </p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact pill version for mobile or inline use
export function TopicPills({ selected, onChange }: TopicSelectorProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {TOPICS.map((topic) => {
        const config = TOPIC_CONFIG[topic];
        const Icon = TOPIC_ICONS[topic];
        const isSelected = selected === topic;

        return (
          <Button
            key={topic}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(topic)}
            className={cn(
              "gap-1.5 h-8",
              isSelected && "text-white"
            )}
            style={
              isSelected
                ? { backgroundColor: config.color }
                : { borderColor: config.color + '40' }
            }
          >
            <Icon className="h-3.5 w-3.5" />
            {config.label}
          </Button>
        );
      })}
    </div>
  );
}
