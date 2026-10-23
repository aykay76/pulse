import { NextResponse } from 'next/server';
import { Article, Topic } from '@/lib/types';
import { ARXIV_CATEGORIES } from '@/lib/topic-keywords';

interface ArxivEntry {
  id: string[];
  title: string[];
  summary: string[];
  author: { name: string[] }[] | { name: string[] };
  published: string[];
  'arxiv:primary_category'?: { $: { term: string } }[];
  category?: { $: { term: string } }[] | { $: { term: string } };
}

function parseXML(xml: string): ArxivEntry[] {
  const entries: ArxivEntry[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xml)) !== null) {
    const entryXml = match[1];
    
    const getId = (s: string) => {
      const m = s.match(/<id>([^<]+)<\/id>/);
      return m ? [m[1]] : [''];
    };
    
    const getTitle = (s: string) => {
      const m = s.match(/<title>([^<]+)<\/title>/);
      return m ? [m[1].replace(/\s+/g, ' ').trim()] : [''];
    };
    
    const getSummary = (s: string) => {
      const m = s.match(/<summary>([\s\S]*?)<\/summary>/);
      return m ? [m[1].replace(/\s+/g, ' ').trim()] : [''];
    };
    
    const getAuthors = (s: string) => {
      const authors: { name: string[] }[] = [];
      const authorRegex = /<author>[\s\S]*?<name>([^<]+)<\/name>[\s\S]*?<\/author>/g;
      let authorMatch;
      while ((authorMatch = authorRegex.exec(s)) !== null) {
        authors.push({ name: [authorMatch[1]] });
      }
      return authors.length ? authors : [{ name: ['Unknown'] }];
    };
    
    const getPublished = (s: string) => {
      const m = s.match(/<published>([^<]+)<\/published>/);
      return m ? [m[1]] : [new Date().toISOString()];
    };
    
    const getCategories = (s: string) => {
      const cats: { $: { term: string } }[] = [];
      const catRegex = /<category[^>]*term="([^"]+)"[^>]*\/>/g;
      let catMatch;
      while ((catMatch = catRegex.exec(s)) !== null) {
        cats.push({ $: { term: catMatch[1] } });
      }
      return cats;
    };

    entries.push({
      id: getId(entryXml),
      title: getTitle(entryXml),
      summary: getSummary(entryXml),
      author: getAuthors(entryXml),
      published: getPublished(entryXml),
      category: getCategories(entryXml),
    });
  }

  return entries;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = (searchParams.get('topic') || 'ai') as Topic;
    const categories = ARXIV_CATEGORIES[topic] || ARXIV_CATEGORIES['ai'];
    
    // Build search query from categories
    const searchQuery = categories.map(cat => `cat:${cat}`).join('+OR+');
    const url = `http://export.arxiv.org/api/query?search_query=${searchQuery}&start=0&max_results=30&sortBy=submittedDate&sortOrder=descending`;

    const res = await fetch(url, {
      next: { revalidate: 900 }, // 15 min cache due to rate limits
    });

    if (!res.ok) {
      throw new Error(`arXiv API returned ${res.status}`);
    }

    const xml = await res.text();
    const entries = parseXML(xml);

    const articles: Article[] = entries.map((entry) => {
      const authors = Array.isArray(entry.author) 
        ? entry.author.map(a => a.name[0]).slice(0, 3).join(', ')
        : entry.author?.name?.[0] || 'Unknown';
      
      const entryCategories = Array.isArray(entry.category)
        ? entry.category.map(c => c.$.term)
        : entry.category ? [entry.category.$.term] : [];

      const arxivId = entry.id[0].split('/abs/')[1] || entry.id[0];
      
      return {
        id: `arxiv-${arxivId}`,
        title: entry.title[0],
        summary: entry.summary[0].slice(0, 300) + '...',
        url: entry.id[0],
        source: 'arxiv' as const,
        sourceName: 'arXiv',
        author: authors + (Array.isArray(entry.author) && entry.author.length > 3 ? ' et al.' : ''),
        publishedAt: entry.published[0],
        tags: entryCategories.slice(0, 3),
      };
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error('arXiv API error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
