"use client";

import { Article, SOURCE_CONFIG, UserArticleData } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileJson, FileText, Download } from "lucide-react";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articles: Article[];
  userDataMap: Record<string, UserArticleData>;
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ExportDialog({
  open,
  onOpenChange,
  articles,
  userDataMap,
}: ExportDialogProps) {
  const exportAsJSON = () => {
    const exportData = articles.map((article) => ({
      ...article,
      userData: userDataMap[article.id] || {
        starred: true,
        dismissed: false,
        comments: [],
      },
    }));

    const content = JSON.stringify(exportData, null, 2);
    downloadFile(
      content,
      `pulse-starred-${new Date().toISOString().split("T")[0]}.json`,
      "application/json"
    );
    onOpenChange(false);
  };

  const exportAsMarkdown = () => {
    const lines: string[] = [
      "# Pulse - Starred Articles",
      "",
      `Exported on ${formatDate(new Date().toISOString())}`,
      "",
      `Total: ${articles.length} articles`,
      "",
      "---",
      "",
    ];

    articles.forEach((article, index) => {
      const sourceConfig = SOURCE_CONFIG[article.source];
      const userData = userDataMap[article.id];

      lines.push(`## ${index + 1}. ${article.title}`);
      lines.push("");
      lines.push(`**Source:** ${sourceConfig.label}`);
      lines.push(`**Date:** ${formatDate(article.publishedAt)}`);
      if (article.author) {
        lines.push(`**Author:** ${article.author}`);
      }
      lines.push(`**URL:** ${article.url}`);
      lines.push("");

      if (article.summary) {
        lines.push("### Summary");
        lines.push("");
        lines.push(article.summary);
        lines.push("");
      }

      if (article.tags.length > 0) {
        lines.push(`**Tags:** ${article.tags.join(", ")}`);
        lines.push("");
      }

      if (userData?.comments.length > 0) {
        lines.push("### My Notes");
        lines.push("");
        userData.comments.forEach((comment) => {
          lines.push(`- ${comment.text} *(${formatDate(comment.createdAt)})*`);
        });
        lines.push("");
      }

      lines.push("---");
      lines.push("");
    });

    const content = lines.join("\n");
    downloadFile(
      content,
      `pulse-starred-${new Date().toISOString().split("T")[0]}.md`,
      "text/markdown"
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Starred Articles
          </DialogTitle>
          <DialogDescription>
            Download your {articles.length} starred article
            {articles.length !== 1 ? "s" : ""} with notes.
          </DialogDescription>
        </DialogHeader>

        {articles.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground text-sm">
            No starred articles to export.
          </div>
        ) : (
          <div className="grid gap-3 py-4">
            <Button
              variant="outline"
              className="h-auto py-4 justify-start gap-4"
              onClick={exportAsJSON}
            >
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-500/10 text-blue-500">
                <FileJson className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="font-medium">Export as JSON</div>
                <div className="text-xs text-muted-foreground">
                  Full data including metadata and comments
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 justify-start gap-4"
              onClick={exportAsMarkdown}
            >
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-500">
                <FileText className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="font-medium">Export as Markdown</div>
                <div className="text-xs text-muted-foreground">
                  Readable format with notes included
                </div>
              </div>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
