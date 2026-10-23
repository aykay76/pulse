import { NextResponse } from 'next/server';
import { Article, Topic } from '@/lib/types';
import { GITHUB_QUERIES } from '@/lib/topic-keywords';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  owner: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

interface GitHubSearchResponse {
  items: GitHubRepo[];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = (searchParams.get('topic') || 'ai') as Topic;
    
    // Get date for filtering recently pushed repos
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const dateStr = oneWeekAgo.toISOString().split('T')[0];

    // Get queries for this topic and add date filter
    const baseQueries = GITHUB_QUERIES[topic] || GITHUB_QUERIES['ai'];
    const queries = baseQueries.map(q => `${q} pushed:>${dateStr}`);

    const allRepos: GitHubRepo[] = [];

    for (const query of queries) {
      try {
        const res = await fetch(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=10`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'AI-Pulse-News-Aggregator',
            },
            next: { revalidate: 600 }, // 10 min cache
          }
        );

        if (res.ok) {
          const data: GitHubSearchResponse = await res.json();
          allRepos.push(...data.items);
        }
        
        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch {
        // Continue with other queries if one fails
        continue;
      }
    }

    // Dedupe by repo id
    const uniqueRepos = Array.from(
      new Map(allRepos.map(repo => [repo.id, repo])).values()
    );

    // Sort by stars
    uniqueRepos.sort((a, b) => b.stargazers_count - a.stargazers_count);

    const articles: Article[] = uniqueRepos.slice(0, 20).map(repo => ({
      id: `gh-${repo.id}`,
      title: repo.full_name,
      summary: repo.description || 'No description available',
      url: repo.html_url,
      source: 'github' as const,
      sourceName: 'GitHub',
      author: repo.owner.login,
      publishedAt: repo.pushed_at,
      score: repo.stargazers_count,
      tags: [
        repo.language || 'Code',
        ...repo.topics.slice(0, 2)
      ].filter(Boolean),
      imageUrl: repo.owner.avatar_url,
    }));

    return NextResponse.json(articles);
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
