"use client";

import useSWR from "swr";
import { Article, Topic } from "@/lib/types";

const fetcher = async (url: string): Promise<Article[]> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

export function useArticles(topic: Topic = 'ai') {
  const { data: hnArticles, error: hnError, isLoading: hnLoading } = useSWR<Article[]>(
    `/api/hacker-news?topic=${topic}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const { data: arxivArticles, error: arxivError, isLoading: arxivLoading } = useSWR<Article[]>(
    `/api/arxiv?topic=${topic}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const { data: githubArticles, error: githubError, isLoading: githubLoading } = useSWR<Article[]>(
    `/api/github-trending?topic=${topic}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const { data: devtoArticles, error: devtoError, isLoading: devtoLoading } = useSWR<Article[]>(
    `/api/devto?topic=${topic}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const { data: rssArticles, error: rssError, isLoading: rssLoading } = useSWR<Article[]>(
    `/api/rss?topic=${topic}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const allArticles: Article[] = [
    ...(hnArticles || []),
    ...(arxivArticles || []),
    ...(githubArticles || []),
    ...(devtoArticles || []),
    ...(rssArticles || []),
  ];

  // Sort by date, newest first
  allArticles.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const isLoading = hnLoading || arxivLoading || githubLoading || devtoLoading || rssLoading;
  const hasErrors = hnError || arxivError || githubError || devtoError || rssError;

  const errors: Record<string, Error | undefined> = {
    hackernews: hnError,
    arxiv: arxivError,
    github: githubError,
    devto: devtoError,
    rss: rssError,
  };

  return {
    articles: allArticles,
    isLoading,
    hasErrors,
    errors,
    topic,
  };
}
