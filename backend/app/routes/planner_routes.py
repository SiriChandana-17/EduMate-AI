from datetime import datetime
from flask import Blueprint, request, jsonify, g
from app.database import db
from app.models.task import StudyTask
from app.utils.decorators import login_required
from app.services.ai_service import AIService

planner_bp = Blueprint("planner", __name__, url_prefix="/api/planner")

@planner_bp.route("/tasks", methods=["GET"])
@login_required
def get_tasks():
    tasks = (
        StudyTask.query.filter_by(user_id=g.current_user.id)
        .order_by(StudyTask.target_date.asc(), StudyTask.is_completed.asc())
        .all()
    )
    return jsonify({
        "success": True,
        "tasks": [t.to_dict() for t in tasks]
    }), 200

@planner_bp.route("/tasks", methods=["POST"])
@login_required
def create_task():
    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    subject = data.get("subject", "General")
    target_date_str = data.get("target_date")
    duration = int(data.get("duration_minutes") or 45)
    notes = data.get("notes", "")

    if not title:
        return jsonify({"success": False, "error": "Task title is required."}), 400

    try:
        target_date = datetime.strptime(target_date_str, "%Y-%m-%d").date() if target_date_str else datetime.utcnow().date()
    except Exception:
        target_date = datetime.utcnow().date()

    task = StudyTask(
        user_id=g.current_user.id,
        title=title,
        subject=subject,
        target_date=target_date,
        duration_minutes=duration,
        notes=notes
    )
    db.session.add(task)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Study task added!",
        "task": task.to_dict()
    }), 201

@planner_bp.route("/tasks/<int:task_id>/toggle", methods=["PATCH"])
@login_required
def toggle_task(task_id):
    task = StudyTask.query.filter_by(id=task_id, user_id=g.current_user.id).first()
    if not task:
        return jsonify({"success": False, "error": "Task not found."}), 404

    task.is_completed = not task.is_completed
    db.session.commit()

    return jsonify({
        "success": True,
        "task": task.to_dict()
    }), 200

@planner_bp.route("/tasks/<int:task_id>", methods=["DELETE"])
@login_required
def delete_task(task_id):
    task = StudyTask.query.filter_by(id=task_id, user_id=g.current_user.id).first()
    if not task:
        return jsonify({"success": False, "error": "Task not found."}), 404

    db.session.delete(task)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Task removed."
    }), 200

@planner_bp.route("/suggest", methods=["POST"])
@login_required
def suggest_schedule():
    tasks = StudyTask.query.filter_by(user_id=g.current_user.id, is_completed=False).all()
    task_dicts = [t.to_dict() for t in tasks]
    
    plan = AIService.generate_study_plan(task_dicts, g.current_user.student_class)
    return jsonify({
        "success": True,
        "schedule": plan
    }), 200
