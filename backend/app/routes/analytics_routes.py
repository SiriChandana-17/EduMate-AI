from flask import Blueprint, jsonify, g
from sqlalchemy import func
from app.database import db
from app.models.quiz import Quiz
from app.models.task import StudyTask
from app.models.note import Note
from app.models.chat import Conversation
from app.utils.decorators import login_required

analytics_bp = Blueprint("analytics", __name__, url_prefix="/api/analytics")

@analytics_bp.route("/summary", methods=["GET"])
@login_required
def get_analytics_summary():
    user_id = g.current_user.id

    # 1. Quizzes summary
    quizzes = Quiz.query.filter_by(user_id=user_id).order_by(Quiz.created_at.asc()).all()
    total_quizzes = len(quizzes)

    # 2. Subject-wise performance
    subject_stats = {}
    topic_scores = {}

    for q in quizzes:
        subj = q.subject or "Other"
        pct = float(q.percentage) if q.percentage is not None else 0.0

        if subj not in subject_stats:
            subject_stats[subj] = {"total_score": 0.0, "count": 0}
        subject_stats[subj]["total_score"] += pct
        subject_stats[subj]["count"] += 1

        # Track topic accuracy for weak topic detection
        top = q.topic.strip()
        if top not in topic_scores:
            topic_scores[top] = {"subject": subj, "total_pct": 0.0, "attempts": 0}
        topic_scores[top]["total_pct"] += pct
        topic_scores[top]["attempts"] += 1

    subject_performance = []
    for subj, val in subject_stats.items():
        avg = round(val["total_score"] / val["count"], 1) if val["count"] > 0 else 0.0
        subject_performance.append({
            "subject": subj,
            "average_percentage": avg,
            "attempts": val["count"]
        })

    # 3. Weak-Topic Detection: real analysis where average accuracy < 70%
    weak_topics = []
    for top, stat in topic_scores.items():
        avg_pct = round(stat["total_pct"] / stat["attempts"], 1)
        if avg_pct < 70.0:
            weak_topics.append({
                "topic": top,
                "subject": stat["subject"],
                "accuracy": avg_pct,
                "attempts": stat["attempts"],
                "recommendation": f"Review {stat['subject']} notes for '{top}' and re-attempt a practice quiz."
            })

    # Sort weak topics with lowest accuracy first
    weak_topics.sort(key=lambda x: x["accuracy"])

    # 4. Score trends (chronological list)
    score_trends = []
    for q in quizzes[-10:]:  # Last 10 quizzes
        score_trends.append({
            "id": q.id,
            "date": q.created_at.strftime("%b %d") if q.created_at else "",
            "subject": q.subject,
            "topic": q.topic,
            "percentage": float(q.percentage) if q.percentage is not None else 0.0
        })

    # 5. Study Tasks stats
    tasks = StudyTask.query.filter_by(user_id=user_id).all()
    total_tasks = len(tasks)
    completed_tasks = sum(1 for t in tasks if t.is_completed)
    total_minutes_studied = sum(t.duration_minutes for t in tasks if t.is_completed)
    task_completion_rate = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0.0

    # 6. Overall stats
    notes_count = Note.query.filter_by(user_id=user_id).count()
    doubts_count = Conversation.query.filter_by(user_id=user_id).count()

    overall_avg_score = round(
        sum(float(q.percentage) for q in quizzes) / total_quizzes, 1
    ) if total_quizzes > 0 else 0.0

    return jsonify({
        "success": True,
        "summary": {
            "total_quizzes": total_quizzes,
            "average_score": overall_avg_score,
            "weak_topics_count": len(weak_topics),
            "completed_tasks": completed_tasks,
            "total_tasks": total_tasks,
            "task_completion_rate": task_completion_rate,
            "total_minutes_studied": total_minutes_studied,
            "notes_saved": notes_count,
            "doubts_asked": doubts_count
        },
        "subject_performance": subject_performance,
        "weak_topics": weak_topics,
        "score_trends": score_trends
    }), 200
