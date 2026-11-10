from functools import wraps
from flask import session, jsonify, g
from app.database import db
from app.models.user import User

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({
                "success": False,
                "error": "Authentication required. Please log in to continue."
            }), 401
        
        user = db.session.get(User, user_id)
        if not user:
            session.clear()
            return jsonify({
                "success": False,
                "error": "User account no longer exists."
            }), 401
            
        g.current_user = user
        return f(*args, **kwargs)
    return decorated_function
