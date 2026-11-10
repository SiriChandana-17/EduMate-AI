import os
import json
import re
import requests
from pathlib import Path
from flask import current_app
from dotenv import dotenv_values

class AIService:
    @classmethod
    def _get_api_key(cls) -> str:
        """
        Dynamically fetch the Gemini API key from current_app config, os.environ,
        or directly from the .env file if updated during runtime.
        """
        key = None
        try:
            if current_app:
                key = current_app.config.get("GEMINI_API_KEY")
        except Exception:
            pass

        if not key:
            key = os.environ.get("GEMINI_API_KEY")

        if not key or key.strip() == "your_gemini_api_key_here":
            # Attempt to read directly from backend/.env
            env_file = Path(__file__).resolve().parent.parent.parent / ".env"
            if env_file.exists():
                vals = dotenv_values(env_file)
                key = vals.get("GEMINI_API_KEY")

        if key:
            key = key.strip()
            if key == "your_gemini_api_key_here":
                key = ""

        return key or ""

   
    @classmethod
    def _call_gemini(cls, contents, system_instruction: str = "") -> dict:
        """
        Call the Gemini API using supported model candidates.
        Returns:
            {"success": True, "text": "...", "model": "..."}
            or {"success": False, "error": "..."}
        """
        api_key = cls._get_api_key()

        if not api_key:
            return {
                "success": False,
                "error": (
                    "Gemini API is not configured. Add a valid "
                    "GEMINI_API_KEY to backend/.env."
                ),
                "configured": False,
            }

        # Prepare request contents
        if isinstance(contents, str):
            payload_contents = [
                {"parts": [{"text": contents}]}
            ]
        elif isinstance(contents, list):
            payload_contents = contents
        else:
            payload_contents = [
                {"parts": [{"text": str(contents)}]}
            ]

        payload = {
            "contents": payload_contents,
            "generationConfig": {
                "temperature": 0.4,
                "topP": 0.95,
                "maxOutputTokens": 2048,
            },
        }

        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        # Try the configured model first, then current model alternatives.
        env_model = os.environ.get("GEMINI_MODEL", "").strip()

        candidate_models = []
        if env_model:
            candidate_models.append(env_model)

        for model_name in [
            "gemini-3.6-flash",
            "gemini-3-flash",
        ]:
            if model_name not in candidate_models:
                candidate_models.append(model_name)

        last_error = "No available Gemini model succeeded."

        for model_name in candidate_models:
            url = (
                "https://generativelanguage.googleapis.com/"
                f"v1beta/models/{model_name}:generateContent"
            )

            try:
                response = requests.post(
                    url,
                    params={"key": api_key},
                    json=payload,
                    timeout=45,
                )

                if response.status_code == 200:
                    data = response.json()
                    candidates = data.get("candidates", [])

                    if candidates:
                        parts = (
                            candidates[0]
                            .get("content", {})
                            .get("parts", [])
                        )

                        answer = "\n".join(
                            part["text"]
                            for part in parts
                            if isinstance(part.get("text"), str)
                        ).strip()

                        if answer:
                            return {
                                "success": True,
                                "text": answer,
                                "model": model_name,
                            }

                    last_error = (
                        "Gemini returned no text. "
                        "The response may have been blocked or empty."
                    )
                    continue

                if response.status_code == 404:
                    last_error = (
                        f"Model '{model_name}' is unavailable "
                        "for this API key. Trying another model."
                    )
                    continue

                if response.status_code == 400:
                    try:
                        message = response.json().get(
                            "error", {}
                        ).get("message", response.text)
                    except ValueError:
                        message = response.text

                    last_error = (
                        f"Gemini API HTTP 400: {message}"
                    )

                    # Invalid API keys cannot be fixed by changing models.
                    if "api key not valid" in message.lower():
                        return {
                            "success": False,
                            "error": (
                                "Gemini API key is invalid. "
                                "Create a valid key in Google AI Studio "
                                "and update backend/.env."
                            ),
                        }

                    continue

                if response.status_code in (401, 403):
                    return {
                        "success": False,
                        "error": (
                            "Gemini authentication or permission failed. "
                            "Check your API key and API access."
                        ),
                    }

                if response.status_code == 429:
                    return {
                        "success": False,
                        "error": (
                            "Gemini API quota or rate limit exceeded. "
                            "Check your Google AI Studio quota."
                        ),
                    }

                last_error = (
                    f"Gemini API HTTP {response.status_code}: "
                    f"{response.text[:300]}"
                )

            except requests.Timeout:
                last_error = "Gemini API request timed out."

            except requests.RequestException as exc:
                last_error = f"Gemini network error: {exc}"

        return {
            "success": False,
            "error": (
                f"Failed to reach Gemini AI: {last_error} "
                "Check the available models at "
                "https://ai.google.dev/api/models"
            ),
        }


    @classmethod
    def answer_doubt(cls, question: str, subject: str, student_class: str, language: str = "English", history: list = None) -> dict:
        """
        AI Doubt Solver for Classes 6-10 with direct, adaptive explanations in English or Telugu.
        Never returns a fixed generic template. Returns {"success": bool, "text": str} or {"success": False, "error": str}.
        """
        # Improved AI Tutor System Prompt
        sys_prompt = (
            f"You are EduMate AI, a knowledgeable and friendly academic tutor for school students in Classes 6–10.\n\n"
            f"Current Context: Student is in {student_class}. Subject: {subject}. Selected Language: {language}.\n\n"
            "Answer the student's exact question directly. Do not use a fixed template for every question.\n\n"
            "Adapt your answer to the selected class, subject, and language.\n\n"
            "- For definition questions, provide a clear definition and a simple example.\n"
            "- For 'what is' questions, explain what the concept means, how it works, and why it matters when relevant.\n"
            "- For mathematics questions, show the actual calculation and reasoning step by step.\n"
            "- For science questions, explain the real scientific concept using age-appropriate examples.\n"
            "- For English questions, explain grammar, vocabulary, or literature as appropriate.\n"
            "- For Social Studies questions, explain the relevant historical, geographical, or civics concept accurately.\n\n"
            "Use simple English or natural Telugu according to the selected language. Use headings and bullet points only when helpful. Avoid unnecessary sections and generic advice.\n\n"
            "Answer the exact question asked. If the question is ambiguous, ask a brief clarifying question. If you are uncertain, say so rather than inventing facts."
        )

        # Build clean Gemini multi-turn conversation contents
        contents = []
        last_role = None

        if history:
            for msg in history[-8:]:  # Use up to last 8 turns of context
                role = "user" if msg.get("sender") == "user" else "model"
                text = (msg.get("content") or "").strip()
                if not text:
                    continue
                if role == last_role and contents:
                    contents[-1]["parts"].append({"text": text})
                else:
                    contents.append({"role": role, "parts": [{"text": text}]})
                    last_role = role

        # Ensure that the last turn before current question is not "user" to avoid consecutive user turns
        if contents and contents[-1]["role"] == "user":
            contents.append({"role": "model", "parts": [{"text": "Understood. Please ask your question."}]})

        # Append current user question
        contents.append({
            "role": "user",
            "parts": [{"text": question}]
        })

        # Call live Gemini API
        ai_resp = cls._call_gemini(contents=contents, system_instruction=sys_prompt)
        return ai_resp

    @classmethod
    def generate_notes(cls, subject: str, topic: str, class_level: str, note_type: str = "detailed", language: str = "English") -> dict:
        """
        AI Notes Generator: Creates Short notes, Detailed notes, Definitions, Formulas, or Revision summaries.
        """
        sys_prompt = (
            f"You are an expert curriculum textbook author for {class_level}. "
            f"Subject: {subject}. Language: {language}. Note Type: {note_type}. "
            "Create structured study notes formatted in clear Markdown with headings, bullet points, and key takeaways."
        )

        prompt = (
            f"Generate comprehensive academic notes for Topic: '{topic}'.\n"
            f"Type: {note_type}.\n"
            f"Class: {class_level}.\n"
            f"Subject: {subject}.\n"
            f"Language: {language}.\n\n"
            "Include: \n"
            "- Introduction & Core Concept\n"
            "- Key Definitions / Rules / Principles\n"
            "- Important Points & Examples\n"
            "- Quick Revision Summary & Exam Tips\n"
        )

        ai_resp = cls._call_gemini(contents=prompt, system_instruction=sys_prompt)
        title = f"{topic} - {note_type.replace('_', ' ').capitalize()} ({class_level})"

        if ai_resp.get("success"):
            return {"title": title, "content": ai_resp["text"]}

        # Fallback notes generator
        fallback_content = cls._generate_fallback_notes(subject, topic, class_level, note_type, language)
        return {"title": title, "content": fallback_content}

    @classmethod
    def generate_quiz(cls, subject: str, topic: str, class_level: str, difficulty: str = "Medium") -> list:
        """
        AI Quiz Generator: Generates 5 high-quality MCQs by class, subject, topic, difficulty.
        Returns a list of 5 dicts with question, option_a, option_b, option_c, option_d, correct_option, explanation.
        """
        sys_prompt = (
            f"You are a school assessment specialist for {class_level}. "
            "Generate exactly 5 multiple choice questions (MCQs) in JSON format. "
            "Return ONLY a valid JSON array of objects with the exact keys: "
            "'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option' ('A', 'B', 'C', or 'D'), and 'explanation'."
        )

        prompt = (
            f"Topic: {topic}\n"
            f"Subject: {subject}\n"
            f"Class: {class_level}\n"
            f"Difficulty: {difficulty}\n"
            "Generate 5 curriculum-aligned MCQs. Return strictly valid JSON array."
        )

        ai_resp = cls._call_gemini(contents=prompt, system_instruction=sys_prompt)
        if ai_resp.get("success"):
            try:
                raw_text = ai_resp["text"]
                clean_json = raw_text.strip()
                if "```json" in clean_json:
                    clean_json = clean_json.split("```json")[1].split("```")[0].strip()
                elif "```" in clean_json:
                    clean_json = clean_json.split("```")[1].split("```")[0].strip()

                parsed = json.loads(clean_json)
                if isinstance(parsed, list) and len(parsed) >= 1:
                    validated = []
                    for q in parsed[:5]:
                        validated.append({
                            "question_text": str(q.get("question_text", "Sample Question")),
                            "option_a": str(q.get("option_a", "Option A")),
                            "option_b": str(q.get("option_b", "Option B")),
                            "option_c": str(q.get("option_c", "Option C")),
                            "option_d": str(q.get("option_d", "Option D")),
                            "correct_option": str(q.get("correct_option", "A")).upper()[:1],
                            "explanation": str(q.get("explanation", "Correct based on curriculum principles."))
                        })
                    return validated
            except Exception as e:
                print(f"[Quiz Parse Error]: {e}")

        # Fallback quiz generator
        return cls._generate_fallback_quiz(subject, topic, class_level, difficulty)

    @classmethod
    def generate_study_plan(cls, tasks: list, class_level: str, exam_dates: list = None) -> list:
        """
        AI Study Planner Schedule Suggester
        """
        suggestions = []
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

        default_topics = {
            "Mathematics": ["Concept Practice & Formulas", "Problem Solving", "Mock Exercises"],
            "Science": ["Theory & Diagrams", "Experiments & Reactions", "Concept Revision"],
            "English": ["Grammar & Vocabulary", "Reading Comprehension", "Writing Practice"],
            "Social Studies": ["Historical Timelines", "Map Work & Geography", "Civics Concepts"]
        }

        for i, day in enumerate(days):
            subject = ["Mathematics", "Science", "Social Studies", "English"][i % 4]
            topic_list = default_topics.get(subject, ["Core Chapter Review"])
            topic = topic_list[i % len(topic_list)]
            suggestions.append({
                "day": day,
                "subject": subject,
                "focus": f"{topic} ({class_level})",
                "recommended_minutes": 45,
                "break_minutes": 10,
                "revision_tip": "Active recall: Try explaining the topic aloud without looking at your notes for 5 minutes."
            })
        return suggestions

    # ----------------- Fallback Generators for Notes & Quizzes (Doubt fallback completely removed) -----------------
    @staticmethod
    def _generate_fallback_notes(subject: str, topic: str, class_level: str, note_type: str, language: str) -> str:
        if language == "Telugu":
            return (
                f"# {topic} - ముఖ్యమైన స్టడీ నోట్స్ ({class_level} • {subject})\n\n"
                f"## 1. పరిచయం (Introduction)\n"
                f"- **విషయం:** {topic}\n"
                f"- **తరగతి:** {class_level}\n"
                f"- ఈ అధ్యాయం విద్యార్థులకు ప్రాథమిక భావనలను సులభంగా అర్థం చేసుకోవడానికి రూపొందించబడింది.\n\n"
                f"## 2. ముఖ్యమైన నిర్వచనాలు & సూత్రాలు (Key Concepts)\n"
                f"- ఈ అంశంలో కీలకమైన పదాలు మరియు వాటి నిర్వచనాలను బాగా గుర్తుంచుకోవాలి.\n"
                f"- సైన్స్ / గణితం అయితే ప్రధాన సూత్రాలను ప్రత్యేకంగా ప్రాక్టీస్ చేయండి.\n\n"
                f"## 3. పరీక్షల కోసం చిట్కాలు (Exam Tips)\n"
                f"- డయాగ్రమ్స్ మరియు ఉదాహరణలను చక్కగా ప్రాక్టీస్ చేయండి.\n"
                f"- మునుపటి ప్రశ్నపత్రాలను పరిశీలించండి.\n"
            )

        return (
            f"# {topic} — Comprehensive Study Notes\n\n"
            f"**Class:** {class_level} | **Subject:** {subject} | **Format:** {note_type.capitalize()}\n\n"
            f"---\n\n"
            f"## 1. Overview & Core Objective\n"
            f"The study of **{topic}** is an essential unit in the {class_level} {subject} syllabus. "
            f"It builds the analytical foundation for understanding higher-grade topics.\n\n"
            f"## 2. Key Definitions & Concepts\n"
            f"- **Primary Principle:** Understanding the baseline definition and significance in practical terms.\n"
            f"- **Core Elements:** Structure, process, and interactions that define this phenomenon.\n"
            f"- **Application:** How this concept is observed in everyday life and industrial or natural systems.\n\n"
            f"## 3. Important Formulas / Rules\n"
            f"- Always state standard assumptions before applying equations.\n"
            f"- Keep units of measurement consistent throughout calculations.\n\n"
            f"## 4. Quick Revision Summary\n"
            f"- **Rule 1:** Memorize foundational definitions word-for-word for definitions questions.\n"
            f"- **Rule 2:** Label all diagrams neatly with arrows and titles.\n"
            f"- **Rule 3:** Practice at least 3 solved examples before attempting unfamiliar problems.\n"
        )

    @staticmethod
    def _generate_fallback_quiz(subject: str, topic: str, class_level: str, difficulty: str) -> list:
        return [
            {
                "question_text": f"In {class_level} {subject}, what is the primary fundamental principle behind {topic}?",
                "option_a": "It describes the fundamental conservation and balance of the system.",
                "option_b": "It only applies at zero temperature and under artificial conditions.",
                "option_c": "It is completely arbitrary and has no experimental proof.",
                "option_d": "It applies exclusively to non-physical observations.",
                "correct_option": "A",
                "explanation": "Fundamental principles in school curriculum describe conserved properties, balanced systems, or standard rules."
            },
            {
                "question_text": f"Which of the following is the standard unit or representation when analyzing {topic}?",
                "option_a": "SI Base Metric Units",
                "option_b": "Non-standard arbitrary units",
                "option_c": "Percentage without dimensions",
                "option_d": "Imaginary units only",
                "correct_option": "A",
                "explanation": "Standard international (SI) units are mandated across CBSE/State curricula for science and mathematics."
            },
            {
                "question_text": f"When solving problems on {topic} for {class_level}, what should you verify first?",
                "option_a": "The given data, constraints, and required units",
                "option_b": "The final result without reading the premise",
                "option_c": "Guessing Option C directly",
                "option_d": "Ignoring initial conditions",
                "correct_option": "A",
                "explanation": "Good academic practice begins by identifying the given parameters and ensuring consistency of units."
            },
            {
                "question_text": f"Why is studying {topic} critical in practical everyday applications?",
                "option_a": "It enables predicting behavior and designing safe, functional systems.",
                "option_b": "It has no practical relevance to daily life.",
                "option_c": "It is only used for memorization purposes.",
                "option_d": "It replaces the need for logical thinking.",
                "correct_option": "A",
                "explanation": "Science and mathematics topics in school demonstrate real-world behavior and analytical problem solving."
            },
            {
                "question_text": f"What is the most effective study strategy to master {topic} for exams?",
                "option_a": "Solving step-by-step practice problems and revising key definitions",
                "option_b": "Skimming the chapter once the night before",
                "option_c": "Skipping practice questions entirely",
                "option_d": "Memorizing answers without understanding the steps",
                "correct_option": "A",
                "explanation": "Active practice with step-by-step problem solving leads to high conceptual clarity and exam retention."
            }
        ]
