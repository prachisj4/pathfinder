from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import os
import json
from dotenv import load_dotenv

# Load env
load_dotenv()

app = Flask(__name__)
CORS(app)

# ── Groq Setup ──────────────────────────────────────────
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ── Firebase Admin Setup ──────────────────────────────────
if not firebase_admin._apps:
    try:
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("✅ Firebase connected")
    except Exception as e:
        print(f"⚠️ Firebase not connected: {e}")
        db = None


def build_prompt(data):
    return f"""
    Analyze this student profile:
    Name: {data.get('name')}, Year: {data.get('year')}, CGPA: {data.get('cgpa')}
    Skills: {', '.join(data.get('skills', []))}
    Interests: {', '.join(data.get('interests', []))}
    Goal: {data.get('goal')}, Work Style: {data.get('workStyle')}

    Return ONLY a JSON object with this EXACT structure:
    {{
      "summary": "Short 2-3 sentence overview.",
      "careers": [
        {{
          "title": "Job Title",
          "matchScore": 95,
          "description": "Why this fits.",
          "keySkills": ["Skill 1", "Skill 2"],
          "avgSalary": "e.g. ₹10-12 LPA",
          "growth": "High/Medium"
        }}
      ],
      "skillsGap": [
        {{
          "skill": "Name of skill",
          "status": "Missing" or "Have",
          "level": 0-100,
          "resource": "Specific course or book name"
        }}
      ],
      "roadmap": [
        {{
          "month": 1,
          "title": "What to learn",
          "description": "How to learn it",
          "resources": ["Link or Tool 1", "Link or Tool 2"]
        }}
      ]
    }}
    """


@app.route("/api/analyze", methods=["POST"])
def analyze():
    data = request.get_json()

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are an AI that ONLY returns valid JSON. No text, no explanation."},
                {"role": "user", "content": build_prompt(data)}
            ],
            temperature=0.5,
            max_tokens=2000
        )

        raw = response.choices[0].message.content.strip()
        print("RAW RESPONSE:", raw)

        # ✅ CLEAN RESPONSE
        if "```" in raw:
            raw = raw.split("```")[1]

        raw = raw.replace("json", "").strip()

        # ✅ SAFE PARSE
        try:
            results = json.loads(raw)
        except:
            print("⚠️ JSON PARSE FAILED")
            results = {
                "summary": raw,
                "careers": [],
                "skillsGap": [],
                "roadmap": []
            }

        # ✅ SAVE TO FIREBASE
        if db:
            db.collection("assessments").add({
                "data": data,
                "results": results,
                "createdAt": datetime.now()
            })

        return jsonify(results)

    except Exception as e:
        print("❌ ERROR:", e)
        return jsonify({"error": str(e)})

@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(debug=True)