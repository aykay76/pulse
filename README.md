# Pulse

A technology news reader built with vanilla JavaScript, CSS, and vendored WDS Web Components. No Node.js, npm packages, build step, external JavaScript CDN, or application server is required.

## Run

```sh
docker build --pull -t pulse .
docker run --rm --name pulse -p 8080:8080 pulse
```

Open http://localhost:8080. Podman can replace Docker in these commands. With Podman, add `--format docker` to the build command to retain the Docker health check.

The image runs nginx as an unprivileged user on port 8080. It serves `public/` directly and proxies allowlisted news APIs and RSS feeds over verified HTTPS. Runtime DNS resolvers are taken from the container's `/etc/resolv.conf`. Internet/DNS access is needed for feeds. Terminate public HTTPS at your ingress or reverse proxy.

## Features

- Five topics: AI/ML, software engineering, DevOps, security, and web development.
- Hacker News, arXiv, GitHub repositories, DEV.to, blogs, and changelogs.
- Search, source filters, date sorting, and grouping by source.
- Stars, article notes, dismiss/restore, light/dark/system themes.
- JSON and Markdown exports of starred articles with notes.
- Browser-local storage with saved article snapshots, including across topic changes and feed outages.

The existing `ai-feed-user-data` storage key is retained. To keep existing stars and notes, serve the new app from the same origin (scheme, host, and port). Article IDs for Hacker News, GitHub, DEV.to, and arXiv remain compatible. The old RSS implementation used changing timestamp-based IDs; those cannot reliably be matched, so RSS now uses stable URL-based IDs. Browser storage is not a backup; export important notes.

## How It Works

```text
Browser: HTML + CSS + JavaScript + Web Components
    |
    +-- localStorage: stars, notes, dismissals, saved articles
    |
    +-- nginx /api/*: fixed upstream allowlist + bounded response cache
            |
            +-- Hacker News / arXiv / GitHub / DEV.to / RSS publishers
```

Browser JavaScript normalizes JSON and parses RSS/Atom using `DOMParser`. No feed HTML is inserted into the page. Article links accept only HTTP(S). nginx does not forward browser cookies or authorization headers to upstreams, and it rejects unknown proxy routes and write methods.

nginx caches successful upstream responses for up to 15 minutes (upstream cache headers may shorten this), with a 64 MB disk cache. Refresh re-fetches browser data but does not purge the shared nginx cache. GitHub's unauthenticated search quota is shared by clients using the same outbound IP. Individual publishers can rate-limit, block requests, move feeds, or be unavailable; the UI reports partial failures while retaining available articles. The proxy intentionally does not follow redirects to arbitrary hosts. Update a moved feed's fixed URL in `nginx/default.conf.template`.

## Develop And Test

Edit files in `public/` and rebuild the image to test live feeds. Change topic queries in `public/topics.js`; change proxy targets in `nginx/default.conf.template`. Both must be updated when adding a new RSS feed.

For browser unit tests and a static UI preview without any container:

```sh
python3 -m http.server 8080 --bind 127.0.0.1 --directory public
```

Open http://localhost:8080/tests.html. All checks should report PASS. A plain static server can preview the UI but cannot supply the `/api/` proxies; use nginx for live feeds. Tests are excluded from the production image.

Validate the running nginx image with:

```sh
docker exec pulse nginx -t
python3 tests/smoke.py http://localhost:8080
```

The smoke checks use only Python's standard library. They verify static assets, security headers, the health endpoint, proxy restrictions, and optionally live upstreams (`--live`). Browser checks cover XML parsing, stable IDs, unsafe URLs, storage compatibility, filtering, exports, source adapters, and cancellation.

WDS is vendored unchanged under `public/wds/` from the shared design system. The app uses its public classes, custom elements, and styling hooks; no package installation is needed.

Keep the nginx/Alpine base image updated and scanned. Removing Node and npm dependencies reduces the runtime and dependency surface; it does not make the container vulnerability-free.