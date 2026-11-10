from datetime import datetime
from app.database import db

class StudyTask(db.Model):
    __tablename__ = "study_tasks"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    subject = db.Column(db.String(50), nullable=False)
    target_date = db.Column(db.Date, nullable=False)
    duration_minutes = db.Column(db.Integer, nullable=False, default=45)
    is_completed = db.Column(db.Boolean, nullable=False, default=False)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "subject": self.subject,
            "target_date": self.target_date.isoformat() if self.target_date else None,
            "duration_minutes": self.duration_minutes,
            "is_completed": self.is_completed,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
