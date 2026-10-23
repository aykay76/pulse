import { NextResponse } from 'next/server';
import { Article, Topic } from '@/lib/types';
import { TOPIC_KEYWORDS } from '@/lib/topic-keywords';

interface HNItem {
  id: number;
  title?: string;
  url?: string;
  by?: string;
  time?: number;
  score?: number;
  text?: string;
  type?: string;
}

function matchesKeywords(title: string, keywords: string[]): boolean {
  const lowerTitle = title.toLowerCase();
  return keywords.some(keyword => lowerTitle.includes(keyword));
}

async function fetchItem(id: number): Promise<HNItem | null> {
  try {
    const res = await fetch(
      `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = (searchParams.get('topic') || 'ai') as Topic;
    const keywords = TOPIC_KEYWORDS[topic] || TOPIC_KEYWORDS['ai'];

    // Fetch top and new stories
    const [topRes, newRes] = await Promise.all([
      fetch('https://hacker-news.firebaseio.com/v0/topstories.json', {
        next: { revalidate: 300 }
      }),
      fetch('https://hacker-news.firebaseio.com/v0/newstories.json', {
        next: { revalidate: 300 }
      })
    ]);

    const topIds: number[] = await topRes.json();
    const newIds: number[] = await newRes.json();

    // Get first 100 from each and dedupe
    const allIds = [...new Set([...topIds.slice(0, 100), ...newIds.slice(0, 100)])];

    // Fetch items in parallel (batches of 20)
    const items: HNItem[] = [];
    for (let i = 0; i < Math.min(allIds.length, 200); i += 20) {
      const batch = await Promise.all(
        allIds.slice(i, i + 20).map(id => fetchItem(id))
      );
      items.push(...batch.filter((item): item is HNItem => item !== null));
    }

    // Filter for topic-related stories
    const filtered = items.filter(item => 
      item.title && 
      item.type === 'story' &&
      matchesKeywords(item.title, keywords)
    );

    // Transform to our Article type
    const articles: Article[] = filtered.map(item => ({
      id: `hn-${item.id}`,
      title: item.title || '',
      summary: item.text 
        ? item.text.replace(/<[^>]*>/g, '').slice(0, 200) + '...'
        : `Discuss on Hacker News - ${item.score || 0} points`,
      url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
      source: 'hackernews' as const,
      sourceName: 'Hacker News',
      author: item.by,
      publishedAt: new Date((item.time || 0) * 1000).toISOString(),
      score: item.score,
      tags: ['tech', topic],
    }));

    // Sort by score
    articles.sort((a, b) => (b.score || 0) - (a.score || 0));

    return NextResponse.json(articles.slice(0, 30));
  } catch (error) {
    console.error('Hacker News API error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
