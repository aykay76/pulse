"use client";

import { useState } from "react";
import { Article, Comment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Send } from "lucide-react";

interface CommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article: Article;
  comments: Comment[];
  onAddComment: (text: string) => void;
  onDeleteComment: (commentId: string) => void;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CommentDialog({
  open,
  onOpenChange,
  article,
  comments,
  onAddComment,
  onDeleteComment,
}: CommentDialogProps) {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="line-clamp-2 pr-6">{article.title}</DialogTitle>
          <DialogDescription>
            Add your notes and thoughts about this article.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Existing comments */}
          {comments.length > 0 && (
            <div className="space-y-3 max-h-[200px] overflow-y-auto">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="group flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {comment.text}
                    </p>
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onDeleteComment(comment.id)}
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                    aria-label="Delete comment"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add new comment */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              placeholder="Write your notes here..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!newComment.trim()}
                size="sm"
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Add Note
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
