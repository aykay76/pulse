import { toast, confirm } from './wds/wds.js';
import { TOPICS } from './topics.js';
import { SOURCES, STORAGE_KEY, safeURL, loadUserData, filterArticles, exportArticles } from './core.js';
import { LOADERS } from './feeds.js';

const $ = selector => document.querySelector(selector);
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const userData = loadUserData();
const lastVisit = userData.lastVisit;
const cache = new Map();
const state = { topic: 'ai', source: 'all', query: '', sort: 'date-desc', dismissed: false, articles: [], loading: false, errors: [], updated: null };
let controller;
let notesArticle;
let storageWarning = false;

function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(userData)); }
  catch {
    if (!storageWarning) toast.error('Changes could not be saved', { message: 'Browser storage is unavailable or full.' });
    storageWarning = true;
  }
}

function articleData(id) {
  return userData.articles[id] ||= { starred: false, dismissed: false, comments: [] };
}

function allKnownArticles() {
  return new Map([...Object.values(userData.savedArticles), ...state.articles]
    .filter(article => article && typeof article.id === 'string' && typeof article.title === 'string' && safeURL(article.url) && Array.isArray(article.tags))
    .map(article => [article.id, article]));
}

function starredArticles() {
  return [...allKnownArticles().values()].filter(article => userData.articles[article.id]?.starred);
}

function remember(article) {
  userData.savedArticles[article.id] = article;
}

function applyTheme() {
  if (userData.theme === 'system') document.documentElement.removeAttribute('data-wds-theme');
  else document.documentElement.setAttribute('data-wds-theme', userData.theme);
  $('#theme').value = userData.theme;
}

function timeAgo(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.getTime() === 0) return 'Date unavailable';
  const hours = Math.max(0, Math.floor((Date.now() - date.getTime()) / 3600000));
  return hours < 1 ? 'Just now' : hours < 24 ? `${hours}h ago` : hours < 168 ? `${Math.floor(hours / 24)}d ago` : date.toLocaleDateString();
}

function actionButton(action, id, label, icon, active = false) {
  return `<button class="wds-btn wds-btn--ghost wds-btn--sm wds-btn--icon" data-action="${action}" data-id="${escape(id)}" aria-label="${escape(label)}" title="${escape(label)}" ${action === 'star' ? `aria-pressed="${active}"` : ''}><wds-icon name="${icon}" size="16"></wds-icon></button>`;
}

function articleCard(article) {
  const data = articleData(article.id);
  const image = safeURL(article.imageUrl);
  const newBadge = new Date(article.publishedAt) > new Date(lastVisit) ? '<span class="wds-badge wds-badge--success">New</span>' : '';
  return `<article class="wds-card pulse-card" data-article-id="${escape(article.id)}" data-starred="${data.starred}">
    <div class="pulse-card-top"><span class="wds-badge wds-badge--${article.source === 'github' ? 'neutral' : article.source === 'hackernews' ? 'warning' : article.source === 'arxiv' ? 'danger' : 'info'}">${escape(article.sourceName)}</span>${newBadge}
      <div class="pulse-card-actions">${actionButton('star', article.id, data.starred ? 'Unstar article' : 'Star article', data.starred ? 'check' : 'file', data.starred)}${actionButton('notes', article.id, `Article notes (${data.comments.length})`, 'edit')}${actionButton('dismiss', article.id, data.dismissed ? 'Restore article' : 'Dismiss article', data.dismissed ? 'refresh' : 'close')}</div>
    </div>
    ${image ? `<img class="pulse-card-image${article.source === 'github' ? ' pulse-card-image--avatar' : ''}" src="${escape(image)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : ''}
    <h2><a href="${escape(safeURL(article.url))}" target="_blank" rel="noopener noreferrer">${escape(article.title)}</a></h2>
    <p class="pulse-summary">${escape(article.summary)}</p>
    <div class="pulse-tags">${article.tags.slice(0, 3).map(tag => `<span class="wds-badge wds-badge--neutral">${escape(tag)}</span>`).join('')}</div>
    <footer class="pulse-card-footer"><span>${escape(article.author || '')}</span><time datetime="${escape(article.publishedAt)}">${escape(timeAgo(article.publishedAt))}</time>${Number.isFinite(article.score) ? `<span>${article.score.toLocaleString()} points</span>` : ''}</footer>
  </article>`;
}

function empty(message) {
  return `<div class="wds-empty-state pulse-empty"><wds-icon name="file" size="22"></wds-icon><p class="wds-empty-state-title">${escape(message)}</p></div>`;
}

function render() {
  $('#topics').innerHTML = Object.entries(TOPICS).map(([id, topic]) => `<button class="wds-btn wds-btn--secondary" data-topic="${id}" aria-pressed="${id === state.topic}">${topic.label}</button>`).join('');
  $('#topic-description').textContent = TOPICS[state.topic].description;
  const counts = Object.fromEntries(Object.keys(SOURCES).map(source => [source, 0]));
  state.articles.forEach(article => { if (counts[article.source] !== undefined) counts[article.source]++; });
  $('#sources').innerHTML = Object.entries({ all: 'All sources', ...SOURCES }).map(([id, label]) => `<button class="wds-btn wds-btn--ghost wds-btn--sm" data-source="${id}" aria-pressed="${id === state.source}">${label} <span class="wds-badge wds-badge--neutral">${id === 'all' ? state.articles.length : counts[id]}</span></button>`).join('');
  const articles = filterArticles(state.articles, userData, state);
  $('#article-count').textContent = `${articles.length} articles`;
  $('#articles').setAttribute('aria-busy', String(state.loading));
  $('#refresh').disabled = state.loading;
  $('#updated').textContent = state.loading ? 'Updating...' : state.updated ? `Updated ${new Date(state.updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Your technology briefing';
  let group;
  $('#articles').innerHTML = articles.length ? articles.map(article => {
    let heading = '';
    if (state.sort === 'source' && group !== article.source) { group = article.source; heading = `<h2 class="pulse-group-heading">${escape(SOURCES[group])}</h2>`; }
    return heading + articleCard(article);
  }).join('') : state.loading ? '<div class="pulse-loading" role="status">Loading articles...</div>' : empty(state.errors.length ? 'Feeds are unavailable. Try refreshing.' : 'No matching articles.');
  $('#feed-status').hidden = !state.errors.length;
  $('#feed-status').textContent = state.errors.length ? `Some feeds could not be updated: ${state.errors.join(', ')}. Available articles are still shown.` : '';
  const starred = starredArticles();
  $('#starred-count').textContent = starred.length;
  $('#starred-articles').innerHTML = starred.length ? starred.map(articleCard).join('') : empty('No starred articles yet.');
  $('#export-count').textContent = `${starred.length} starred articles`;
  document.querySelectorAll('[data-export]').forEach(button => { button.disabled = !starred.length; });
}

async function load(force = false) {
  controller?.abort();
  controller = new AbortController();
  const signal = controller.signal;
  const topic = state.topic;
  const cached = cache.get(topic);
  state.articles = cached?.articles || [];
  state.errors = cached?.errors || [];
  state.updated = cached?.updated || null;
  if (!force && cached && !cached.errors.length && Date.now() - cached.updated < 60000) {
    state.loading = false;
    render();
    return;
  }
  state.loading = true;
  state.errors = [];
  render();
  const sourceArticles = new Map();
  await Promise.all(Object.entries(LOADERS).map(async ([source, loader]) => {
    try {
      const result = await loader(topic, signal);
      if (signal.aborted) return;
      sourceArticles.set(source, result.articles);
      if (result.failures) state.errors.push(`${SOURCES[source] || 'RSS'} (partial)`);
    } catch (error) {
      if (signal.aborted) return;
      state.errors.push(SOURCES[source] || 'RSS');
      sourceArticles.set(source, (cached?.articles || []).filter(article => source === 'rss' ? ['blog', 'changelog'].includes(article.source) : article.source === source));
    }
    if (signal.aborted) return;
    state.articles = [...new Map([...sourceArticles.values()].flat().map(article => [article.id, article])).values()];
    state.articles.forEach(article => { if (userData.articles[article.id]) remember(article); });
    render();
  }));
  if (signal.aborted) return;
  state.loading = false;
  state.updated = Date.now();
  cache.set(topic, { articles: state.articles, errors: [...state.errors], updated: state.updated });
  persist();
  render();
}

function renderNotes() {
  $('#notes-title').textContent = notesArticle.title;
  $('#notes-list').innerHTML = articleData(notesArticle.id).comments.map(comment => `<div class="wds-list-item"><div class="wds-list-item-body"><p class="pulse-note-text">${escape(comment.text)}</p><span class="pulse-muted">${escape(timeAgo(comment.createdAt))}</span></div><button class="wds-btn wds-btn--ghost wds-btn--icon" data-delete-note="${escape(comment.id)}" aria-label="Delete note" title="Delete note"><wds-icon name="trash-2" size="16"></wds-icon></button></div>`).join('') || '<p class="pulse-muted">No notes yet.</p>';
}

document.addEventListener('click', async event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.topic) {
    state.topic = button.dataset.topic;
    load();
  }
  if (button.dataset.source) { state.source = button.dataset.source; render(); }
  if (button.dataset.action) {
    const article = allKnownArticles().get(button.dataset.id);
    if (!article) return;
    const data = articleData(article.id);
    remember(article);
    if (button.dataset.action === 'star') { data.starred = !data.starred; persist(); render(); }
    if (button.dataset.action === 'dismiss') {
      data.dismissed = !data.dismissed;
      persist(); render();
      toast.success(data.dismissed ? 'Article dismissed' : 'Article restored');
    }
    if (button.dataset.action === 'notes') { notesArticle = article; renderNotes(); $('#note-text').value = ''; $('#notes').open(); }
  }
  if (button.dataset.deleteNote && notesArticle) {
    const id = button.dataset.deleteNote;
    if (await confirm({ title: 'Delete note?', message: 'This note will be permanently removed.', confirmLabel: 'Delete', danger: true })) {
      const data = articleData(notesArticle.id);
      data.comments = data.comments.filter(comment => comment.id !== id);
      persist(); renderNotes(); render();
    }
  }
  if (button.dataset.export) {
    const format = button.dataset.export;
    const blob = new Blob([exportArticles(starredArticles(), userData, format)], { type: format === 'json' ? 'application/json' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pulse-starred-${new Date().toISOString().slice(0, 10)}.${format}`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    $('#export').close();
  }
});

$('#refresh').addEventListener('click', () => load(true));
$('#search').addEventListener('input', event => { state.query = event.target.value; render(); });
$('#sort').addEventListener('change', event => { state.sort = event.target.value; render(); });
$('#dismissed').addEventListener('change', event => { state.dismissed = event.target.checked; render(); });
$('#show-starred').addEventListener('click', () => $('#starred').open());
$('#show-export').addEventListener('click', () => $('#export').open());
$('#theme').addEventListener('change', event => { userData.theme = event.target.value; applyTheme(); persist(); });
$('#note-form').addEventListener('submit', event => {
  event.preventDefault();
  const text = $('#note-text').value.trim();
  if (!notesArticle || !text) return;
  const id = globalThis.crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  articleData(notesArticle.id).comments.push({ id, text, createdAt: new Date().toISOString() });
  remember(notesArticle); persist(); renderNotes(); render(); $('#note-text').value = '';
});
document.addEventListener('error', event => {
  if (event.target instanceof HTMLImageElement) event.target.hidden = true;
}, true);

applyTheme();
userData.lastVisit = new Date().toISOString();
persist();
load();