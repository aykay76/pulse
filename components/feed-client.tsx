"use client";

import { useState, useEffect, useMemo } from "react";
import { useArticles } from "@/hooks/use-articles";
import { useUserData } from "@/hooks/use-user-data";
import { Header } from "./header";
import { SourceFilter } from "./source-filter";
import { ArticleGrid } from "./article-grid";
import { StarredSidebar } from "./starred-sidebar";
import { ExportDialog } from "./export-dialog";
import { TopicSelector } from "./topic-selector";
import { Article, ArticleSource, Topic, TOPIC_CONFIG } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { mutate } from "swr";
import { SortSelect, SortOption } from "./sort-select";

type FilterOption = ArticleSource | "all";

export function FeedClient() {
  const [selectedTopic, setSelectedTopic] = useState<Topic>("ai");
  const { articles, isLoading } = useArticles(selectedTopic);
  const {
    userData,
    mounted,
    handleStar,
    handleDismiss,
    handleAddComment,
    handleDeleteComment,
    getStarredArticleIds,
    getLastVisitDate,
  } = useUserData();

  const [selectedSource, setSelectedSource] = useState<FilterOption>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");
  const [showStarred, setShowStarred] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | undefined>();

  useEffect(() => {
    if (articles.length > 0 && !lastUpdated) {
      setLastUpdated(new Date().toISOString());
    }
  }, [articles, lastUpdated]);

  // Reset last updated when topic changes
  useEffect(() => {
    setLastUpdated(undefined);
  }, [selectedTopic]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        mutate(`/api/hacker-news?topic=${selectedTopic}`),
        mutate(`/api/arxiv?topic=${selectedTopic}`),
        mutate(`/api/github-trending?topic=${selectedTopic}`),
        mutate(`/api/devto?topic=${selectedTopic}`),
        mutate(`/api/rss?topic=${selectedTopic}`),
      ]);
      setLastUpdated(new Date().toISOString());
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter articles based on source and search
  const filteredArticles = useMemo(() => {
    let filtered = articles;

    // Filter by source
    if (selectedSource !== "all") {
      filtered = filtered.filter((article) => article.source === selectedSource);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.summary.toLowerCase().includes(query) ||
          article.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [articles, selectedSource, searchQuery]);

  // Sort articles based on sort option
  const sortedArticles = useMemo(() => {
    const sorted = [...filteredArticles];
    
    switch (sortOption) {
      case "date-desc":
        return sorted.sort((a, b) => 
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
      case "date-asc":
        return sorted.sort((a, b) => 
          new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
        );
      case "source":
        // Group by source, then sort by date within each group
        return sorted.sort((a, b) => {
          if (a.source !== b.source) {
            return a.source.localeCompare(b.source);
          }
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        });
      default:
        return sorted;
    }
  }, [filteredArticles, sortOption]);

  // Calculate counts per source
  const sourceCounts = useMemo(() => {
    const counts: Record<FilterOption, number> = {
      all: articles.length,
      hackernews: 0,
      arxiv: 0,
      github: 0,
      blog: 0,
      devto: 0,
      changelog: 0,
    };

    articles.forEach((article) => {
      counts[article.source]++;
    });

    return counts;
  }, [articles]);

  // Create user data map
  const userDataMap = useMemo(() => {
    if (!userData) return {};
    return userData.articles;
  }, [userData]);

  // Get starred articles
  const starredArticles = useMemo(() => {
    const starredIds = getStarredArticleIds();
    return articles.filter((article) => starredIds.includes(article.id));
  }, [articles, getStarredArticleIds]);

  const topicConfig = TOPIC_CONFIG[selectedTopic];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          onRefresh={() => {}}
          onShowStarred={() => {}}
          onExport={() => {}}
          isRefreshing={false}
          starredCount={0}
        />
        <main className="container mx-auto max-w-7xl px-4 py-6">
          <ArticleGrid
            articles={[]}
            userDataMap={{}}
            onStar={() => {}}
            onDismiss={() => {}}
            onAddComment={() => {}}
            onDeleteComment={() => {}}
            isLoading={true}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        onRefresh={handleRefresh}
        onShowStarred={() => setShowStarred(true)}
        onExport={() => setShowExport(true)}
        isRefreshing={isRefreshing}
        starredCount={starredArticles.length}
        lastUpdated={lastUpdated}
      />

      <main className="container mx-auto max-w-7xl px-4 py-6">
        {/* Topic Selector */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-2">
            <TopicSelector selected={selectedTopic} onChange={setSelectedTopic} />
            <p className="text-sm text-muted-foreground">
              {topicConfig.description}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <SortSelect value={sortOption} onChange={setSortOption} />
          </div>
          <SourceFilter
            selected={selectedSource}
            onChange={setSelectedSource}
            counts={sourceCounts}
          />
        </div>

        {/* Article Grid */}
        <ArticleGrid
          articles={sortedArticles}
          userDataMap={userDataMap}
          onStar={handleStar}
          onDismiss={handleDismiss}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
          lastVisit={getLastVisitDate()}
          isLoading={isLoading}
          groupBySource={sortOption === "source"}
        />
      </main>

      {/* Starred Sidebar */}
      <StarredSidebar
        open={showStarred}
        onOpenChange={setShowStarred}
        articles={starredArticles}
        userDataMap={userDataMap}
        onStar={handleStar}
      />

      {/* Export Dialog */}
      <ExportDialog
        open={showExport}
        onOpenChange={setShowExport}
        articles={starredArticles}
        userDataMap={userDataMap}
      />
    </div>
  );
}
