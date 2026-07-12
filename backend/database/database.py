import os

from dotenv import load_dotenv  # type: ignore

from sqlalchemy import create_engine, text  # type: ignore
from sqlalchemy.engine import URL  # type: ignore
from sqlalchemy.orm import declarative_base, sessionmaker  # type: ignore

# ----------------------------------------------------
# Load Environment Variables
# ----------------------------------------------------

load_dotenv()

# ----------------------------------------------------
# SQLAlchemy
# ----------------------------------------------------

Base = declarative_base()

engine = None
SessionLocal = None


# ----------------------------------------------------
# Build PostgreSQL URL
# ----------------------------------------------------

def build_database_url():

    host = os.getenv("DB_HOST")
    port = os.getenv("DB_PORT")
    database = os.getenv("DB_NAME")
    username = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD")

    if not all([host, port, database, username, password]):
        raise ValueError(
            "Database configuration is incomplete. "
            "Please check your .env file."
        )

    return URL.create(
        drivername="postgresql+psycopg2",
        username=username,
        password=password,
        host=host,
        port=int(port),
        database=database,
    )


# ----------------------------------------------------
# Initialize Database
# ----------------------------------------------------

def init_db():

    global engine
    global SessionLocal

    database_url = build_database_url()

    engine = create_engine(
        database_url,
        echo=False,
        future=True,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
    )
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))

        print("Connected to PostgreSQL successfully.")

    except Exception as e:
        raise RuntimeError(
            f"Unable to connect to PostgreSQL.\n{e}"
        )

    SessionLocal = sessionmaker(
        bind=engine,
        autocommit=False,
        autoflush=False,
        expire_on_commit=False,
    )


# ----------------------------------------------------
# Create Tables
# ----------------------------------------------------

def create_tables():

    from database import models

    Base.metadata.create_all(bind=engine)


# ----------------------------------------------------
# Database Dependency
# ----------------------------------------------------

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()