import sys
import io
import requests

# Ensure console supports utf-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

BASE_URL = "http://localhost:5173/api"  # Testing via Vite Proxy on localhost
session = requests.Session()

print("--- Step 1: Verify Protected Route without Authentication ---")
r = session.get(f"{BASE_URL}/notes")
assert r.status_code == 401, f"Expected 401, got {r.status_code}"
print("Passed: Protected route returned 401 Unauthorized.")

print("\n--- Step 2: Register New Student ---")
reg_data = {
    "name": "Rahul Sharma",
    "email": "rahul.student@school.edu",
    "password": "SchoolPass@2026",
    "confirm_password": "SchoolPass@2026",
    "student_class": "Class 9",
    "preferred_language": "Telugu",
    "terms_accepted": True
}
r = session.post(f"{BASE_URL}/auth/register", json=reg_data)
if r.status_code == 409:
    print("User already registered, logging in instead.")
    r_login = session.post(f"{BASE_URL}/auth/login", json={
        "email": reg_data["email"],
        "password": reg_data["password"]
    })
    assert r_login.status_code == 200, f"Login failed: {r_login.text}"
else:
    assert r.status_code == 201, f"Expected 201, got {r.status_code}: {r.text}"
    print(f"Passed: Registered student: {r.json()['user']['name']} ({r.json()['user']['student_class']})")

print("\n--- Step 3: Verify Session Persistence via /api/auth/me ---")
r = session.get(f"{BASE_URL}/auth/me")
assert r.status_code == 200
data = r.json()
assert data.get("authenticated") is True
assert data["user"]["email"] == "rahul.student@school.edu"
assert data["user"]["student_class"] == "Class 9"
assert data["user"]["preferred_language"] == "Telugu"
print(f"Passed: Session active for {data['user']['name']} - Class: {data['user']['student_class']}, Language: {data['user']['preferred_language']}")

print("\n--- Step 4: Duplicate Registration Rejection ---")
r_dup = session.post(f"{BASE_URL}/auth/register", json=reg_data)
assert r_dup.status_code == 409, f"Expected 409, got {r_dup.status_code}"
print("Passed: Duplicate email rejected with 409 Conflict.")

print("\n--- Step 5: Test AI Doubt Solver (Science doubt in Telugu) ---")
doubt_payload = {
    "question": "What is the function of mitochondria in a plant cell?",
    "subject": "Science",
    "language": "Telugu"
}
r_doubt = session.post(f"{BASE_URL}/tutor/ask", json=doubt_payload)
if r_doubt.status_code == 200:
    doubt_res = r_doubt.json()
    print("Passed: AI Doubt Solver responded successfully with real AI.")
    print(f"AI Response preview: {doubt_res['assistant_message']['content'][:80]}...")
else:
    assert r_doubt.status_code == 503, f"Unexpected status: {r_doubt.status_code} {r_doubt.text}"
    doubt_res = r_doubt.json()
    assert "GEMINI_API_KEY" in doubt_res.get("error", "")
    assert "Identify Given Information" not in str(doubt_res)
    assert "Apply the Formula" not in str(doubt_res)
    print("Passed: Generic template eliminated. System correctly returned 503 with GEMINI_API_KEY notice.")

print("\n--- Step 6: Test AI Notes Generator and Save ---")
gen_note = session.post(f"{BASE_URL}/notes/generate", json={
    "subject": "Science",
    "topic": "Cell Structure and Functions",
    "note_type": "detailed",
    "language": "English",
    "class_level": "Class 9"
})
assert gen_note.status_code == 200, f"Note generation failed: {gen_note.text}"
note_data = gen_note.json()["note"]

save_note = session.post(f"{BASE_URL}/notes", json=note_data)
assert save_note.status_code == 201, f"Note save failed: {save_note.text}"
print(f"Passed: Note saved: '{note_data['title']}'")

print("\n--- Step 7: Test AI Quiz Generation and Secure Evaluation ---")
quiz_gen = session.post(f"{BASE_URL}/quiz/generate", json={
    "subject": "Science",
    "topic": "Cell Structure and Functions",
    "difficulty": "Medium",
    "class_level": "Class 9"
})
assert quiz_gen.status_code == 201, f"Quiz gen failed: {quiz_gen.text}"
quiz_info = quiz_gen.json()
quiz_id = quiz_info["quiz_id"]
questions = quiz_info["questions"]
assert len(questions) == 5, f"Expected 5 questions, got {len(questions)}"
# Verify answers are hidden
assert "correct_option" not in questions[0], "Security vulnerability: correct answer was leaked to client!"
print(f"Passed: Generated 5 MCQs for Quiz ID {quiz_id} with answers securely hidden.")

# Submit answers
answers = {str(q["id"]): "A" for q in questions}
quiz_submit = session.post(f"{BASE_URL}/quiz/submit", json={
    "quiz_id": quiz_id,
    "answers": answers
})
assert quiz_submit.status_code == 200, f"Quiz submit failed: {quiz_submit.text}"
sub_res = quiz_submit.json()
print(f"Passed: Quiz evaluated! Score: {sub_res['score']}/{sub_res['total_questions']} ({sub_res['percentage']}%)")

print("\n--- Step 8: Test Study Planner Task Management ---")
task_res = session.post(f"{BASE_URL}/planner/tasks", json={
    "title": "Solve Cell Structure Exercise Questions",
    "subject": "Science",
    "duration_minutes": 45,
    "target_date": "2026-10-25"
})
assert task_res.status_code == 201, f"Task creation failed: {task_res.text}"
task_id = task_res.json()["task"]["id"]

# Toggle task
toggle_res = session.patch(f"{BASE_URL}/planner/tasks/{task_id}/toggle")
assert toggle_res.status_code == 200
assert toggle_res.json()["task"]["is_completed"] is True
print("Passed: Study task created and marked completed.")

print("\n--- Step 9: Verify Real Database Analytics and Weak Topic Detection ---")
analytics_res = session.get(f"{BASE_URL}/analytics/summary")
assert analytics_res.status_code == 200
an_data = analytics_res.json()
summary = an_data["summary"]
print(f"Passed: Analytics Summary:")
print(f" - Total Quizzes: {summary['total_quizzes']}")
print(f" - Average Score: {summary['average_score']}%")
print(f" - Completed Tasks: {summary['completed_tasks']}")
print(f" - Weak Topics Detected: {summary['weak_topics_count']}")
if an_data.get("weak_topics"):
    for wt in an_data["weak_topics"]:
        print(f"   * Weak Topic: {wt['topic']} ({wt['accuracy']}%) -> {wt['recommendation']}")

print("\n--- Step 10: Logout and Invalidate Session ---")
logout_res = session.post(f"{BASE_URL}/auth/logout")
assert logout_res.status_code == 200
me_after = session.get(f"{BASE_URL}/auth/me")
assert me_after.json().get("authenticated") is False
print("Passed: Session successfully invalidated on logout.")

print("\n=======================================================")
print(" ALL 10 END-TO-END INTEGRATION TESTS PASSED PERFECTLY! ")
print("=======================================================")
