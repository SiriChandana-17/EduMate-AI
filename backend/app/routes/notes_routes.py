from flask import Blueprint, request, jsonify, g
from app.database import db
from app.models.note import Note
from app.utils.decorators import login_required
from app.services.ai_service import AIService

notes_bp = Blueprint("notes", __name__, url_prefix="/api/notes")

@notes_bp.route("/generate", methods=["POST"])
@login_required
def generate_note():
    data = request.get_json() or {}
    subject = data.get("subject", "Science")
    topic = (data.get("topic") or "").strip()
    note_type = data.get("note_type", "detailed")  # short, detailed, definitions, formulas, revision
    language = data.get("language") or g.current_user.preferred_language or "English"
    class_level = data.get("class_level") or g.current_user.student_class

    if not topic:
        return jsonify({"success": False, "error": "Topic is required to generate notes."}), 400

    result = AIService.generate_notes(
        subject=subject,
        topic=topic,
        class_level=class_level,
        note_type=note_type,
        language=language
    )

    return jsonify({
        "success": True,
        "note": {
            "title": result["title"],
            "content": result["content"],
            "subject": subject,
            "topic": topic,
            "note_type": note_type,
            "class_level": class_level,
            "language": language
        }
    }), 200

@notes_bp.route("", methods=["GET"])
@login_required
def get_notes():
    subject = request.args.get("subject")
    search = request.args.get("search")

    query = Note.query.filter_by(user_id=g.current_user.id)

    if subject and subject != "All":
        query = query.filter_by(subject=subject)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            db.or_(
                Note.title.ilike(search_filter),
                Note.topic.ilike(search_filter),
                Note.content.ilike(search_filter)
            )
        )

    notes = query.order_by(Note.created_at.desc()).all()
    return jsonify({
        "success": True,
        "notes": [n.to_dict() for n in notes]
    }), 200

@notes_bp.route("", methods=["POST"])
@login_required
def save_note():
    data = request.get_json() or {}
    title = (data.get("title") or "Study Notes").strip()
    topic = (data.get("topic") or "General").strip()
    subject = data.get("subject", "Science")
    content = data.get("content", "").strip()
    note_type = data.get("note_type", "detailed")
    class_level = data.get("class_level") or g.current_user.student_class
    language = data.get("language") or g.current_user.preferred_language

    if not content:
        return jsonify({"success": False, "error": "Note content cannot be empty."}), 400

    note = Note(
        user_id=g.current_user.id,
        title=title,
        topic=topic,
        subject=subject,
        content=content,
        note_type=note_type,
        class_level=class_level,
        language=language
    )
    db.session.add(note)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Note saved successfully!",
        "note": note.to_dict()
    }), 201

@notes_bp.route("/<int:note_id>", methods=["GET"])
@login_required
def get_single_note(note_id):
    note = Note.query.filter_by(id=note_id, user_id=g.current_user.id).first()
    if not note:
        return jsonify({"success": False, "error": "Note not found."}), 404
    return jsonify({"success": True, "note": note.to_dict()}), 200

@notes_bp.route("/<int:note_id>", methods=["PUT"])
@login_required
def update_note(note_id):
    note = Note.query.filter_by(id=note_id, user_id=g.current_user.id).first()
    if not note:
        return jsonify({"success": False, "error": "Note not found."}), 404

    data = request.get_json() or {}
    if "title" in data:
        note.title = data["title"].strip()
    if "content" in data:
        note.content = data["content"].strip()
    if "topic" in data:
        note.topic = data["topic"].strip()
    if "subject" in data:
        note.subject = data["subject"].strip()

    db.session.commit()
    return jsonify({
        "success": True,
        "message": "Note updated successfully!",
        "note": note.to_dict()
    }), 200

@notes_bp.route("/<int:note_id>", methods=["DELETE"])
@login_required
def delete_note(note_id):
    note = Note.query.filter_by(id=note_id, user_id=g.current_user.id).first()
    if not note:
        return jsonify({"success": False, "error": "Note not found."}), 404

    db.session.delete(note)
    db.session.commit()
    return jsonify({"success": True, "message": "Note deleted successfully."}), 200
