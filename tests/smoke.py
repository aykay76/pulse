"""Standard-library smoke checks for a running Pulse nginx container."""

import argparse
import json
import unittest
from urllib.error import HTTPError
from urllib.request import Request, urlopen

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('url', nargs='?', default='http://localhost:8080')
parser.add_argument('--live', action='store_true', help='Also check external feeds')
options = parser.parse_args()


def request(path, method='GET'):
    try:
        with urlopen(Request(options.url.rstrip('/') + path, method=method), timeout=20) as response:
            return response.status, response.headers, response.read()
    except HTTPError as error:
        return error.code, error.headers, error.read()


class SmokeTests(unittest.TestCase):
    def test_static_assets(self):
        for path in ['/', '/app.js', '/core.js', '/feeds.js', '/topics.js', '/app.css', '/wds/wds.js', '/wds/wds.css']:
            with self.subTest(path=path):
                code, headers, body = request(path)
                self.assertEqual(code, 200)
                self.assertTrue(body)
                self.assertEqual(headers['X-Content-Type-Options'], 'nosniff')
                self.assertEqual(headers['X-Frame-Options'], 'DENY')
                self.assertIn("connect-src 'self'", headers['Content-Security-Policy'])

    def test_health(self):
        code, _, body = request('/healthz')
        self.assertEqual(code, 200)
        self.assertEqual(body, b'ok\n')

    def test_unknown_routes_are_not_proxies_or_spa_fallbacks(self):
        for path in ['/api', '/api/unknown', '/api/rss/unknown?url=http://127.0.0.1/', '/api/hn/not-allowed.json', '/missing.js', '/tests.js', '/tests.html']:
            with self.subTest(path=path):
                self.assertEqual(request(path)[0], 404)

    def test_write_methods_rejected(self):
        for path in ['/', '/api/devto']:
            for method in ['POST', 'PUT', 'DELETE']:
                with self.subTest(path=path, method=method):
                    self.assertIn(request(path, method)[0], [403, 405])

    @unittest.skipUnless(options.live, 'External feeds only checked with --live')
    def test_live_upstreams(self):
        for path in ['/api/hn/topstories.json', '/api/devto?tag=ai&per_page=1', '/api/arxiv?search_query=cat%3Acs.AI&max_results=1', '/api/rss/fowler']:
            with self.subTest(path=path):
                code, _, body = request(path)
                self.assertEqual(code, 200)
                self.assertTrue(body)
                if path.startswith(('/api/hn/', '/api/devto')):
                    self.assertIsInstance(json.loads(body), list)
                else:
                    self.assertIn(b'<', body)


if __name__ == '__main__':
    unittest.main(argv=['smoke.py'], verbosity=2)