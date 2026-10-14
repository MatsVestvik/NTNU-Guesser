#!/usr/bin/env python3
"""
Simple HTTP Server for NTNU Guesser
Serves the game locally at http://localhost:8080
"""
import http.server
import socketserver
import webbrowser
import sys

PORT = 8080

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable caching controls
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def run():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"==================================================")
        print(f"  NTNU GUESSER Kjører på http://localhost:{PORT}")
        print(f"  Trykk Ctrl+C for å avslutte serveren.")
        print(f"==================================================")
        if len(sys.argv) > 1 and sys.argv[1] == '--open':
            webbrowser.open(f"http://localhost:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nAvslutter server...")
            httpd.server_close()

if __name__ == '__main__':
    run()
