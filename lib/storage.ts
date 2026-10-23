import { UserData, UserArticleData, Comment } from './types';

const STORAGE_KEY = 'ai-feed-user-data';

const DEFAULT_USER_DATA: UserData = {
  articles: {},
  lastVisit: new Date().toISOString(),
  theme: 'system',
};

export function getUserData(): UserData {
  if (typeof window === 'undefined') return DEFAULT_USER_DATA;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse user data:', e);
  }
  
  return DEFAULT_USER_DATA;
}

export function saveUserData(data: UserData): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save user data:', e);
  }
}

export function getArticleData(articleId: string): UserArticleData {
  const userData = getUserData();
  return userData.articles[articleId] || {
    starred: false,
    dismissed: false,
    comments: [],
  };
}

export function toggleStar(articleId: string): boolean {
  const userData = getUserData();
  const articleData = userData.articles[articleId] || {
    starred: false,
    dismissed: false,
    comments: [],
  };
  
  articleData.starred = !articleData.starred;
  userData.articles[articleId] = articleData;
  saveUserData(userData);
  
  return articleData.starred;
}

export function toggleDismiss(articleId: string): boolean {
  const userData = getUserData();
  const articleData = userData.articles[articleId] || {
    starred: false,
    dismissed: false,
    comments: [],
  };
  
  articleData.dismissed = !articleData.dismissed;
  userData.articles[articleId] = articleData;
  saveUserData(userData);
  
  return articleData.dismissed;
}

export function addComment(articleId: string, text: string): Comment {
  const userData = getUserData();
  const articleData = userData.articles[articleId] || {
    starred: false,
    dismissed: false,
    comments: [],
  };
  
  const comment: Comment = {
    id: crypto.randomUUID(),
    text,
    createdAt: new Date().toISOString(),
  };
  
  articleData.comments.push(comment);
  userData.articles[articleId] = articleData;
  saveUserData(userData);
  
  return comment;
}

export function deleteComment(articleId: string, commentId: string): void {
  const userData = getUserData();
  const articleData = userData.articles[articleId];
  
  if (articleData) {
    articleData.comments = articleData.comments.filter(c => c.id !== commentId);
    userData.articles[articleId] = articleData;
    saveUserData(userData);
  }
}

export function getStarredArticleIds(): string[] {
  const userData = getUserData();
  return Object.entries(userData.articles)
    .filter(([, data]) => data.starred)
    .map(([id]) => id);
}

export function getDismissedArticleIds(): string[] {
  const userData = getUserData();
  return Object.entries(userData.articles)
    .filter(([, data]) => data.dismissed)
    .map(([id]) => id);
}

export function updateLastVisit(): void {
  const userData = getUserData();
  userData.lastVisit = new Date().toISOString();
  saveUserData(userData);
}

export function getLastVisit(): string {
  return getUserData().lastVisit;
}

export function setTheme(theme: 'light' | 'dark' | 'system'): void {
  const userData = getUserData();
  userData.theme = theme;
  saveUserData(userData);
}

export function getTheme(): 'light' | 'dark' | 'system' {
  return getUserData().theme;
}
