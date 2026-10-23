export const TOPICS = {
  ai: { label: 'AI / ML', description: 'Artificial Intelligence, Machine Learning, LLMs' },
  'software-engineering': { label: 'Software Engineering', description: 'Architecture, Design Patterns, Best Practices' },
  devops: { label: 'DevOps', description: 'CI/CD, Infrastructure, Cloud, Containers' },
  security: { label: 'Security', description: 'Cybersecurity, AppSec, Vulnerabilities' },
  'web-dev': { label: 'Web Dev', description: 'Frontend, Backend, Full-Stack' },
};

export const KEYWORDS = {
  ai: ['ai', 'artificial intelligence', 'machine learning', 'ml', 'llm', 'gpt', 'claude', 'gemini', 'openai', 'anthropic', 'deepmind', 'neural', 'transformer', 'copilot', 'cursor', 'agent', 'rag', 'embedding', 'vector', 'langchain', 'chatbot', 'diffusion', 'stable diffusion', 'midjourney', 'dall-e', 'coding assistant', 'code generation', 'agentic', 'mcp', 'model context protocol', 'deep learning', 'nlp', 'natural language', 'computer vision', 'huggingface', 'pytorch', 'tensorflow', 'inference', 'fine-tuning'],
  'software-engineering': ['software engineering', 'architecture', 'design pattern', 'clean code', 'refactoring', 'technical debt', 'code review', 'testing', 'tdd', 'unit test', 'integration test', 'solid principles', 'dry', 'kiss', 'microservices', 'monolith', 'api design', 'rest', 'graphql', 'system design', 'scalability', 'performance', 'optimization', 'algorithms', 'data structures', 'complexity', 'distributed systems', 'event-driven', 'domain-driven', 'ddd', 'cqrs', 'event sourcing', 'functional programming', 'oop', 'programming language', 'compiler'],
  devops: ['devops', 'cicd', 'ci/cd', 'continuous integration', 'continuous deployment', 'kubernetes', 'k8s', 'docker', 'container', 'orchestration', 'terraform', 'ansible', 'pulumi', 'infrastructure as code', 'iac', 'aws', 'azure', 'gcp', 'cloud', 'serverless', 'lambda', 'monitoring', 'observability', 'prometheus', 'grafana', 'datadog', 'logging', 'tracing', 'opentelemetry', 'sre', 'site reliability', 'gitops', 'argocd', 'flux', 'helm', 'jenkins', 'github actions', 'pipeline', 'deployment', 'rollback', 'canary', 'blue-green'],
  security: ['security', 'cybersecurity', 'infosec', 'vulnerability', 'cve', 'penetration testing', 'pentest', 'ethical hacking', 'bug bounty', 'encryption', 'cryptography', 'tls', 'ssl', 'authentication', 'authorization', 'oauth', 'jwt', 'zero trust', 'sso', 'malware', 'ransomware', 'phishing', 'social engineering', 'firewall', 'ids', 'ips', 'waf', 'siem', 'soar', 'compliance', 'gdpr', 'soc2', 'pci', 'hipaa', 'nist', 'supply chain', 'sbom', 'devsecops', 'sast', 'dast'],
  'web-dev': ['web development', 'frontend', 'backend', 'full-stack', 'fullstack', 'react', 'vue', 'angular', 'svelte', 'next.js', 'nextjs', 'nuxt', 'javascript', 'typescript', 'node.js', 'nodejs', 'deno', 'bun', 'html', 'css', 'tailwind', 'sass', 'webpack', 'vite', 'turbopack', 'browser', 'dom', 'web api', 'pwa', 'service worker', 'database', 'postgresql', 'mysql', 'mongodb', 'redis', 'prisma', 'vercel', 'netlify', 'cloudflare', 'edge', 'jamstack', 'accessibility', 'a11y', 'seo', 'web performance', 'core web vitals'],
};

export const DEVTO_TAGS = {
  ai: ['ai', 'machinelearning', 'llm', 'openai', 'chatgpt', 'copilot', 'deeplearning', 'nlp'],
  'software-engineering': ['programming', 'softwareengineering', 'architecture', 'cleancode', 'testing', 'algorithms', 'designpatterns'],
  devops: ['devops', 'docker', 'kubernetes', 'aws', 'terraform', 'cicd', 'cloud', 'sre'],
  security: ['security', 'cybersecurity', 'hacking', 'infosec', 'appsec', 'encryption', 'privacy'],
  'web-dev': ['webdev', 'javascript', 'react', 'nextjs', 'typescript', 'css', 'frontend', 'backend'],
};

export const GITHUB_QUERIES = {
  ai: ['topic:llm stars:>50', 'topic:ai-agents stars:>30', 'topic:machine-learning stars:>100', '"AI" in:description language:Python stars:>100', 'topic:langchain stars:>20'],
  'software-engineering': ['topic:clean-architecture stars:>50', 'topic:design-patterns stars:>30', 'topic:algorithms stars:>100', 'topic:data-structures stars:>50', 'topic:system-design stars:>30'],
  devops: ['topic:kubernetes stars:>100', 'topic:docker stars:>50', 'topic:terraform stars:>30', 'topic:ci-cd stars:>20', 'topic:infrastructure-as-code stars:>30'],
  security: ['topic:security stars:>50', 'topic:penetration-testing stars:>30', 'topic:vulnerability-scanner stars:>20', 'topic:cybersecurity stars:>30', 'topic:ethical-hacking stars:>20'],
  'web-dev': ['topic:nextjs stars:>100', 'topic:react stars:>100', 'topic:typescript stars:>50', 'topic:tailwindcss stars:>30', 'topic:full-stack stars:>20'],
};

export const CATEGORIES = {
  ai: ['cs.AI', 'cs.LG', 'cs.CL', 'cs.CV', 'stat.ML'],
  'software-engineering': ['cs.SE', 'cs.PL', 'cs.DC'],
  devops: ['cs.DC', 'cs.NI', 'cs.SE'], security: ['cs.CR'], 'web-dev': ['cs.SE', 'cs.HC'],
};

export const FEEDS = {
  ai: [
    ['openai', 'OpenAI Blog'], ['google-ai', 'Google AI Blog'], ['anthropic', 'Anthropic'],
    ['deepmind', 'DeepMind'], ['cursor', 'Cursor Changelog', 'changelog'], ['copilot', 'GitHub Copilot', 'changelog'],
  ],
  'software-engineering': [
    ['fowler', 'Martin Fowler'], ['pragmatic', 'The Pragmatic Engineer'], ['kent-dodds', 'Kent C. Dodds'], ['overreacted', 'Dan Abramov'],
  ],
  devops: [
    ['cncf', 'CNCF Blog'], ['hashicorp', 'HashiCorp Blog'], ['kubernetes', 'Kubernetes Blog'], ['aws', 'AWS News Blog'], ['docker', 'Docker Blog'],
  ],
  security: [
    ['krebs', 'Krebs on Security'], ['hacker-news', 'The Hacker News'], ['schneier', 'Schneier on Security'], ['owasp', 'OWASP Blog'],
  ],
  'web-dev': [
    ['vercel', 'Vercel Blog'], ['css-tricks', 'CSS Tricks'], ['smashing', 'Smashing Magazine'], ['web-dev', 'web.dev'], ['nextjs', 'Next.js Blog'],
  ],
};