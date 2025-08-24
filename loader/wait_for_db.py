import os, time
import psycopg2

host = os.environ.get("POSTGRES_HOST", "db")
port = int(os.environ.get("POSTGRES_PORT", "5432"))
user = os.environ.get("POSTGRES_USER", "appuser")
password = os.environ.get("POSTGRES_PASSWORD", "apppass")
dbname = os.environ.get("POSTGRES_DB", "appdb")

for i in range(30):
    try:
        conn = psycopg2.connect(host=host, port=port, user=user, password=password, dbname=dbname)
        conn.close()
        print("✅ DB disponível")
        break
    except Exception as e:
        print(f"⏳ Aguardando DB... ({i+1}/30) - {e}")
        time.sleep(2)
else:
    raise RuntimeError("❌ Banco não respondeu a tempo")
