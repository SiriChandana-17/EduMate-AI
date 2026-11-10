import unittest
import json
from app import create_app
from app.database import db
from app.models.user import User

class BackendTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.app.config["TESTING"] = True

    def setUp(self):
        self.client = self.app.test_client()

    def test_01_unauthenticated_protected_route(self):
        """Unauthenticated requests must be rejected with 401"""
        res = self.client.get("/api/notes")
        self.assertEqual(res.status_code, 401)
        data = res.get_json()
        self.assertIn("Authentication required", data.get("error", ""))

    def test_02_registration_validation(self):
        """Registration must validate required fields and email"""
        # Missing fields
        res = self.client.post("/api/auth/register", json={})
        self.assertEqual(res.status_code, 400)

        # Invalid email
        res = self.client.post("/api/auth/register", json={
            "name": "Alex",
            "email": "not-an-email",
            "password": "Password123",
            "confirm_password": "Password123",
            "student_class": "Class 9",
            "preferred_language": "English",
            "terms_accepted": True
        })
        self.assertEqual(res.status_code, 400)

    def test_03_registration_and_duplicate_handling(self):
        """Successful registration then duplicate email rejection"""
        # Clean existing test user if present
        with self.app.app_context():
            u = User.query.filter_by(email="student.reg@example.com").first()
            if u:
                db.session.delete(u)
                db.session.commit()

        reg_payload = {
            "name": "Register Test",
            "email": "student.reg@example.com",
            "password": "SecurePassword123",
            "confirm_password": "SecurePassword123",
            "student_class": "Class 9",
            "preferred_language": "Telugu",
            "terms_accepted": True
        }
        res = self.client.post("/api/auth/register", json=reg_payload)
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertTrue(data.get("success"))
        self.assertEqual(data["user"]["student_class"], "Class 9")
        self.assertEqual(data["user"]["preferred_language"], "Telugu")

        # Duplicate attempt
        res_dup = self.client.post("/api/auth/register", json=reg_payload)
        self.assertEqual(res_dup.status_code, 409)

    def test_04_login_and_session_me(self):
        """Test login with credentials, session verification, and logout"""
        # Ensure user exists
        with self.app.app_context():
            u = User.query.filter_by(email="student.login@example.com").first()
            if not u:
                u = User(
                    name="Login Student",
                    email="student.login@example.com",
                    student_class="Class 8",
                    preferred_language="English"
                )
                u.set_password("SecurePassword123")
                db.session.add(u)
                db.session.commit()

        # Bad login
        res_bad = self.client.post("/api/auth/login", json={
            "email": "student.login@example.com",
            "password": "WrongPassword!"
        })
        self.assertEqual(res_bad.status_code, 401)

        # Good login
        res_good = self.client.post("/api/auth/login", json={
            "email": "student.login@example.com",
            "password": "SecurePassword123"
        })
        self.assertEqual(res_good.status_code, 200)

        # Check /api/auth/me session
        res_me = self.client.get("/api/auth/me")
        self.assertEqual(res_me.status_code, 200)
        self.assertTrue(res_me.get_json().get("authenticated"))

        # Logout
        res_out = self.client.post("/api/auth/logout")
        self.assertEqual(res_out.status_code, 200)

        # Check /api/auth/me again (should now be unauthenticated)
        res_me_after = self.client.get("/api/auth/me")
        self.assertFalse(res_me_after.get_json().get("authenticated"))

    def test_05_authenticated_academic_workflows(self):
        """Test Doubt Solver, Notes, Quizzes, Planner, and Analytics with authenticated session"""
        with self.app.app_context():
            u = User.query.filter_by(email="academic.student@example.com").first()
            if not u:
                u = User(
                    name="Academic Student",
                    email="academic.student@example.com",
                    student_class="Class 10",
                    preferred_language="English"
                )
                u.set_password("AcademicPass123")
                db.session.add(u)
                db.session.commit()

        # Login
        login_res = self.client.post("/api/auth/login", json={
            "email": "academic.student@example.com",
            "password": "AcademicPass123"
        })
        self.assertEqual(login_res.status_code, 200)

        # 1. Ask Doubt
        doubt_res = self.client.post("/api/tutor/ask", json={
            "question": "What is photosynthesis and why is it important?",
            "subject": "Science",
            "language": "English"
        })
        doubt_data = doubt_res.get_json()
        if doubt_res.status_code == 200:
            self.assertTrue(doubt_data.get("success"))
            self.assertIn("content", doubt_data.get("assistant_message", {}))
        else:
            self.assertEqual(doubt_res.status_code, 503)
            self.assertFalse(doubt_data.get("success"))
            self.assertIn("GEMINI_API_KEY", doubt_data.get("error", ""))
            self.assertNotIn("Identify Given Information", str(doubt_data))

        # 2. Generate and Save Notes
        gen_res = self.client.post("/api/notes/generate", json={
            "subject": "Science",
            "topic": "Newton's Laws of Motion",
            "note_type": "detailed"
        })
        self.assertEqual(gen_res.status_code, 200)
        note_data = gen_res.get_json()["note"]

        save_res = self.client.post("/api/notes", json=note_data)
        self.assertEqual(save_res.status_code, 201)

        # 3. Generate Quiz and Submit Answers
        quiz_gen = self.client.post("/api/quiz/generate", json={
            "subject": "Science",
            "topic": "Cells and Tissues",
            "difficulty": "Medium"
        })
        self.assertEqual(quiz_gen.status_code, 201)
        quiz_data = quiz_gen.get_json()
        quiz_id = quiz_data["quiz_id"]
        questions = quiz_data["questions"]
        self.assertEqual(len(questions), 5)

        # Submit answers
        answers_payload = {str(q["id"]): "A" for q in questions}
        submit_res = self.client.post("/api/quiz/submit", json={
            "quiz_id": quiz_id,
            "answers": answers_payload
        })
        self.assertEqual(submit_res.status_code, 200)
        submit_data = submit_res.get_json()
        self.assertIn("score", submit_data)
        self.assertIn("results", submit_data)

        # 4. Add Study Task
        task_res = self.client.post("/api/planner/tasks", json={
            "title": "Practice Algebra Equations",
            "subject": "Mathematics",
            "duration_minutes": 45,
            "target_date": "2026-10-20"
        })
        self.assertEqual(task_res.status_code, 201)

        # 5. Fetch Analytics
        analytics_res = self.client.get("/api/analytics/summary")
        self.assertEqual(analytics_res.status_code, 200)
        summary = analytics_res.get_json()
        self.assertGreaterEqual(summary["summary"]["total_quizzes"], 1)

if __name__ == "__main__":
    unittest.main()
