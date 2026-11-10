from flask import Blueprint, request, jsonify, g
from app.database import db
from app.models.quiz import Quiz, QuizQuestion
from app.utils.decorators import login_required
from app.services.ai_service import AIService

quiz_bp = Blueprint("quiz", __name__, url_prefix="/api/quiz")

@quiz_bp.route("/generate", methods=["POST"])
@login_required
def generate_quiz():
    data = request.get_json() or {}
    subject = data.get("subject", "Science")
    topic = (data.get("topic") or "").strip()
    difficulty = data.get("difficulty", "Medium")
    class_level = data.get("class_level") or g.current_user.student_class

    if not topic:
        return jsonify({"success": False, "error": "Topic is required to generate a quiz."}), 400

    raw_questions = AIService.generate_quiz(
        subject=subject,
        topic=topic,
        class_level=class_level,
        difficulty=difficulty
    )

    if not raw_questions:
        return jsonify({"success": False, "error": "Unable to generate quiz questions. Please try again."}), 500

    # Save to database
    quiz = Quiz(
        user_id=g.current_user.id,
        subject=subject,
        topic=topic,
        class_level=class_level,
        difficulty=difficulty,
        score=0,
        total_questions=len(raw_questions),
        percentage=0.0
    )
    db.session.add(quiz)
    db.session.flush()

    for q in raw_questions:
        qq = QuizQuestion(
            quiz_id=quiz.id,
            question_text=q["question_text"],
            option_a=q["option_a"],
            option_b=q["option_b"],
            option_c=q["option_c"],
            option_d=q["option_d"],
            correct_option=q["correct_option"],
            explanation=q["explanation"]
        )
        db.session.add(qq)

    db.session.commit()

    # Return questions with answers hidden for secure client-side taking
    return jsonify({
        "success": True,
        "quiz_id": quiz.id,
        "subject": quiz.subject,
        "topic": quiz.topic,
        "difficulty": quiz.difficulty,
        "class_level": quiz.class_level,
        "total_questions": quiz.total_questions,
        "questions": [q.to_dict(hide_answer=True) for q in quiz.questions]
    }), 201

@quiz_bp.route("/submit", methods=["POST"])
@login_required
def submit_quiz():
    data = request.get_json() or {}
    quiz_id = data.get("quiz_id")
    student_answers = data.get("answers", {})  # e.g. {"12": "A", "13": "B"}

    if not quiz_id:
        return jsonify({"success": False, "error": "Quiz ID is required."}), 400

    quiz = Quiz.query.filter_by(id=quiz_id, user_id=g.current_user.id).first()
    if not quiz:
        return jsonify({"success": False, "error": "Quiz session not found."}), 404

    correct_count = 0
    detailed_results = []

    for qq in quiz.questions:
        ans = student_answers.get(str(qq.id)) or student_answers.get(qq.id)
        if ans:
            ans = str(ans).upper().strip()
        qq.student_answer = ans

        is_correct = (ans == qq.correct_option)
        if is_correct:
            correct_count += 1

        detailed_results.append({
            "id": qq.id,
            "question_text": qq.question_text,
            "options": {
                "A": qq.option_a,
                "B": qq.option_b,
                "C": qq.option_c,
                "D": qq.option_d
            },
            "student_answer": qq.student_answer,
            "correct_option": qq.correct_option,
            "is_correct": is_correct,
            "explanation": qq.explanation
        })

    quiz.score = correct_count
    quiz.percentage = round((correct_count / quiz.total_questions) * 100, 2) if quiz.total_questions > 0 else 0.0
    db.session.commit()

    return jsonify({
        "success": True,
        "quiz_id": quiz.id,
        "subject": quiz.subject,
        "topic": quiz.topic,
        "score": quiz.score,
        "total_questions": quiz.total_questions,
        "percentage": float(quiz.percentage),
        "passed": quiz.percentage >= 60.0,
        "results": detailed_results
    }), 200

@quiz_bp.route("/history", methods=["GET"])
@login_required
def quiz_history():
    quizzes = (
        Quiz.query.filter_by(user_id=g.current_user.id)
        .order_by(Quiz.created_at.desc())
        .limit(25)
        .all()
    )
    return jsonify({
        "success": True,
        "quizzes": [q.to_dict() for q in quizzes]
    }), 200

@quiz_bp.route("/<int:quiz_id>", methods=["GET"])
@login_required
def get_quiz(quiz_id):
    quiz = Quiz.query.filter_by(id=quiz_id, user_id=g.current_user.id).first()
    if not quiz:
        return jsonify({"success": False, "error": "Quiz not found."}), 404

    return jsonify({
        "success": True,
        "quiz": quiz.to_dict(include_questions=True)
    }), 200
