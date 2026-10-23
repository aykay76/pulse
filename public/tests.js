import { safeURL, parseFeed, filterArticles, loadUserData, exportArticles, plainText } from './core.js';
import { LOADERS } from './feeds.js';

const results = [];
function test(name, check) {
  try { check(); results.push({ name, passed: true }); }
  catch (error) { results.push({ name, passed: false, error: error.message }); }
}
function assert(condition, message = 'Assertion failed') {
  if (!condition) throw new Error(message);
}
const rss = '<rss xmlns:dc="http://purl.org/dc/elements/1.1/"><channel><item><title>A &amp; B</title><link>https://example.com/post</link><description><![CDATA[<b>News</b><script>bad()</script>]]></description><dc:creator>Ada</dc:creator><pubDate>invalid</pubDate></item></channel></rss>';
const feed = { name: 'Test', type: 'blog' };
const article = parseFeed(rss, feed, 'ai')[0];
test('RSS entities, CDATA, namespace and dates', () => {
  assert(article.title === 'A & B');
  assert(article.summary === 'News');
  assert(article.author === 'Ada');
  assert(article.publishedAt === '1970-01-01T00:00:00.000Z');
});
test('RSS IDs remain stable', () => assert(article.id === parseFeed(rss, feed, 'ai')[0].id));
test('Atom alternate links and arXiv IDs', () => {
  const atom = '<feed xmlns="http://www.w3.org/2005/Atom"><entry><id>http://arxiv.org/abs/1234v1</id><title>Paper</title><link rel="self" href="https://example.com/self"/><link rel="alternate" href="https://arxiv.org/abs/1234v1"/><category term="cs.AI"/><published>2026-01-01</published></entry></feed>';
  const parsed = parseFeed(atom, { name: 'arXiv', type: 'arxiv' }, 'ai')[0];
  assert(parsed.id === 'arxiv-1234v1');
  assert(parsed.url === 'https://arxiv.org/abs/1234v1');
  assert(parsed.tags[0] === 'cs.AI');
});
test('Untrusted URLs and XML are rejected', () => {
  assert(!safeURL('javascript:alert(1)'));
  assert(!safeURL('data:text/html,bad'));
  assert(parseFeed(rss.replace('https://example.com/post', 'javascript:alert(1)'), feed, 'ai').length === 0);
  let rejected = false;
  try { parseFeed('<rss>', feed, 'ai'); } catch { rejected = true; }
  assert(rejected);
  assert(plainText('<img src=x onerror=alert(1)>hello') === 'hello');
});
test('HTML error pages are not silently accepted as feeds', () => {
  let rejected = false;
  try { parseFeed('<html><body>Access denied</body></html>', feed, 'ai'); } catch { rejected = true; }
  assert(rejected);
});
test('Existing storage, malformed storage and denied storage', () => {
  const data = loadUserData({ getItem: () => JSON.stringify({ articles: { old: { starred: true, comments: [{ text: 'note' }] } }, lastVisit: '2025-01-01' }) });
  assert(data.articles.old.starred);
  assert(data.articles.old.comments[0].text === 'note');
  assert(Object.keys(loadUserData({ getItem: () => '{' }).articles).length === 0);
  assert(Object.keys(loadUserData({ getItem: () => { throw new Error('Denied'); } }).articles).length === 0);
});
test('Source, search, dismiss and ordering', () => {
  const older = { ...article, id: 'older', publishedAt: '2025-01-01', tags: ['testing'] };
  const newer = { ...article, id: 'newer', source: 'github', publishedAt: '2026-01-01' };
  const userData = { articles: { newer: { dismissed: true } } };
  assert(filterArticles([older, newer], userData).length === 1);
  assert(filterArticles([older, newer], userData, { dismissed: true })[0].id === 'newer');
  assert(filterArticles([older], userData, { query: 'TESTING', source: 'blog' }).length === 1);
  assert(filterArticles([older, newer], { articles: {} }, { sort: 'date-desc' })[0].id === 'newer');
  assert(filterArticles([older, newer], { articles: {} }, { sort: 'date-asc' })[0].id === 'older');
});
test('JSON and Markdown exports include notes', () => {
  const userData = { articles: { [article.id]: { starred: true, comments: [{ text: 'My note' }] } } };
  assert(JSON.parse(exportArticles([article], userData, 'json'))[0].userData.starred);
  assert(exportArticles([article], userData, 'md').includes('My note'));
});

async function asyncTest(name, check) {
  try { await check(); results.push({ name, passed: true }); }
  catch (error) { results.push({ name, passed: false, error: error.message }); }
}

const originalFetch = globalThis.fetch;
const calls = [];
function fixture(input) {
  const url = new URL(input, location.href);
  calls.push(url);
  if (url.pathname.includes('stories.json')) return Response.json([1, 1]);
  if (url.pathname.includes('/item/')) return Response.json({ id: 1, title: 'AI research', type: 'story', time: 1 });
  if (url.pathname === '/api/arxiv') return new Response('<feed xmlns="http://www.w3.org/2005/Atom"><entry><id>https://arxiv.org/abs/1234v1</id><title>Paper</title></entry></feed>');
  if (url.pathname === '/api/devto') return Response.json([{ id: 2, title: 'Article', description: 'Summary', url: 'https://dev.to/test', published_at: '2026-01-01', user: { name: 'Ada' }, tag_list: ['ai'] }]);
  if (url.pathname === '/api/github') return Response.json({ items: [{ id: 3, full_name: 'test/repo', description: 'Code', html_url: 'https://github.com/test/repo', pushed_at: '2026-01-01', owner: { login: 'Ada' }, topics: ['ai'] }] });
  if (url.pathname.startsWith('/api/rss/')) return new Response(rss);
  throw new Error(`Unexpected request: ${url}`);
}

try {
  globalThis.fetch = async input => fixture(input);
  await asyncTest('All five source adapters normalize results and deduplicate', async () => {
    const expected = { hackernews: 'hn-1', arxiv: 'arxiv-1234v1', github: 'gh-3', devto: 'devto-2' };
    for (const [source, loader] of Object.entries(LOADERS)) {
      const result = await loader('ai', new AbortController().signal);
      assert(result.articles.length > 0, source);
      assert(result.failures === 0, source);
      if (expected[source]) {
        assert(result.articles.length === 1, `${source} deduplication`);
        assert(result.articles[0].id === expected[source], `${source} storage-compatible ID`);
      }
    }
    assert(calls.every(url => url.origin === location.origin));
    assert(calls.find(url => url.pathname === '/api/arxiv').searchParams.get('search_query').includes(' OR '));
  });
  await asyncTest('Partial RSS failures preserve successful feeds', async () => {
    globalThis.fetch = async input => String(input).endsWith('/openai') ? new Response('', { status: 503 }) : fixture(input);
    const result = await LOADERS.rss('ai', new AbortController().signal);
    assert(result.failures === 1);
    assert(result.articles.length === 5);
  });
  await asyncTest('Complete source failures are reported', async () => {
    globalThis.fetch = async () => new Response('', { status: 429 });
    for (const loader of Object.values(LOADERS)) {
      let rejected = false;
      try { await loader('ai', new AbortController().signal); } catch { rejected = true; }
      assert(rejected);
    }
  });
  await asyncTest('Topic changes can cancel in-flight adapters', async () => {
    globalThis.fetch = async (input, options) => {
      options.signal.throwIfAborted();
      return fixture(input);
    };
    const controller = new AbortController();
    controller.abort();
    for (const loader of Object.values(LOADERS)) {
      let rejected = false;
      try { await loader('ai', controller.signal); } catch { rejected = true; }
      assert(rejected);
    }
  });
} finally {
  globalThis.fetch = originalFetch;
}

window.testResults = results;
document.querySelector('#results').textContent = results.map(result => `${result.passed ? 'PASS' : 'FAIL'} ${result.name}${result.error ? `: ${result.error}` : ''}`).join('\n');
document.title = results.every(result => result.passed) ? 'PASS - Pulse tests' : 'FAIL - Pulse tests';