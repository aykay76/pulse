import { Topic } from './types';

// Keywords used for filtering HN stories and general content
export const TOPIC_KEYWORDS: Record<Topic, string[]> = {
  'ai': [
    'ai', 'artificial intelligence', 'machine learning', 'ml', 'llm',
    'gpt', 'claude', 'gemini', 'openai', 'anthropic', 'deepmind',
    'neural', 'transformer', 'copilot', 'cursor', 'agent', 'rag',
    'embedding', 'vector', 'langchain', 'chatbot', 'diffusion',
    'stable diffusion', 'midjourney', 'dall-e', 'coding assistant',
    'code generation', 'agentic', 'mcp', 'model context protocol',
    'deep learning', 'nlp', 'natural language', 'computer vision',
    'huggingface', 'pytorch', 'tensorflow', 'inference', 'fine-tuning',
  ],
  'software-engineering': [
    'software engineering', 'architecture', 'design pattern', 'clean code',
    'refactoring', 'technical debt', 'code review', 'testing', 'tdd',
    'unit test', 'integration test', 'solid principles', 'dry', 'kiss',
    'microservices', 'monolith', 'api design', 'rest', 'graphql',
    'system design', 'scalability', 'performance', 'optimization',
    'algorithms', 'data structures', 'complexity', 'distributed systems',
    'event-driven', 'domain-driven', 'ddd', 'cqrs', 'event sourcing',
    'functional programming', 'oop', 'programming language', 'compiler',
  ],
  'devops': [
    'devops', 'cicd', 'ci/cd', 'continuous integration', 'continuous deployment',
    'kubernetes', 'k8s', 'docker', 'container', 'orchestration',
    'terraform', 'ansible', 'pulumi', 'infrastructure as code', 'iac',
    'aws', 'azure', 'gcp', 'cloud', 'serverless', 'lambda',
    'monitoring', 'observability', 'prometheus', 'grafana', 'datadog',
    'logging', 'tracing', 'opentelemetry', 'sre', 'site reliability',
    'gitops', 'argocd', 'flux', 'helm', 'jenkins', 'github actions',
    'pipeline', 'deployment', 'rollback', 'canary', 'blue-green',
  ],
  'security': [
    'security', 'cybersecurity', 'infosec', 'vulnerability', 'cve',
    'penetration testing', 'pentest', 'ethical hacking', 'bug bounty',
    'encryption', 'cryptography', 'tls', 'ssl', 'authentication',
    'authorization', 'oauth', 'jwt', 'zero trust', 'sso',
    'malware', 'ransomware', 'phishing', 'social engineering',
    'firewall', 'ids', 'ips', 'waf', 'siem', 'soar',
    'compliance', 'gdpr', 'soc2', 'pci', 'hipaa', 'nist',
    'supply chain', 'sbom', 'devsecops', 'sast', 'dast',
  ],
  'web-dev': [
    'web development', 'frontend', 'backend', 'full-stack', 'fullstack',
    'react', 'vue', 'angular', 'svelte', 'next.js', 'nextjs', 'nuxt',
    'javascript', 'typescript', 'node.js', 'nodejs', 'deno', 'bun',
    'html', 'css', 'tailwind', 'sass', 'webpack', 'vite', 'turbopack',
    'browser', 'dom', 'web api', 'pwa', 'service worker',
    'database', 'postgresql', 'mysql', 'mongodb', 'redis', 'prisma',
    'vercel', 'netlify', 'cloudflare', 'edge', 'jamstack',
    'accessibility', 'a11y', 'seo', 'web performance', 'core web vitals',
  ],
};

// DEV.to tags for each topic
export const DEVTO_TAGS: Record<Topic, string[]> = {
  'ai': ['ai', 'machinelearning', 'llm', 'openai', 'chatgpt', 'copilot', 'deeplearning', 'nlp'],
  'software-engineering': ['programming', 'softwareengineering', 'architecture', 'cleancode', 'testing', 'algorithms', 'designpatterns'],
  'devops': ['devops', 'docker', 'kubernetes', 'aws', 'terraform', 'cicd', 'cloud', 'sre'],
  'security': ['security', 'cybersecurity', 'hacking', 'infosec', 'appsec', 'encryption', 'privacy'],
  'web-dev': ['webdev', 'javascript', 'react', 'nextjs', 'typescript', 'css', 'frontend', 'backend'],
};

// GitHub search queries for each topic
export const GITHUB_QUERIES: Record<Topic, string[]> = {
  'ai': [
    'topic:llm stars:>50',
    'topic:ai-agents stars:>30',
    'topic:machine-learning stars:>100',
    '"AI" in:description language:Python stars:>100',
    'topic:langchain stars:>20',
  ],
  'software-engineering': [
    'topic:clean-architecture stars:>50',
    'topic:design-patterns stars:>30',
    'topic:algorithms stars:>100',
    'topic:data-structures stars:>50',
    'topic:system-design stars:>30',
  ],
  'devops': [
    'topic:kubernetes stars:>100',
    'topic:docker stars:>50',
    'topic:terraform stars:>30',
    'topic:ci-cd stars:>20',
    'topic:infrastructure-as-code stars:>30',
  ],
  'security': [
    'topic:security stars:>50',
    'topic:penetration-testing stars:>30',
    'topic:vulnerability-scanner stars:>20',
    'topic:cybersecurity stars:>30',
    'topic:ethical-hacking stars:>20',
  ],
  'web-dev': [
    'topic:nextjs stars:>100',
    'topic:react stars:>100',
    'topic:typescript stars:>50',
    'topic:tailwindcss stars:>30',
    'topic:full-stack stars:>20',
  ],
};

// RSS feeds per topic
export const RSS_FEEDS: Record<Topic, { name: string; url: string; type: 'blog' | 'changelog' }[]> = {
  'ai': [
    { name: 'OpenAI Blog', url: 'https://openai.com/blog/rss.xml', type: 'blog' },
    { name: 'Google AI Blog', url: 'https://blog.google/technology/ai/rss/', type: 'blog' },
    { name: 'Anthropic', url: 'https://www.anthropic.com/rss.xml', type: 'blog' },
    { name: 'DeepMind', url: 'https://deepmind.google/blog/rss.xml', type: 'blog' },
    { name: 'Cursor Changelog', url: 'https://changelog.cursor.sh/feed.xml', type: 'changelog' },
    { name: 'GitHub Copilot', url: 'https://github.blog/changelog/label/copilot/feed/', type: 'changelog' },
  ],
  'software-engineering': [
    { name: 'Martin Fowler', url: 'https://martinfowler.com/feed.atom', type: 'blog' },
    { name: 'The Pragmatic Engineer', url: 'https://newsletter.pragmaticengineer.com/feed', type: 'blog' },
    { name: 'Kent C. Dodds', url: 'https://kentcdodds.com/blog/rss.xml', type: 'blog' },
    { name: 'Dan Abramov', url: 'https://overreacted.io/rss.xml', type: 'blog' },
  ],
  'devops': [
    { name: 'CNCF Blog', url: 'https://www.cncf.io/blog/feed/', type: 'blog' },
    { name: 'HashiCorp Blog', url: 'https://www.hashicorp.com/blog/feed.xml', type: 'blog' },
    { name: 'Kubernetes Blog', url: 'https://kubernetes.io/feed.xml', type: 'blog' },
    { name: 'AWS News Blog', url: 'https://aws.amazon.com/blogs/aws/feed/', type: 'blog' },
    { name: 'Docker Blog', url: 'https://www.docker.com/blog/feed/', type: 'blog' },
  ],
  'security': [
    { name: 'Krebs on Security', url: 'https://krebsonsecurity.com/feed/', type: 'blog' },
    { name: 'The Hacker News', url: 'https://feeds.feedburner.com/TheHackersNews', type: 'blog' },
    { name: 'Schneier on Security', url: 'https://www.schneier.com/feed/', type: 'blog' },
    { name: 'OWASP Blog', url: 'https://owasp.org/feed.xml', type: 'blog' },
  ],
  'web-dev': [
    { name: 'Vercel Blog', url: 'https://vercel.com/atom', type: 'blog' },
    { name: 'CSS Tricks', url: 'https://css-tricks.com/feed/', type: 'blog' },
    { name: 'Smashing Magazine', url: 'https://www.smashingmagazine.com/feed/', type: 'blog' },
    { name: 'web.dev', url: 'https://web.dev/feed.xml', type: 'blog' },
    { name: 'Next.js Blog', url: 'https://nextjs.org/feed.xml', type: 'blog' },
  ],
};

// arXiv categories per topic
export const ARXIV_CATEGORIES: Record<Topic, string[]> = {
  'ai': ['cs.AI', 'cs.LG', 'cs.CL', 'cs.CV', 'stat.ML'],
  'software-engineering': ['cs.SE', 'cs.PL', 'cs.DC'],
  'devops': ['cs.DC', 'cs.NI', 'cs.SE'],
  'security': ['cs.CR'],
  'web-dev': ['cs.SE', 'cs.HC'],
};
