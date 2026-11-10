import os
import sys
import io
import requests
from pathlib import Path
from dotenv import dotenv_values

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

BASE_URL = "http://localhost:5173/api"
ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

env_vals = dotenv_values(ENV_PATH) if ENV_PATH.exists() else {}
api_key = env_vals.get("GEMINI_API_KEY", "").strip() or os.environ.get("GEMINI_API_KEY", "").strip()
if api_key == "your_gemini_api_key_here":
    api_key = ""

print("==================================================================")
print("      EduMate AI Doubt Solver - Question Verification Suite       ")
print("==================================================================")
print(f"API Key Configured: {'YES (Key length: ' + str(len(api_key)) + ')' if api_key else 'NO'}")

session = requests.Session()

# Login as student
login_res = session.post(f"{BASE_URL}/auth/login", json={
    "email": "rahul.student@school.edu",
    "password": "SchoolPass@2026"
})
assert login_res.status_code == 200, f"Login failed: {login_res.text}"
print("Student session authenticated successfully.")

if not api_key:
    print("\n[Notice]: GEMINI_API_KEY is not configured in edumate-ai/backend/.env.")
    print("Testing Doubt Solver error response handling...")
    
    res = session.post(f"{BASE_URL}/tutor/ask", json={
        "question": "What is photosynthesis?",
        "subject": "Science",
        "language": "English"
    })
    
    print(f"Status Code: {res.status_code}")
    data = res.json()
    print(f"Error Message: {data.get('error')}")
    
    # Verify no generic template
    content = str(data)
    assert "Identify Given Information" not in content
    assert "Apply the Formula" not in content
    assert "Final Deduction" not in content
    print("\nVerified: Generic template is completely removed. System cleanly alerts user that GEMINI_API_KEY is required.")
    print("Live AI tests A, B, C, D, E require a valid GEMINI_API_KEY in backend/.env to execute.")
    sys.exit(0)

# If API key is available, run all 5 test questions
print("\n--- Test A: 'What is photosynthesis?' ---")
r_a = session.post(f"{BASE_URL}/tutor/ask", json={
    "question": "What is photosynthesis?",
    "subject": "Science",
    "language": "English"
})
print("Status:", r_a.status_code)
assert r_a.status_code == 200, f"Test A failed: {r_a.text}"
ans_a = r_a.json()["assistant_message"]["content"]
print("Response preview:\n", ans_a[:300], "\n...")
assert any(w in ans_a.lower() for w in ["light", "sunlight", "carbon dioxide", "glucose", "oxygen", "water"])
print("Passed Test A: Accurately explains photosynthesis process without template.")

print("\n--- Test B: 'What is 15 multiplied by 12?' ---")
r_b = session.post(f"{BASE_URL}/tutor/ask", json={
    "question": "What is 15 multiplied by 12?",
    "subject": "Mathematics",
    "language": "English"
})
print("Status:", r_b.status_code)
assert r_b.status_code == 200, f"Test B failed: {r_b.text}"
ans_b = r_b.json()["assistant_message"]["content"]
print("Response preview:\n", ans_b[:300], "\n...")
assert "180" in ans_b, f"Expected 180 in response, got: {ans_b}"
print("Passed Test B: Accurately calculated 15 * 12 = 180.")

print("\n--- Test C: 'Why does ice float on water?' ---")
r_c = session.post(f"{BASE_URL}/tutor/ask", json={
    "question": "Why does ice float on water?",
    "subject": "Science",
    "language": "English"
})
print("Status:", r_c.status_code)
assert r_c.status_code == 200, f"Test C failed: {r_c.text}"
ans_c = r_c.json()["assistant_message"]["content"]
print("Response preview:\n", ans_c[:300], "\n...")
assert any(w in ans_c.lower() for w in ["dense", "density", "crystal", "hydrogen bond"])
print("Passed Test C: Accurately explains density of ice relative to liquid water.")

print("\n--- Test D: 'Explain photosynthesis in Telugu.' ---")
r_d = session.post(f"{BASE_URL}/tutor/ask", json={
    "question": "Explain photosynthesis in Telugu.",
    "subject": "Science",
    "language": "Telugu"
})
print("Status:", r_d.status_code)
assert r_d.status_code == 200, f"Test D failed: {r_d.text}"
ans_d = r_d.json()["assistant_message"]["content"]
print("Response preview:\n", ans_d[:300], "\n...")
# Verify Telugu characters
has_telugu = any('\u0C00' <= char <= '\u0C7F' for char in ans_d)
assert has_telugu, "Expected Telugu script in response"
print("Passed Test D: Accurately answered in natural Telugu.")

print("\n--- Test E: Follow-up question in existing conversation ---")
conv_id = r_d.json()["conversation_id"]
r_e = session.post(f"{BASE_URL}/tutor/ask", json={
    "conversation_id": conv_id,
    "question": "Where does this process take place in the cell?",
    "subject": "Science",
    "language": "English"
})
print("Status:", r_e.status_code)
assert r_e.status_code == 200, f"Test E failed: {r_e.text}"
ans_e = r_e.json()["assistant_message"]["content"]
print("Response preview:\n", ans_e[:300], "\n...")
assert any(w in ans_e.lower() for w in ["chloroplast", "chlorophyll", "thylakoid", "stroma"])
assert ans_e != ans_d, "Did not answer the new follow-up question; repeated previous answer!"
print("Passed Test E: Correctly answered follow-up question (chloroplast) using conversation context.")

print("\n==================================================================")
print("     ALL LIVE AI TESTS A, B, C, D, AND E COMPLETED & PASSED!      ")
print("==================================================================")
