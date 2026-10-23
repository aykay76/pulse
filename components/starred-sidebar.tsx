"use client";

import { Article, SOURCE_CONFIG, UserArticleData } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StarredSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articles: Article[];
  userDataMap: Record<string, UserArticleData>;
  onStar: (id: string) => void;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function StarredSidebar({
  open,
  onOpenChange,
  articles,
  userDataMap,
  onStar,
}: StarredSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            Starred Articles
          </SheetTitle>
          <SheetDescription>
            {articles.length} article{articles.length !== 1 ? "s" : ""} saved
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-4 px-4">
          {articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Star className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No starred articles yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Star articles to save them here.
              </p>
            </div>
          ) : (
            <div className="space-y-3 py-4">
              {articles.map((article) => {
                const sourceConfig = SOURCE_CONFIG[article.source];
                const userData = userDataMap[article.id];

                return (
                  <div
                    key={article.id}
                    className="group relative rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50"
                  >
                    {/* Top border accent */}
                    <div
                      className="absolute top-0 left-3 right-3 h-0.5 rounded-full"
                      style={{ backgroundColor: sourceConfig.color }}
                    />

                    <div className="flex items-start gap-3 pt-1">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[10px] px-1.5 py-0",
                              sourceConfig.bgColor,
                              sourceConfig.darkBgColor
                            )}
                            style={{ color: sourceConfig.color }}
                          >
                            {sourceConfig.label}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(article.publishedAt)}
                          </span>
                        </div>

                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium line-clamp-2 hover:text-primary transition-colors"
                        >
                          {article.title}
                        </a>

                        {userData?.comments.length > 0 && (
                          <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                            <MessageSquare className="h-3 w-3" />
                            {userData.comments.length} note
                            {userData.comments.length !== 1 ? "s" : ""}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onStar(article.id)}
                          className="h-7 w-7 text-yellow-500 hover:text-yellow-600"
                          aria-label="Unstar article"
                        >
                          <Star className="h-4 w-4 fill-current" />
                        </Button>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent transition-colors"
                          aria-label="Open article"
                        >
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
