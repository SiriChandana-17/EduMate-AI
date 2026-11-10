from datetime import datetime
from app.database import db

class Quiz(db.Model):
    __tablename__ = "quizzes"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subject = db.Column(db.String(50), nullable=False)
    topic = db.Column(db.String(150), nullable=False)
    class_level = db.Column(db.String(20), nullable=False)
    difficulty = db.Column(db.String(20), nullable=False, default="Medium")
    score = db.Column(db.Integer, nullable=False, default=0)
    total_questions = db.Column(db.Integer, nullable=False, default=5)
    percentage = db.Column(db.Numeric(5, 2), nullable=False, default=0.00)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    questions = db.relationship("QuizQuestion", backref="quiz", cascade="all, delete-orphan", lazy="joined")

    def to_dict(self, include_questions=False):
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "subject": self.subject,
            "topic": self.topic,
            "class_level": self.class_level,
            "difficulty": self.difficulty,
            "score": self.score,
            "total_questions": self.total_questions,
            "percentage": float(self.percentage) if self.percentage is not None else 0.0,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
        if include_questions:
            data["questions"] = [q.to_dict() for q in self.questions]
        return data

class QuizQuestion(db.Model):
    __tablename__ = "quiz_questions"

    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    option_a = db.Column(db.String(255), nullable=False)
    option_b = db.Column(db.String(255), nullable=False)
    option_c = db.Column(db.String(255), nullable=False)
    option_d = db.Column(db.String(255), nullable=False)
    correct_option = db.Column(db.String(1), nullable=False)  # 'A', 'B', 'C', 'D'
    student_answer = db.Column(db.String(1), nullable=True)   # 'A', 'B', 'C', 'D'
    explanation = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self, hide_answer=False):
        data = {
            "id": self.id,
            "quiz_id": self.quiz_id,
            "question_text": self.question_text,
            "options": {
                "A": self.option_a,
                "B": self.option_b,
                "C": self.option_c,
                "D": self.option_d
            },
            "student_answer": self.student_answer
        }
        if not hide_answer:
            data["correct_option"] = self.correct_option
            data["explanation"] = self.explanation
        return data
