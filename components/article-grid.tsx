"use client";

import { Article, UserArticleData, SOURCE_CONFIG, ArticleSource } from "@/lib/types";
import { ArticleCard } from "./article-card";
import { ArticleCardSkeleton } from "./article-card-skeleton";
import { useMemo } from "react";

interface ArticleGridProps {
  articles: Article[];
  userDataMap: Record<string, UserArticleData>;
  onStar: (id: string) => void;
  onDismiss: (id: string) => void;
  onAddComment: (id: string, text: string) => void;
  onDeleteComment: (articleId: string, commentId: string) => void;
  lastVisit?: string;
  isLoading?: boolean;
  groupBySource?: boolean;
}

export function ArticleGrid({
  articles,
  userDataMap,
  onStar,
  onDismiss,
  onAddComment,
  onDeleteComment,
  lastVisit,
  isLoading,
  groupBySource = false,
}: ArticleGridProps) {
  // Group articles by source when groupBySource is true
  const groupedArticles = useMemo(() => {
    if (!groupBySource) return null;
    
    const groups: Record<ArticleSource, Article[]> = {
      hackernews: [],
      arxiv: [],
      github: [],
      blog: [],
      devto: [],
      changelog: [],
    };
    
    articles.forEach((article) => {
      if (!userDataMap[article.id]?.dismissed) {
        groups[article.source].push(article);
      }
    });
    
    // Filter out empty groups
    return Object.entries(groups).filter(([, items]) => items.length > 0) as [ArticleSource, Article[]][];
  }, [articles, userDataMap, groupBySource]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <ArticleCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const visibleArticles = articles.filter(
    (article) => !userDataMap[article.id]?.dismissed
  );

  if (visibleArticles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <svg
            className="h-8 w-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-1">No articles found</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          Try adjusting your filters or check back later for new content.
        </p>
      </div>
    );
  }

  // Render grouped by source
  if (groupBySource && groupedArticles) {
    return (
      <div className="space-y-8">
        {groupedArticles.map(([source, sourceArticles]) => {
          const config = SOURCE_CONFIG[source];
          return (
            <section key={source}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                <h2 className="text-lg font-semibold">{config.label}</h2>
                <span className="text-sm text-muted-foreground">
                  ({sourceArticles.length})
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sourceArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    userData={
                      userDataMap[article.id] || {
                        starred: false,
                        dismissed: false,
                        comments: [],
                      }
                    }
                    onStar={onStar}
                    onDismiss={onDismiss}
                    onAddComment={onAddComment}
                    onDeleteComment={onDeleteComment}
                    isNew={
                      lastVisit
                        ? new Date(article.publishedAt) > new Date(lastVisit)
                        : false
                    }
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    );
  }

  // Render flat grid (default)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {visibleArticles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          userData={
            userDataMap[article.id] || {
              starred: false,
              dismissed: false,
              comments: [],
            }
          }
          onStar={onStar}
          onDismiss={onDismiss}
          onAddComment={onAddComment}
          onDeleteComment={onDeleteComment}
          isNew={
            lastVisit
              ? new Date(article.publishedAt) > new Date(lastVisit)
              : false
          }
        />
      ))}
    </div>
  );
}
