import { parseFeed, plainText, dateISO, safeURL } from './core.js';
import { KEYWORDS, DEVTO_TAGS, GITHUB_QUERIES, CATEGORIES, FEEDS } from './topics.js';

async function request(url, signal, xml = false) {
  const response = await fetch(url, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]),
    headers: { Accept: xml ? 'application/atom+xml, application/rss+xml, application/xml, text/xml' : 'application/json' },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return xml ? response.text() : response.json();
}

async function collect(jobs, signal) {
  const results = await Promise.allSettled(jobs);
  signal.throwIfAborted();
  const failures = results.filter(result => result.status === 'rejected');
  if (failures.length === results.length) throw new Error('Source unavailable');
  return { articles: results.flatMap(result => result.status === 'fulfilled' ? result.value : []), failures: failures.length };
}

export async function hackerNews(topic, signal) {
  const lists = await Promise.all([
    request('/api/hn/topstories.json', signal), request('/api/hn/newstories.json', signal),
  ]);
  const ids = [...new Set(lists.flatMap(list => list.slice(0, 100)))];
  const articles = [];
  let failures = 0;
  for (let offset = 0; offset < ids.length; offset += 20) {
    const results = await Promise.allSettled(ids.slice(offset, offset + 20).map(id => request(`/api/hn/item/${id}.json`, signal)));
    signal.throwIfAborted();
    for (const result of results) {
      if (result.status === 'rejected') { failures++; continue; }
      const item = result.value;
      if (!item?.title || item.type !== 'story' || item.deleted || item.dead ||
        !KEYWORDS[topic].some(keyword => item.title.toLowerCase().includes(keyword))) continue;
      articles.push({
        id: `hn-${item.id}`, title: item.title,
        summary: item.text ? plainText(item.text).slice(0, 250) : `Discuss on Hacker News - ${item.score || 0} points`,
        url: safeURL(item.url) || `https://news.ycombinator.com/item?id=${item.id}`,
        source: 'hackernews', sourceName: 'Hacker News', author: item.by,
        publishedAt: dateISO((item.time || 0) * 1000), score: item.score, tags: ['tech', topic],
      });
    }
  }
  if (failures === ids.length && ids.length) throw new Error('Stories unavailable');
  return { articles: articles.sort((first, second) => second.score - first.score).slice(0, 30), failures };
}

export async function arxiv(topic, signal) {
  const params = new URLSearchParams({
    search_query: CATEGORIES[topic].map(category => `cat:${category}`).join(' OR '),
    start: '0', max_results: '30', sortBy: 'submittedDate', sortOrder: 'descending',
  });
  return { articles: parseFeed(await request(`/api/arxiv?${params}`, signal, true), { name: 'arXiv', type: 'arxiv' }, topic), failures: 0 };
}

export async function devto(topic, signal) {
  const result = await collect(DEVTO_TAGS[topic].map(async tag => {
    const items = await request(`/api/devto?${new URLSearchParams({ tag, top: '7', per_page: '10' })}`, signal);
    return items.map(item => ({
      id: `devto-${item.id}`, title: item.title, summary: item.description || item.title,
      url: safeURL(item.url), source: 'devto', sourceName: 'DEV.to', author: item.user?.name,
      publishedAt: dateISO(item.published_at), score: item.positive_reactions_count,
      tags: (item.tag_list || []).slice(0, 3), imageUrl: safeURL(item.cover_image || item.user?.profile_image),
    }));
  }), signal);
  return { ...result, articles: [...new Map(result.articles.map(article => [article.id, article])).values()]
    .filter(article => article.url).sort((first, second) => second.score - first.score).slice(0, 20) };
}

export async function github(topic, signal) {
  const since = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const articles = [];
  let failures = 0;
  for (const query of GITHUB_QUERIES[topic]) {
    try {
      const data = await request(`/api/github?${new URLSearchParams({ q: `${query} pushed:>${since}`, sort: 'stars', order: 'desc', per_page: '10' })}`, signal);
      articles.push(...data.items.map(repo => ({
        id: `gh-${repo.id}`, title: repo.full_name, summary: repo.description || 'No description available',
        url: safeURL(repo.html_url), source: 'github', sourceName: 'GitHub', author: repo.owner?.login,
        publishedAt: dateISO(repo.pushed_at), score: repo.stargazers_count,
        tags: [repo.language || 'Code', ...(repo.topics || []).slice(0, 2)], imageUrl: safeURL(repo.owner?.avatar_url),
      })));
    } catch (error) {
      signal.throwIfAborted();
      failures++;
    }
  }
  if (failures === GITHUB_QUERIES[topic].length) throw new Error('GitHub search unavailable or rate limited');
  return { failures, articles: [...new Map(articles.map(article => [article.id, article])).values()]
    .filter(article => article.url).sort((first, second) => second.score - first.score).slice(0, 20) };
}

export async function rss(topic, signal) {
  return collect(FEEDS[topic].map(async ([id, name, type = 'blog']) => {
    const xml = await request(`/api/rss/${id}`, signal, true);
    return parseFeed(xml, { name, type }, topic);
  }), signal);
}

export const LOADERS = { hackernews: hackerNews, arxiv, github, devto, rss };