#proxy.py: This is temporary, because nginx cannot be installed yet.
#no mitagtion yet only forwarding


from http.server import BaseHTTPRequestHandler, HTTPServer
import urllib.request
import urllib.error

UPSTREAM = "http://137.22.4.153:8000"
LISTEN_HOST = "0.0.0.0"
LISTEN_PORT = 8000

class ProxyHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/proxy-health":
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write(b"proxy ok\n")
            return

        target_url = UPSTREAM + self.path

        req = urllib.request.Request(
            url=target_url,
            method="GET",
            headers={
                "Host": self.headers.get("Host", ""),
                "User-Agent": self.headers.get("User-Agent", "proxy.py"),
            },
        )

        try:
            with urllib.request.urlopen(req, timeout=10) as r:
                body = r.read()
                self.send_response(r.status)
                for k, v in r.headers.items():
                    if k.lower() not in {
                        "connection",
                        "keep-alive",
                        "proxy-authenticate",
                        "proxy-authorization",
                        "te",
                        "trailers",
                        "transfer-encoding",
                        "upgrade",
                    }:
                        self.send_header(k, v)
                self.end_headers()
                self.wfile.write(body)

        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write(f"Upstream error: {e}\n".encode())

        except Exception as e:
            self.send_response(502)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write(f"Bad Gateway: {e}\n".encode())

    def log_message(self, format, *args):
        return

def main():
    HTTPServer((LISTEN_HOST, LISTEN_PORT), ProxyHandler).serve_forever()

if __name__ == "__main__":
    main()
