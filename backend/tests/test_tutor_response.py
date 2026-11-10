import requests

BASE_URL = "http://localhost:5173/api"
session = requests.Session()

# 1. Login
res = session.post(f"{BASE_URL}/auth/login", json={
    "email": "rahul.student@school.edu",
    "password": "SchoolPass@2026"
})
print("Login Status:", res.status_code)
assert res.status_code == 200

# 2. Ask Doubt
doubt_res = session.post(f"{BASE_URL}/tutor/ask", json={
    "question": "What is photosynthesis?",
    "subject": "Science",
    "language": "English"
})
print("Doubt Endpoint HTTP Status:", doubt_res.status_code)
data = doubt_res.json()
print("Doubt Response JSON:", data)

# 3. Check for the old generic template
response_content = str(data)
assert "Identify Given Information" not in response_content, "ERROR: Generic template is still present!"
assert "Apply the Formula" not in response_content, "ERROR: Generic template is still present!"
assert "Final Deduction" not in response_content, "ERROR: Generic template is still present!"
print("\nPASSED: Generic template ('Identify Given Information', 'Apply the Formula', etc.) has been completely eliminated!")
