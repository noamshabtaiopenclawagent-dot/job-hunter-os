import sqlite3
import jobhunter_os as j
conn = sqlite3.connect("nexus_index.sqlite")
cur = conn.cursor()
cur.execute("SELECT source_origin FROM jobs LIMIT 1;")
res = cur.fetchone()
print(f"source_origin: {res[0] if res else 'None'}")
