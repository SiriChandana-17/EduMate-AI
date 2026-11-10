from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app.database import db

class User(db.Model):
    __tablename__ = "users"
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), nullable=False, unique=True, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    student_class = db.Column(db.String(20), nullable=False)  # 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'
    preferred_language = db.Column(db.String(20), nullable=False, default="English")  # 'English' or 'Telugu'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    conversations = db.relationship("Conversation", backref="user", cascade="all, delete-orphan", lazy="dynamic")
    notes = db.relationship("Note", backref="user", cascade="all, delete-orphan", lazy="dynamic")
    quizzes = db.relationship("Quiz", backref="user", cascade="all, delete-orphan", lazy="dynamic")
    tasks = db.relationship("StudyTask", backref="user", cascade="all, delete-orphan", lazy="dynamic")

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "student_class": self.student_class,
            "preferred_language": self.preferred_language,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
