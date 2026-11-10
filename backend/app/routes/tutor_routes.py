from flask import Blueprint, request, jsonify, g
from app.database import db
from app.models.chat import Conversation, ChatMessage
from app.utils.decorators import login_required
from app.services.ai_service import AIService

tutor_bp = Blueprint("tutor", __name__, url_prefix="/api/tutor")

VALID_SUBJECTS = ["Mathematics", "Science", "English", "Social Studies"]

@tutor_bp.route("/conversations", methods=["GET"])
@login_required
def list_conversations():
    conversations = (
        Conversation.query.filter_by(user_id=g.current_user.id)
        .order_by(Conversation.updated_at.desc())
        .all()
    )
    return jsonify({
        "success": True,
        "conversations": [c.to_dict() for c in conversations]
    }), 200

@tutor_bp.route("/conversations/<int:conv_id>", methods=["GET"])
@login_required
def get_conversation(conv_id):
    conversation = Conversation.query.filter_by(id=conv_id, user_id=g.current_user.id).first()
    if not conversation:
        return jsonify({"success": False, "error": "Conversation not found."}), 404
        
    return jsonify({
        "success": True,
        "conversation": conversation.to_dict(include_messages=True)
    }), 200

@tutor_bp.route("/conversations", methods=["POST"])
@login_required
def create_conversation():
    data = request.get_json() or {}
    subject = data.get("subject", "Science")
    title = (data.get("title") or f"New {subject} Discussion").strip()[:180]

    if subject not in VALID_SUBJECTS:
        subject = "Science"

    conversation = Conversation(
        user_id=g.current_user.id,
        subject=subject,
        title=title
    )
    db.session.add(conversation)
    db.session.commit()

    return jsonify({
        "success": True,
        "conversation": conversation.to_dict()
    }), 201

@tutor_bp.route("/conversations/<int:conv_id>", methods=["DELETE"])
@login_required
def delete_conversation(conv_id):
    conversation = Conversation.query.filter_by(id=conv_id, user_id=g.current_user.id).first()
    if not conversation:
        return jsonify({"success": False, "error": "Conversation not found."}), 404

    db.session.delete(conversation)
    db.session.commit()
    return jsonify({"success": True, "message": "Conversation deleted."}), 200

@tutor_bp.route("/ask", methods=["POST"])
@login_required
def ask_doubt():
    data = request.get_json() or {}
    question = (data.get("question") or "").strip()
    subject = data.get("subject") or "Science"
    language = data.get("language") or g.current_user.preferred_language or "English"
    conv_id = data.get("conversation_id")

    if not question:
        return jsonify({"success": False, "error": "Question content cannot be empty."}), 400

    if subject not in VALID_SUBJECTS:
        subject = "Science"

    # Find or create conversation
    conversation = None
    if conv_id:
        conversation = Conversation.query.filter_by(id=conv_id, user_id=g.current_user.id).first()
    
    if not conversation:
        title = question[:50] + ("..." if len(question) > 50 else "")
        conversation = Conversation(
            user_id=g.current_user.id,
            subject=subject,
            title=title
        )
        db.session.add(conversation)
        db.session.commit()

    # Build history context from messages strictly PRIOR to the new question
    past_messages = [
        {"sender": m.sender, "content": m.content}
        for m in conversation.messages
    ]

    # Save user message
    user_msg = ChatMessage(
        conversation_id=conversation.id,
        sender="user",
        content=question
    )
    db.session.add(user_msg)
    db.session.commit()

    # Call AI Service with clean history
    ai_result = AIService.answer_doubt(
        question=question,
        subject=conversation.subject,
        student_class=g.current_user.student_class,
        language=language,
        history=past_messages
    )

    if not ai_result.get("success"):
        # Real AI call failed or key is missing: return descriptive error status
        error_msg = ai_result.get("error", "AI service is currently unavailable.")
        return jsonify({
            "success": False,
            "error": error_msg,
            "conversation_id": conversation.id,
            "user_message": user_msg.to_dict()
        }), 503

    ai_response_text = ai_result.get("text", "")

    # Save real AI message
    assistant_msg = ChatMessage(
        conversation_id=conversation.id,
        sender="assistant",
        content=ai_response_text
    )
    db.session.add(assistant_msg)
    conversation.updated_at = db.func.current_timestamp()
    db.session.commit()

    return jsonify({
        "success": True,
        "conversation_id": conversation.id,
        "user_message": user_msg.to_dict(),
        "assistant_message": assistant_msg.to_dict()
    }), 200
