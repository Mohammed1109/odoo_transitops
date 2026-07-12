import os

from dotenv import load_dotenv #type:ignore
import psycopg2 #type:ignore

load_dotenv()

HOST = os.getenv("DB_HOST")
PORT = os.getenv("DB_PORT")
USER = os.getenv("DB_USER")
PASSWORD = os.getenv("DB_PASSWORD")
DATABASE = os.getenv("DB_NAME")

connection = psycopg2.connect(
    host=HOST,
    port=PORT,
    user=USER,
    password=PASSWORD,
    dbname="postgres",   # Connect to postgres, NOT transitops
)

connection.autocommit = True

cursor = connection.cursor()

# Disconnect everyone from TransitOps
cursor.execute(f"""
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = '{DATABASE}'
AND pid <> pg_backend_pid();
""")

cursor.execute(f"DROP DATABASE IF EXISTS {DATABASE};")
cursor.execute(f"CREATE DATABASE {DATABASE};")

cursor.close()
connection.close()

print(f"Database '{DATABASE}' recreated successfully.")