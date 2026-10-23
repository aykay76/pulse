"use client";

import { useState } from "react";
import { Article, SOURCE_CONFIG, UserArticleData } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star,
  X,
  MessageSquare,
  ExternalLink,
  Clock,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CommentDialog } from "./comment-dialog";

interface ArticleCardProps {
  article: Article;
  userData: UserArticleData;
  onStar: (id: string) => void;
  onDismiss: (id: string) => void;
  onAddComment: (id: string, text: string) => void;
  onDeleteComment: (articleId: string, commentId: string) => void;
  isNew?: boolean;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getSourceColor(source: Article["source"]): string {
  const config = SOURCE_CONFIG[source];
  return config.color;
}

export function ArticleCard({
  article,
  userData,
  onStar,
  onDismiss,
  onAddComment,
  onDeleteComment,
  isNew,
}: ArticleCardProps) {
  const [showComments, setShowComments] = useState(false);
  const sourceConfig = SOURCE_CONFIG[article.source];

  if (userData.dismissed) return null;

  return (
    <>
      <article
        className={cn(
          "group relative flex flex-col rounded-xl border bg-card p-4 transition-all duration-200",
          "hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5",
          userData.starred && "ring-2 ring-primary/30 border-primary/30"
        )}
      >
        {/* Top border accent */}
        <div
          className="absolute top-0 left-4 right-4 h-0.5 rounded-full"
          style={{ backgroundColor: getSourceColor(article.source) }}
        />

        {/* Header with source badge and actions */}
        <div className="flex items-start justify-between gap-2 mb-3 pt-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="secondary"
              className={cn(
                "text-xs font-medium",
                sourceConfig.bgColor,
                sourceConfig.darkBgColor
              )}
              style={{ color: sourceConfig.color }}
            >
              {sourceConfig.label}
            </Badge>
            {isNew && (
              <Badge variant="default" className="text-xs bg-primary">
                New
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onStar(article.id)}
              className={cn(
                "h-7 w-7",
                userData.starred && "text-yellow-500 hover:text-yellow-600"
              )}
              aria-label={userData.starred ? "Unstar article" : "Star article"}
            >
              <Star
                className={cn("h-4 w-4", userData.starred && "fill-current")}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowComments(true)}
              className="h-7 w-7"
              aria-label="Add comment"
            >
              <MessageSquare className="h-4 w-4" />
              {userData.comments.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {userData.comments.length}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDismiss(article.id)}
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              aria-label="Dismiss article"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-base leading-tight mb-2 line-clamp-2 text-balance">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            {article.title}
          </a>
        </h3>

        {/* Summary */}
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
          {article.summary}
        </p>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {article.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs px-2 py-0"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-3 border-t border-border/50">
          <div className="flex items-center gap-3">
            {article.author && (
              <span className="truncate max-w-[120px]">{article.author}</span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTimeAgo(article.publishedAt)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {article.score !== undefined && (
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {article.score.toLocaleString()}
              </span>
            )}
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
              aria-label="Open article"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Comment indicator */}
        {userData.comments.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <button
              onClick={() => setShowComments(true)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <MessageSquare className="h-3 w-3" />
              {userData.comments.length} comment
              {userData.comments.length !== 1 ? "s" : ""}
            </button>
          </div>
        )}
      </article>

      <CommentDialog
        open={showComments}
        onOpenChange={setShowComments}
        article={article}
        comments={userData.comments}
        onAddComment={(text) => onAddComment(article.id, text)}
        onDeleteComment={(commentId) => onDeleteComment(article.id, commentId)}
      />
    </>
  );
}
