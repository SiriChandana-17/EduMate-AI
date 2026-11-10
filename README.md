# EduMate AI — Academic AI Assistant for School Students (Classes 6–10)

EduMate AI is a full-stack educational web platform designed specifically for middle and secondary school students in India (Classes 6–10). It provides curriculum-aligned academic assistance in **Mathematics, Science, English, and Social Studies** in both **English and Telugu**, powered by Python Flask, MySQL, React.js (Vite), and AI.

---

## 🔒 Authentication-First Architecture

EduMate AI strictly enforces **Authentication First**:
- When any user opens the website, the **very first screen is the Login and Register page**.
- **No academic content, dashboards, or AI features are visible prior to authentication.**
- Attempting to access protected routes (`/dashboard`, `/ai-tutor`, `/notes`, `/quizzes`, `/study-planner`, `/analytics`) automatically redirects the user to `/login`.
- Authenticated students visiting `/login` or `/register` are automatically redirected to `/dashboard`.
- Sessions are managed server-side using secure HTTP-only cookies and cryptographic password hashing (`scrypt`/`pbkdf2`).

---

## 🌟 Key Features

1. **Authentication First (Split-Screen)**
   - **Desktop Left**: EduMate AI branding, gradient visual badges, feature highlights (AI Doubt Solver, Smart Quizzes, Study Planner).
   - **Desktop Right**: Dynamic card with **Login** (default) and **Register** tabs, show/hide password, form validation, Grade selection (Class 6 to Class 10), and language choice (English / Telugu).
2. **Personalized Student Dashboard**
   - Welcomes the student by name with their class and language badges.
   - Quick-access cards to academic tools.
   - Genuine database-driven progress states (clean empty states for new students instead of fake progress).
   - Active weak-topic alerts recommending immediate revision.
3. **AI Doubt Solver**
   - Step-by-step curriculum explanations for Classes 6–10.
   - Supports English and Telugu seamlessly.
   - Saves conversation history and threads to MySQL.
   - Integrated Speech-to-Text (Mic) and Text-to-Speech (Audio explanation reader).
4. **AI Notes Generator**
   - Generate Short Notes, Detailed Notes, Key Definitions, Formulas & Equations, and Revision Summaries.
   - Search, filter by subject, edit, copy, and download as Markdown (`.md`).
5. **AI Quiz Generator & Secure Evaluation**
   - Generates 5 curriculum-aligned MCQs by class, subject, topic, and difficulty.
   - **Correct answers are kept strictly server-side** to prevent client inspection.
   - Evaluates submissions on the backend and displays instant scores, percentages, and detailed explanation breakdowns.
   - Celebrates passes with confetti animation.
6. **Weak-Topic Detection**
   - Analyzes real student quiz history from MySQL.
   - Automatically flags chapters/topics with average accuracy < 70%.
   - Provides direct actionable recommendations linking to revision notes and targeted practice quizzes.
7. **Study Planner & AI Timetable Suggester**
   - Add study tasks with target exam dates and study durations (Pomodoro, 45m, 60m).
   - Track pending vs completed study sessions.
   - AI timetable suggester provides balanced weekly schedules with active recall tips and breaks.
8. **Learning Analytics**
   - Real interactive charts built with Recharts:
     - Subject-wise average scores (Bar Chart)
     - Score improvement trend over time (Line Chart)
     - Task completion rates and focused minutes logged.

---

## 🛠️ Tech Stack & Directory Structure

- **Frontend**: React 18, Vite, React Router v7, Lucide React, Recharts, Canvas-Confetti
- **Backend**: Python 3.13, Flask, Flask-SQLAlchemy, Flask-CORS, PyMySQL, Cryptography
- **Database**: MySQL / MariaDB (via XAMPP or standalone MySQL Server)
- **AI**: Google Gemini API SDK / REST integration + curriculum engine for Classes 6–10

```
edumate-ai/
├── backend/
│   ├── app/
│   │   ├── models/          # User, Chat, Note, Quiz, StudyTask models
│   │   ├── routes/          # Auth, Tutor, Notes, Quiz, Planner, Analytics blueprints
│   │   ├── services/        # Gemini AI & curriculum prompt engine
│   │   ├── utils/           # @login_required session decorator
│   │   ├── config.py        # Environment settings & MySQL credentials
│   │   └── database.py      # SQLAlchemy initialization
│   ├── tests/
│   │   ├── test_auth_and_academic.py  # Unit test suite
│   │   └── e2e_integration_test.py    # Full-stack e2e integration test
│   ├── requirements.txt
│   ├── run.py
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/      # ProtectedRoute, PublicOnlyRoute
│   │   ├── context/         # AuthContext
│   │   ├── layouts/         # AppLayout with sidebar & student profile
│   │   ├── pages/           # AuthPage, DashboardPage, AiTutorPage, NotesPage, QuizzesPage, etc.
│   │   ├── services/        # api.js fetch client with credentials support
│   │   └── styles/          # index.css design system
│   ├── package.json
│   └── vite.config.js
├── database/
│   ├── schema.sql           # Complete MySQL database DDL
│   └── seed.sql
└── README.md
```

---

## 🚀 Windows Setup and Run Instructions

### 1. Database Setup (MySQL via XAMPP)
Make sure MySQL / MariaDB is running on `localhost:3306`.
If using XAMPP:
1. Start MySQL from XAMPP Control Panel, or run:
   ```cmd
   C:\xampp\mysql\bin\mysqld.exe --defaults-file="C:\xampp\mysql\bin\my.ini" --standalone
   ```
2. The database schema is already applied to `edumate_ai`. To manually import at any time:
   ```powershell
   Get-Content "database\schema.sql" | & "C:\xampp\mysql\bin\mysql.exe" -u root
   ```

### 2. Backend Setup (Flask)
1. Open PowerShell in `edumate-ai/backend`:
   ```powershell
   cd "edumate-ai\backend"
   python -m pip install -r requirements.txt
   ```
2. Configure `.env`:
   ```ini
   PORT=5000
   SECRET_KEY=edumate_ai_super_secret_session_key_2026_xyz!@#
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=root
   MYSQL_PASSWORD=
   MYSQL_DB=edumate_ai
   GEMINI_API_KEY=your_gemini_api_key_optional
   ```
3. Start the Flask server:
   ```powershell
   python run.py
   ```
   Backend runs on `http://127.0.0.1:5000`.

### 3. Frontend Setup (React + Vite)
1. In a new terminal, navigate to `edumate-ai/frontend`:
   ```powershell
   cd "edumate-ai\frontend"
   npm install
   ```
2. Start the Vite development server:
   ```powershell
   npm run dev
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 🧪 Testing Verification

Run the automated backend unit test suite:
```powershell
cd "edumate-ai\backend"
python -m unittest tests/test_auth_and_academic.py
```

Run the end-to-end integration test (tests all 10 student workflows):
```powershell
python tests/e2e_integration_test.py
```
