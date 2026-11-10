import re
from flask import Blueprint, request, jsonify, session
from app.database import db
from app.models.user import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

EMAIL_REGEX = r"^[\w\.-]+@[\w\.-]+\.\w+$"
VALID_CLASSES = ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"]
VALID_LANGUAGES = ["English", "Telugu"]

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    confirm_password = data.get("confirm_password") or ""
    student_class = data.get("student_class") or ""
    preferred_language = data.get("preferred_language") or "English"
    terms_accepted = data.get("terms_accepted", False)

    # Validations
    errors = {}
    if not name or len(name) < 2:
        errors["name"] = "Full name is required (at least 2 characters)."
    if not email or not re.match(EMAIL_REGEX, email):
        errors["email"] = "Please provide a valid email address."
    if not password or len(password) < 6:
        errors["password"] = "Password must be at least 6 characters long."
    elif password != confirm_password:
        errors["confirm_password"] = "Passwords do not match."
    if student_class not in VALID_CLASSES:
        errors["student_class"] = f"Class must be one of: {', '.join(VALID_CLASSES)}."
    if preferred_language not in VALID_LANGUAGES:
        errors["preferred_language"] = "Language must be English or Telugu."
    if not terms_accepted:
        errors["terms_accepted"] = "You must agree to the Terms and Privacy Policy."

    if errors:
        return jsonify({
            "success": False,
            "errors": errors,
            "error": next(iter(errors.values()))
        }), 400

    # Duplicate check
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({
            "success": False,
            "errors": {"email": "An account with this email already exists."},
            "error": "An account with this email already exists. Please log in instead."
        }), 409

    try:
        new_user = User(
            name=name,
            email=email,
            student_class=student_class,
            preferred_language=preferred_language
        )
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        # Establish server-side session
        session.clear()
        session["user_id"] = new_user.id
        session.permanent = True

        return jsonify({
            "success": True,
            "message": "Student account registered successfully!",
            "user": new_user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "error": f"Registration failed due to a server error: {str(e)}"
        }), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    remember_me = bool(data.get("remember_me", False))

    if not email or not password:
        return jsonify({
            "success": False,
            "error": "Email and password are required."
        }), 400

    if not re.match(EMAIL_REGEX, email):
        return jsonify({
            "success": False,
            "error": "Please enter a valid email address."
        }), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({
            "success": False,
            "error": "Incorrect email or password. Please verify your credentials."
        }), 401

    session.clear()
    session["user_id"] = user.id
    if remember_me:
        session.permanent = True

    return jsonify({
        "success": True,
        "message": f"Welcome back, {user.name}!",
        "user": user.to_dict()
    }), 200


@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({
        "success": True,
        "message": "Logged out successfully."
    }), 200


@auth_bp.route("/me", methods=["GET"])
def get_current_user():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({
            "authenticated": False,
            "user": None
        }), 200

    user = db.session.get(User, user_id)
    if not user:
        session.clear()
        return jsonify({
            "authenticated": False,
            "user": None
        }), 200

    return jsonify({
        "authenticated": True,
        "user": user.to_dict()
    }), 200
