from datetime import datetime
from app.database import db

class Note(db.Model):
    __tablename__ = "notes"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subject = db.Column(db.String(50), nullable=False)
    topic = db.Column(db.String(150), nullable=False)
    class_level = db.Column(db.String(20), nullable=False)
    language = db.Column(db.String(20), nullable=False, default="English")
    note_type = db.Column(db.String(50), nullable=False, default="detailed")  # 'short', 'detailed', 'definitions', 'formulas', 'revision'
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "subject": self.subject,
            "topic": self.topic,
            "class_level": self.class_level,
            "language": self.language,
            "note_type": self.note_type,
            "title": self.title,
            "content": self.content,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
