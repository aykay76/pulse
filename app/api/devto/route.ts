import { NextResponse } from 'next/server';
import { Article, Topic } from '@/lib/types';
import { DEVTO_TAGS } from '@/lib/topic-keywords';

interface DevtoArticle {
  id: number;
  title: string;
  description: string;
  url: string;
  published_at: string;
  user: {
    name: string;
    username: string;
    profile_image: string;
  };
  positive_reactions_count: number;
  cover_image: string | null;
  tag_list: string[];
  reading_time_minutes: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = (searchParams.get('topic') || 'ai') as Topic;
    const tags = DEVTO_TAGS[topic] || DEVTO_TAGS['ai'];
    
    const allArticles: DevtoArticle[] = [];

    for (const tag of tags) {
      try {
        const res = await fetch(
          `https://dev.to/api/articles?tag=${tag}&top=7&per_page=10`,
          {
            headers: {
              'Accept': 'application/json',
            },
            next: { revalidate: 600 }, // 10 min cache
          }
        );

        if (res.ok) {
          const data: DevtoArticle[] = await res.json();
          allArticles.push(...data);
        }
      } catch {
        continue;
      }
    }

    // Dedupe by id
    const uniqueArticles = Array.from(
      new Map(allArticles.map(article => [article.id, article])).values()
    );

    // Sort by reactions
    uniqueArticles.sort((a, b) => b.positive_reactions_count - a.positive_reactions_count);

    const articles: Article[] = uniqueArticles.slice(0, 20).map(article => ({
      id: `devto-${article.id}`,
      title: article.title,
      summary: article.description || article.title,
      url: article.url,
      source: 'devto' as const,
      sourceName: 'DEV.to',
      author: article.user.name,
      publishedAt: article.published_at,
      score: article.positive_reactions_count,
      tags: article.tag_list.slice(0, 3),
      imageUrl: article.cover_image || article.user.profile_image,
    }));

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Dev.to API error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
