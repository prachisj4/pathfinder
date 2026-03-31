from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import os
import json
import time
from dotenv import load_dotenv

# Load env
load_dotenv()

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:5173",
    "http://localhost:3000",
    # Add your production frontend domain here
])

# ── Gemini Setup ──────────────────────────────────────────
gemini_key = os.getenv("GEMINI_API_KEY")
if not gemini_key:
    raise ValueError("❌ GEMINI_API_KEY not found in .env — get one at https://aistudio.google.com/apikey")

client = genai.Client(api_key=gemini_key)
GEMINI_MODEL = "gemini-2.5-flash"
print(f"✅ Gemini connected (model: {GEMINI_MODEL})")


def call_gemini(prompt, max_tokens=8000, temperature=0.7, retries=3):
    """Call Gemini with retry logic for rate limits."""
    for attempt in range(retries):
        try:
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=temperature,
                    max_output_tokens=max_tokens,
                )
            )
            return response.text.strip()
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                wait_time = 2 ** (attempt + 1)  # 2, 4, 8 seconds
                print(f"⏳ Rate limited (attempt {attempt+1}/{retries}), waiting {wait_time}s...")
                time.sleep(wait_time)
                if attempt == retries - 1:
                    raise Exception("Gemini API rate limit exceeded. Please wait a minute and try again.")
            else:
                raise
    raise Exception("Failed after retries")

# ── Firebase Admin Setup ──────────────────────────────────
db = None

if not firebase_admin._apps:
    try:
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("✅ Firebase connected")
    except Exception as e:
        print(f"⚠️ Firebase not connected: {e}")
else:
    db = firestore.client()


# ══════════════════════════════════════════════════════════
# ENDPOINT 1: /api/analyze — Main career analysis
# ══════════════════════════════════════════════════════════

def build_analyze_prompt(data):
    return f"""You are an expert career counselor AI. Analyze this student's profile DEEPLY and provide HIGHLY PERSONALIZED career guidance. This is NOT generic advice — every recommendation must directly reference the student's specific skills, interests, and goals.

STUDENT PROFILE:
- Name: {data.get('name')}
- Year of Study: {data.get('year')}
- CGPA/Percentage: {data.get('cgpa')}
- Current Skills: {', '.join(data.get('skills', []))}
- Interests: {', '.join(data.get('interests', []))}
- Favourite Subjects: {', '.join(data.get('subjects', []))}
- Career Goal: {data.get('goal')}
- Preferred Work Style: {data.get('workStyle')}
- Prior Experience: {data.get('experience', 'None mentioned')}

INSTRUCTIONS:
1. Your "summary" MUST mention the student's name and reference their specific skills/interests. Do NOT be generic.
2. Each career match MUST explain WHY it fits THIS specific student (referencing their skills, subjects, goals).
3. The skillsGap MUST list skills the student HAS (with their estimated proficiency) AND skills they're MISSING for their top career.
4. For EACH skill in skillsGap, provide "subtopics" — a learning path from basic to advanced (3-5 subtopics per skill).
5. The roadmap is a 12-WEEK plan (3 months). Each week must have specific, actionable tasks — NOT vague statements.
6. ALL resource URLs must be REAL and from well-known platforms (youtube.com, coursera.org, freecodecamp.org, kaggle.com, leetcode.com, geeksforgeeks.org, w3schools.com, developer.mozilla.org, docs.python.org, etc.).
7. Each week must include "timeCommitment" (e.g., "8-10 hours") and a clear "outcome" (what the student can DO after this week).

Return a JSON object with this EXACT structure:
{{
  "summary": "2-3 sentence personalized overview mentioning the student by name and referencing their specific skills and goals",
  "careers": [
    {{
      "title": "Specific Job Title",
      "matchScore": 85,
      "description": "2-3 sentences explaining why this career fits THIS student specifically, referencing their skills, interests, and goals",
      "keySkills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
      "avgSalary": "₹X-Y LPA",
      "growth": "High/Medium/Low with brief reason",
      "projectIdea": "A short practical project idea related to this career that the student could build"
    }}
  ],
  "skillsGap": [
    {{
      "skill": "Skill Name",
      "status": "Have or Missing",
      "level": 0-100,
      "resource": "https://real-learning-url.com",
      "subtopics": [
        {{"name": "Basic Concept Name", "difficulty": "basic", "description": "What to learn"}},
        {{"name": "Intermediate Topic", "difficulty": "intermediate", "description": "What to learn"}},
        {{"name": "Advanced Topic", "difficulty": "advanced", "description": "What to learn"}}
      ]
    }}
  ],
  "roadmap": [
    {{
      "week": 1,
      "title": "Specific week title",
      "tasks": ["Specific task 1", "Specific task 2", "Specific task 3"],
      "resources": ["https://real-url-1.com", "https://real-url-2.com"],
      "timeCommitment": "8-10 hours",
      "outcome": "What the student can DO after completing this week"
    }}
  ]
}}

CRITICAL RULES:
- Provide EXACTLY 3 careers
- Provide EXACTLY 8 skills in skillsGap (mix of Have and Missing)
- Provide EXACTLY 12 weeks in roadmap
- Each skill MUST have 3-5 subtopics
- Each week MUST have 3-5 tasks
- ALL URLs must be real — from youtube.com, coursera.org, freecodecamp.org, geeksforgeeks.org, leetcode.com, kaggle.com, w3schools.com, developer.mozilla.org, docs.python.org, etc.
- DO NOT include any text outside the JSON
"""


@app.route("/api/analyze", methods=["POST"])
def analyze():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body is required"}), 400

    required = ["name", "year", "cgpa", "skills", "interests", "goal", "workStyle"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    try:
        raw = call_gemini(build_analyze_prompt(data), max_tokens=8000, temperature=0.7)
        print("RAW RESPONSE (first 500 chars):", raw[:500])

        # Strip markdown formatting if Gemini includes it
        if raw.startswith("```json"):
            raw = raw[7:]
        elif raw.startswith("```"):
            raw = raw[3:]
        if raw.endswith("```"):
            raw = raw[:-3]
        raw = raw.strip()

        # Parse JSON — Gemini with response_mime_type="application/json" guarantees valid JSON
        try:
            results = json.loads(raw)
        except json.JSONDecodeError as e:
            print(f"❌ JSON PARSE FAILED: {e}")
            print(f"   Raw response: {raw[:1000]}")
            return jsonify({"error": "AI returned invalid response. Please try again."}), 500

        # Validate structure
        if not results.get("careers") or not results.get("roadmap"):
            return jsonify({"error": "AI response is incomplete. Please try again."}), 500

        # Save to Firebase
        if db:
            db.collection("assessments").add({
                "uid": data.get("uid"),
                "email": data.get("email"),
                "data": data,
                "results": results,
                "createdAt": datetime.now(),
                "milestones": {}
            })

        return jsonify(results)

    except Exception as e:
        print(f"❌ GEMINI ERROR: {e}")
        error_msg = str(e)
        if "429" in error_msg or "rate limit" in error_msg.lower():
            return jsonify({"error": "Gemini API rate limit exceeded. Please wait a minute and try again."}), 429
        return jsonify({"error": f"AI service error: {error_msg}"}), 500


# ══════════════════════════════════════════════════════════
# ENDPOINT 2: /api/generate-quiz — AI-generated quiz
# ══════════════════════════════════════════════════════════

@app.route("/api/generate-quiz", methods=["POST"])
def generate_quiz():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    topic = data.get("topic", "")
    subtopic = data.get("subtopic", "")
    difficulty = data.get("difficulty", "moderate")

    if not topic:
        return jsonify({"error": "Topic is required"}), 400

    prompt = f"""Generate a quiz for a student learning {topic}.
{"Specific subtopic: " + subtopic if subtopic else "Cover the full topic."}
Difficulty level: {difficulty}

RULES:
- Generate EXACTLY 15 multiple-choice questions
- Each question has exactly 4 options (A, B, C, D)
- "correct" is the 0-based index of the correct option (0=A, 1=B, 2=C, 3=D)
- Difficulty "{difficulty}" means:
  - "easy": Basic concepts, definitions, simple recall
  - "moderate": Application-based, requires understanding
  - "hard": Advanced problem-solving, tricky edge cases, code output prediction
- Each question must have an "explanation" for the correct answer
- Questions should be diverse and test different aspects of the topic
- For programming topics, include code snippets in questions where relevant

Return JSON:
{{
  "topic": "{topic}",
  "subtopic": "{subtopic or 'General'}",
  "difficulty": "{difficulty}",
  "questions": [
    {{
      "id": 1,
      "question": "Clear, specific question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Why this answer is correct"
    }}
  ]
}}
"""

    try:
        raw = call_gemini(prompt, max_tokens=6000, temperature=0.8)
        
        if raw.startswith("```json"):
            raw = raw[7:]
        elif raw.startswith("```"):
            raw = raw[3:]
        if raw.endswith("```"):
            raw = raw[:-3]
        raw = raw.strip()

        results = json.loads(raw)
        return jsonify(results)

    except Exception as e:
        print(f"❌ QUIZ GENERATION ERROR: {e}")
        return jsonify({"error": f"Failed to generate quiz: {str(e)}"}), 500


# ══════════════════════════════════════════════════════════
# ENDPOINT 3: /api/generate-project — Practice project + test cases
# ══════════════════════════════════════════════════════════

@app.route("/api/generate-project", methods=["POST"])
def generate_project():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    career = data.get("career", "Software Developer")
    skill = data.get("skill", "JavaScript")
    level = data.get("level", "beginner")
    language = data.get("language", "javascript")

    prompt = f"""Generate a SHORT, practical coding project for a student pursuing a career as a {career}.
Focus skill: {skill}
Student level: {level}
Programming language: {language}

RULES:
- The project must be completable in 30-60 minutes
- It should be a SINGLE FUNCTION that takes input and returns output
- Provide 5 test cases with clear input and expected output
- The function signature must be exact so test cases can call it
- Keep it simple but industry-relevant
- For JavaScript: the function should be named "solution" and use "function solution(...)"
- For Python: the function should be named "solution" and use "def solution(...):"
- Input and output must be simple types (strings, numbers, arrays) — NOT complex objects
- The starterCode should include the function signature with a comment inside

Return JSON:
{{
  "title": "Short project title",
  "description": "2-3 sentence project description explaining what to build and why it's relevant to {career}",
  "language": "{language}",
  "difficulty": "{level}",
  "functionName": "solution",
  "starterCode": "function solution(param) {{\\n  // Write your code here\\n  \\n}}",
  "testCases": [
    {{
      "id": 1,
      "description": "What this test checks",
      "input": "the exact argument(s) to pass — use JSON format",
      "expectedOutput": "the exact expected return value — use JSON format"
    }}
  ],
  "hints": ["Hint 1 without giving away the answer", "Hint 2"]
}}
"""

    try:
        raw = call_gemini(prompt, max_tokens=4000, temperature=0.7)
        
        if raw.startswith("```json"):
            raw = raw[7:]
        elif raw.startswith("```"):
            raw = raw[3:]
        if raw.endswith("```"):
            raw = raw[:-3]
        raw = raw.strip()

        results = json.loads(raw)
        return jsonify(results)

    except Exception as e:
        print(f"❌ PROJECT GENERATION ERROR: {e}")
        return jsonify({"error": f"Failed to generate project: {str(e)}"}), 500


# ══════════════════════════════════════════════════════════
# HEALTH CHECK
# ══════════════════════════════════════════════════════════

@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "model": GEMINI_MODEL, "provider": "gemini"})


if __name__ == "__main__":
    app.run(debug=True)