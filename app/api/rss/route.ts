import { NextResponse } from 'next/server';
import { Article, Topic } from '@/lib/types';
import { RSS_FEEDS } from '@/lib/topic-keywords';

interface ParsedItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  author?: string;
}

function parseRSS(xml: string): ParsedItem[] {
  const items: ParsedItem[] = [];
  
  // Try RSS 2.0 format
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    
    const getTag = (tag: string): string => {
      const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
      const m = itemXml.match(regex);
      if (m) {
        return m[1]
          .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
          .replace(/<[^>]+>/g, '')
          .trim();
      }
      return '';
    };
    
    const title = getTag('title');
    const link = getTag('link') || getTag('guid');
    const description = getTag('description') || getTag('content:encoded') || getTag('summary');
    const pubDate = getTag('pubDate') || getTag('published') || getTag('dc:date');
    const author = getTag('author') || getTag('dc:creator');
    
    if (title && link) {
      items.push({ title, link, description, pubDate, author });
    }
  }
  
  // Try Atom format if no items found
  if (items.length === 0) {
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    
    while ((match = entryRegex.exec(xml)) !== null) {
      const entryXml = match[1];
      
      const getTag = (tag: string): string => {
        const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
        const m = entryXml.match(regex);
        if (m) {
          return m[1]
            .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
            .replace(/<[^>]+>/g, '')
            .trim();
        }
        return '';
      };
      
      const getLink = (): string => {
        const linkMatch = entryXml.match(/<link[^>]*href="([^"]+)"[^>]*\/?>/);
        return linkMatch ? linkMatch[1] : '';
      };
      
      const title = getTag('title');
      const link = getLink() || getTag('id');
      const description = getTag('summary') || getTag('content');
      const pubDate = getTag('published') || getTag('updated');
      const author = getTag('name');
      
      if (title && link) {
        items.push({ title, link, description, pubDate, author });
      }
    }
  }
  
  return items;
}

async function fetchFeed(feed: { name: string; url: string; type: 'blog' | 'changelog' }, topic: Topic): Promise<Article[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const res = await fetch(feed.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'AI-Pulse-News-Aggregator/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      next: { revalidate: 900 }, // 15 min cache
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      return [];
    }
    
    const xml = await res.text();
    const items = parseRSS(xml);
    
    return items.slice(0, 10).map((item, index) => ({
      id: `${feed.type}-${feed.name.toLowerCase().replace(/\s+/g, '-')}-${index}-${Date.now()}`,
      title: item.title,
      summary: item.description?.slice(0, 250) + '...' || 'No description available',
      url: item.link,
      source: feed.type as 'blog' | 'changelog',
      sourceName: feed.name,
      author: item.author,
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      tags: feed.type === 'changelog' ? ['release', 'update'] : [topic, 'blog'],
    }));
  } catch (error) {
    console.error(`Failed to fetch ${feed.name}:`, error);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = (searchParams.get('topic') || 'ai') as Topic;
    const feeds = RSS_FEEDS[topic] || RSS_FEEDS['ai'];
    
    const results = await Promise.allSettled(
      feeds.map(feed => fetchFeed(feed, topic))
    );
    
    const articles: Article[] = results
      .filter((r): r is PromiseFulfilledResult<Article[]> => r.status === 'fulfilled')
      .flatMap(r => r.value);
    
    // Sort by date
    articles.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    
    return NextResponse.json(articles);
  } catch (error) {
    console.error('RSS API error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
