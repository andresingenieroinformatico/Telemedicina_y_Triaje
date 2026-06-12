import psycopg2
import psycopg2.extras
import os
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    conn = psycopg2.connect(
        host="ep-flat-cake-apkojz64.c-7.us-east-1.aws.neon.tech",
        port=5432,
        dbname="neondb",
        user="neondb_owner",
        password="npg_YiGo7xUOJ9lV"
    )
    return conn
