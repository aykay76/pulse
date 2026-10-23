export const STORAGE_KEY = 'ai-feed-user-data';

export const SOURCES = {
  hackernews: 'Hacker News', arxiv: 'arXiv', github: 'GitHub',
  blog: 'Blogs', devto: 'DEV.to', changelog: 'Changelogs',
};

export function safeURL(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

export function plainText(value = '') {
  const document = new DOMParser().parseFromString(String(value), 'text/html');
  document.querySelectorAll('script, style').forEach(element => element.remove());
  return (document.body.textContent || '').replace(/\s+/g, ' ').trim();
}

export function dateISO(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date(0).toISOString() : date.toISOString();
}

export function parseFeed(xml, feed, topic) {
  const document = new DOMParser().parseFromString(xml, 'application/xml');
  if (document.querySelector('parsererror')) throw new Error('Invalid XML feed');
  if (!['rss', 'feed', 'RDF'].includes(document.documentElement.localName)) throw new Error('Not an RSS or Atom feed');
  const text = (element, ...names) => {
    for (const name of names) {
      const found = [...element.getElementsByTagNameNS('*', name)][0];
      if (found?.textContent.trim()) return found.textContent.trim();
    }
    return '';
  };
  const entries = [...document.getElementsByTagNameNS('*', 'item'),
    ...document.getElementsByTagNameNS('*', 'entry')];
  return entries.slice(0, feed.type === 'arxiv' ? 30 : 10).flatMap(entry => {
    const link = [...entry.getElementsByTagNameNS('*', 'link')]
      .find(element => !element.getAttribute('rel') || element.getAttribute('rel') === 'alternate');
    const url = safeURL(link?.getAttribute('href') || link?.textContent.trim() || text(entry, 'id', 'guid'));
    const title = plainText(text(entry, 'title'));
    if (!url || !title) return [];
    const arxivId = text(entry, 'id').split('/abs/')[1];
    return [{
      id: feed.type === 'arxiv' && arxivId ? `arxiv-${arxivId}` : `${feed.type}-${url}`,
      title, url, source: feed.type, sourceName: feed.name,
      summary: plainText(text(entry, 'description', 'summary', 'encoded', 'content')).slice(0, 300),
      publishedAt: dateISO(text(entry, 'pubDate', 'published', 'updated', 'date')),
      author: text(entry, 'creator', 'name', 'author'),
      tags: feed.type === 'arxiv'
        ? [...entry.getElementsByTagNameNS('*', 'category')].map(category => category.getAttribute('term')).filter(Boolean).slice(0, 3)
        : feed.type === 'changelog' ? ['release', 'update'] : [topic, 'blog'],
    }];
  });
}

export function filterArticles(articles, userData, { source = 'all', query = '', sort = 'date-desc', dismissed = false } = {}) {
  const search = query.trim().toLowerCase();
  return articles.filter(article =>
    (source === 'all' || article.source === source) &&
    Boolean(userData.articles[article.id]?.dismissed) === dismissed &&
    (!search || [article.title, article.summary, ...article.tags].join(' ').toLowerCase().includes(search))
  ).sort((first, second) => {
    if (sort === 'source' && first.source !== second.source) return first.source.localeCompare(second.source);
    const difference = new Date(second.publishedAt) - new Date(first.publishedAt);
    return sort === 'date-asc' ? -difference : difference;
  });
}

export function loadUserData(storage = localStorage) {
  const fallback = { articles: {}, savedArticles: {}, lastVisit: new Date().toISOString(), theme: 'system' };
  try {
    const stored = JSON.parse(storage.getItem(STORAGE_KEY));
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return fallback;
    const validMap = value => value && typeof value === 'object' && !Array.isArray(value);
    const articles = Object.fromEntries(Object.entries(validMap(stored.articles) ? stored.articles : {}).map(([id, data]) => [id, {
      starred: data?.starred === true, dismissed: data?.dismissed === true,
      comments: Array.isArray(data?.comments) ? data.comments.filter(comment => comment && typeof comment.text === 'string') : [],
    }]));
    return { ...fallback, articles,
      savedArticles: validMap(stored.savedArticles) ? stored.savedArticles : {},
      lastVisit: dateISO(stored.lastVisit || fallback.lastVisit),
      theme: ['light', 'dark', 'system'].includes(stored.theme) ? stored.theme : 'system',
    };
  } catch {
    return fallback;
  }
}

export function exportArticles(articles, userData, format) {
  if (format === 'json') {
    return JSON.stringify(articles.map(article => ({ ...article, userData: userData.articles[article.id] })), null, 2);
  }
  return ['# Pulse - Starred Articles', '', ...articles.flatMap(article => [
    `## ${article.title}`, '', `**Source:** ${article.sourceName}`, `**Date:** ${article.publishedAt}`,
    `**URL:** ${article.url}`, '', article.summary, '', '**My Notes**', '',
    ...(userData.articles[article.id]?.comments || []).map(comment => `- ${comment.text}`), '', '---', '',
  ])].join('\n');
}