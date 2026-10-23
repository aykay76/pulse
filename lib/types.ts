export type ArticleSource = 
  | 'hackernews' 
  | 'arxiv' 
  | 'github' 
  | 'blog' 
  | 'devto' 
  | 'changelog';

export type Topic = 
  | 'ai'
  | 'software-engineering'
  | 'devops'
  | 'security'
  | 'web-dev';

export const TOPIC_CONFIG: Record<Topic, {
  label: string;
  description: string;
  icon: string;
  color: string;
}> = {
  'ai': {
    label: 'AI / ML',
    description: 'Artificial Intelligence, Machine Learning, LLMs',
    icon: 'Brain',
    color: '#8b5cf6',
  },
  'software-engineering': {
    label: 'Software Engineering',
    description: 'Architecture, Design Patterns, Best Practices',
    icon: 'Code2',
    color: '#3b82f6',
  },
  'devops': {
    label: 'DevOps',
    description: 'CI/CD, Infrastructure, Cloud, Containers',
    icon: 'Container',
    color: '#06b6d4',
  },
  'security': {
    label: 'Security',
    description: 'Cybersecurity, AppSec, Vulnerabilities',
    icon: 'Shield',
    color: '#ef4444',
  },
  'web-dev': {
    label: 'Web Dev',
    description: 'Frontend, Backend, Full-Stack',
    icon: 'Globe',
    color: '#f59e0b',
  },
};

export interface Article {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: ArticleSource;
  sourceName: string;
  author?: string;
  publishedAt: string;
  score?: number;
  tags: string[];
  imageUrl?: string;
}

export interface UserArticleData {
  starred: boolean;
  dismissed: boolean;
  comments: Comment[];
  readAt?: string;
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
}

export interface UserData {
  articles: Record<string, UserArticleData>;
  lastVisit: string;
  theme: 'light' | 'dark' | 'system';
}

export const SOURCE_CONFIG: Record<ArticleSource, { 
  label: string; 
  color: string; 
  bgColor: string;
  darkBgColor: string;
}> = {
  hackernews: { 
    label: 'Hacker News', 
    color: '#ff6600',
    bgColor: 'bg-orange-500/10',
    darkBgColor: 'dark:bg-orange-500/20'
  },
  arxiv: { 
    label: 'arXiv', 
    color: '#b31b1b',
    bgColor: 'bg-red-500/10',
    darkBgColor: 'dark:bg-red-500/20'
  },
  github: { 
    label: 'GitHub', 
    color: '#6e40c9',
    bgColor: 'bg-purple-500/10',
    darkBgColor: 'dark:bg-purple-500/20'
  },
  blog: { 
    label: 'AI Blog', 
    color: '#0066cc',
    bgColor: 'bg-blue-500/10',
    darkBgColor: 'dark:bg-blue-500/20'
  },
  devto: { 
    label: 'DEV.to', 
    color: '#0a0a0a',
    bgColor: 'bg-neutral-500/10',
    darkBgColor: 'dark:bg-neutral-500/20'
  },
  changelog: { 
    label: 'Changelog', 
    color: '#10b981',
    bgColor: 'bg-emerald-500/10',
    darkBgColor: 'dark:bg-emerald-500/20'
  },
};
