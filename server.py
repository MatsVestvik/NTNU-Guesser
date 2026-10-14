#!/usr/bin/env python3
"""
NTNU Guesser - HTTP Server & Leaderboard API
Supports static file serving + REST API for Daily Challenge & Shared Leaderboard.
"""
import http.server
import socketserver
import json
import sqlite3
import os
import sys
import datetime
import urllib.parse

PORT = int(os.environ.get('PORT', 8080))
DB_FILE = os.path.join(os.path.dirname(__file__), 'data', 'leaderboard.db')

def init_db():
    os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)
    with sqlite3.connect(DB_FILE) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS leaderboard (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                score INTEGER NOT NULL,
                total_distance REAL NOT NULL,
                challenge_date TEXT NOT NULL,
                rounds_json TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_date_score ON leaderboard (challenge_date, score DESC, total_distance ASC);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_alltime ON leaderboard (score DESC, total_distance ASC);")
        conn.commit()

        # Seed some friendly campus initial scores for today if empty
        cursor = conn.cursor()
        today_str = datetime.date.today().isoformat()
        cursor.execute("SELECT COUNT(*) FROM leaderboard WHERE challenge_date = ?", (today_str,))
        count = cursor.fetchone()[0]
        if count == 0:
            sample_records = [
                ("SivIng_Kari", 24320, 34.2, today_str, "[]"),
                ("Dragvoll_Eirik", 22890, 89.5, today_str, "[]"),
                ("Gløs_Kongen", 21450, 142.0, today_str, "[]"),
                ("Samfundet_Vakt", 19800, 260.4, today_str, "[]"),
                ("Linjeforening_Delta", 18200, 380.0, today_str, "[]")
            ]
            cursor.executemany("""
                INSERT INTO leaderboard (name, score, total_distance, challenge_date, rounds_json)
                VALUES (?, ?, ?, ?, ?)
            """, sample_records)
            conn.commit()

class NTNUHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable caching controls
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        # CORS headers for smooth local API integration
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        
        # API: /api/daily
        if parsed.path == '/api/daily':
            today = datetime.date.today()
            today_str = today.isoformat()
            
            # Days since epoch or project start
            start_date = datetime.date(2026, 1, 1)
            day_number = (today - start_date).days + 1
            
            # Seconds until midnight
            now = datetime.datetime.now()
            midnight = datetime.datetime.combine(now.date() + datetime.timedelta(days=1), datetime.time.min)
            seconds_until = int((midnight - now).total_seconds())

            data = {
                "date": today_str,
                "dayNumber": day_number,
                "secondsUntilMidnight": seconds_until
            }
            self.send_json_response(data)
            return

        # API: /api/leaderboard
        if parsed.path == '/api/leaderboard':
            params = urllib.parse.parse_qs(parsed.query)
            l_type = params.get('type', ['daily'])[0]
            today_str = datetime.date.today().isoformat()
            query_date = params.get('date', [today_str])[0]

            with sqlite3.connect(DB_FILE) as conn:
                cursor = conn.cursor()
                if l_type == 'alltime':
                    cursor.execute("""
                        SELECT name, score, total_distance, challenge_date, created_at
                        FROM leaderboard
                        ORDER BY score DESC, total_distance ASC
                        LIMIT 50
                    """)
                else:
                    cursor.execute("""
                        SELECT name, score, total_distance, challenge_date, created_at
                        FROM leaderboard
                        WHERE challenge_date = ?
                        ORDER BY score DESC, total_distance ASC
                        LIMIT 50
                    """, (query_date,))
                
                rows = cursor.fetchall()

                # Get all scores for distribution
                cursor.execute("SELECT score FROM leaderboard WHERE challenge_date = ? ORDER BY score ASC", (query_date,))
                all_scores = [r[0] for r in cursor.fetchall()]

            entries = []
            for rank, r in enumerate(rows, 1):
                entries.append({
                    "rank": rank,
                    "name": r[0],
                    "score": r[1],
                    "totalDistance": round(r[2], 1),
                    "date": r[3],
                    "created_at": r[4]
                })

            self.send_json_response({
                "type": l_type,
                "date": query_date,
                "entries": entries,
                "allScores": all_scores,
                "totalPlayers": len(all_scores)
            })
            return

        # Fallback to standard static file server
        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)

        # API: /api/score
        if parsed.path == '/api/score':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                payload = json.loads(body)
            except Exception:
                self.send_json_response({"error": "Invalid JSON"}, status=400)
                return

            name = str(payload.get('name', '')).strip()
            if not name:
                name = "Anonym Gløsing"
            name = name[:24]

            try:
                score = int(payload.get('score', 0))
                score = max(0, min(25000, score))
                total_distance = float(payload.get('totalDistance', 0))
            except (ValueError, TypeError):
                self.send_json_response({"error": "Invalid numeric score/distance"}, status=400)
                return

            today_str = datetime.date.today().isoformat()
            challenge_date = payload.get('date', today_str)
            rounds_json = json.dumps(payload.get('rounds', []))

            with sqlite3.connect(DB_FILE) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO leaderboard (name, score, total_distance, challenge_date, rounds_json)
                    VALUES (?, ?, ?, ?, ?)
                """, (name, score, total_distance, challenge_date, rounds_json))
                inserted_id = cursor.lastrowid
                conn.commit()

                # Determine rank for this user on today's challenge
                cursor.execute("""
                    SELECT COUNT(*) + 1 FROM leaderboard
                    WHERE challenge_date = ? AND (score > ? OR (score = ? AND total_distance < ?))
                """, (challenge_date, score, score, total_distance))
                user_rank = cursor.fetchone()[0]

                # Fetch all scores for percentile & curve
                cursor.execute("SELECT score FROM leaderboard WHERE challenge_date = ? ORDER BY score ASC", (challenge_date,))
                all_scores = [r[0] for r in cursor.fetchall()]
                total_players = len(all_scores)

                # Calculate empirical percentile
                lower_count = sum(1 for s in all_scores if s < score)
                if total_players > 1:
                    percentile = int(round((lower_count / (total_players - 1)) * 100))
                else:
                    import math
                    z = (score - 16500) / 4000
                    percentile = int(round(0.5 * (1 + math.erf(z / math.sqrt(2))) * 100))
                percentile = max(1, min(99, percentile))

                # Fetch updated top 50
                cursor.execute("""
                    SELECT name, score, total_distance, challenge_date, created_at
                    FROM leaderboard
                    WHERE challenge_date = ?
                    ORDER BY score DESC, total_distance ASC
                    LIMIT 50
                """, (challenge_date,))
                rows = cursor.fetchall()

            entries = []
            for rank, r in enumerate(rows, 1):
                entries.append({
                    "rank": rank,
                    "name": r[0],
                    "score": r[1],
                    "totalDistance": round(r[2], 1),
                    "date": r[3],
                    "created_at": r[4]
                })

            self.send_json_response({
                "success": True,
                "rank": user_rank,
                "totalPlayers": total_players,
                "percentile": percentile,
                "allScores": all_scores,
                "insertedId": inserted_id,
                "leaderboard": entries
            })
            return

        self.send_json_response({"error": "Not Found"}, status=404)

    def send_json_response(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

def run():
    init_db()
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), NTNUHandler) as httpd:
        print(f"==================================================")
        print(f"  NTNU GUESSER Kjører på http://localhost:{PORT}")
        print(f"  Leaderboard DB: {DB_FILE}")
        print(f"  Trykk Ctrl+C for å avslutte serveren.")
        print(f"==================================================")
        if len(sys.argv) > 1 and sys.argv[1] == '--open':
            import webbrowser
            webbrowser.open(f"http://localhost:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nAvslutter server...")
            httpd.server_close()

if __name__ == '__main__':
    run()
