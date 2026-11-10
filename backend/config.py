import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend directory
base_dir = Path(__file__).resolve().parent
load_dotenv(base_dir / ".env")

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "edumate-default-secret-key-classes-6-10")
    
    # MySQL Database credentials
    MYSQL_HOST = os.environ.get("MYSQL_HOST", "localhost")
    MYSQL_PORT = os.environ.get("MYSQL_PORT", "3306")
    MYSQL_USER = os.environ.get("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.environ.get("MYSQL_PASSWORD", "")
    MYSQL_DB = os.environ.get("MYSQL_DB", "edumate_ai")
    
    # SQLAlchemy URI
    if MYSQL_PASSWORD:
        SQLALCHEMY_DATABASE_URI = (
            f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}?charset=utf8mb4"
        )
    else:
        SQLALCHEMY_DATABASE_URI = (
            f"mysql+pymysql://{MYSQL_USER}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}?charset=utf8mb4"
        )
        
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Session cookie configurations
    SESSION_COOKIE_NAME = "edumate_session"
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = False  # Set to True in production HTTPS
    PERMANENT_SESSION_LIFETIME = 86400 * 7  # 7 days
    
    # AI Key
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
