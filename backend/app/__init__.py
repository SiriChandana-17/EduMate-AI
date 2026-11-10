import os
from flask import Flask
from flask_cors import CORS

try:
    from app.config import Config
except ImportError:
    from config import Config

from app.database import db


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Use local SQLite database when fallback is enabled
    if os.environ.get("USE_SQLITE_FALLBACK", "true").lower() == "true":
        print("[Database]: Using local SQLite database...")
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///edumate_fallback.db"

    # Enable CORS for the frontend
    CORS(
        app,
        supports_credentials=True,
        origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000"
        ],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"]
    )

    # Initialize SQLAlchemy
    db.init_app(app)

    # IMPORTANT: Import all models before creating database tables
    with app.app_context():
        from app.models import (
            User,
            Conversation,
            ChatMessage,
            Note,
            Quiz,
            QuizQuestion,
            StudyTask
        )

        db.create_all()
        print("[Database]: Tables initialized successfully.")

    # Register API routes
    from app.routes.auth_routes import auth_bp
    from app.routes.tutor_routes import tutor_bp
    from app.routes.notes_routes import notes_bp
    from app.routes.quiz_routes import quiz_bp
    from app.routes.planner_routes import planner_bp
    from app.routes.analytics_routes import analytics_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(tutor_bp)
    app.register_blueprint(notes_bp)
    app.register_blueprint(quiz_bp)
    app.register_blueprint(planner_bp)
    app.register_blueprint(analytics_bp)

    @app.route("/api/health", methods=["GET"])
    def health():
        return {
            "status": "healthy",
            "service": "EduMate AI Backend",
            "version": "1.0.0"
        }, 200

    return app