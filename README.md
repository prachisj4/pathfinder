# 🧭 PathFinder AI
### AI-Powered Personalized Career Path Analyzer for Students

> Built for **IOSC Hackathon 2026** · Indian OpenSource Community · GGSCER, Nashik

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Made with React](https://img.shields.io/badge/Frontend-React-61DAFB)](https://react.dev)
[![Python Flask](https://img.shields.io/badge/Backend-Flask-green)](https://flask.palletsprojects.com)
[![Firebase](https://img.shields.io/badge/Database-Firebase-orange)](https://firebase.google.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)](https://docker.com)

---

## 📌 Problem Statement
**PS-80 — AI-powered Student Career Counselor**

Most engineering students have no clear, personalized guidance on which career path suits them best. Generic online resources don't account for a student's unique skills, academic background, or interests. PathFinder AI solves this by providing data-driven, AI-generated career recommendations with a step-by-step learning roadmap.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 Career Match | Top 3 career paths ranked by AI match score |
| 📊 Skills Gap Analysis | What you have vs. what you need — with progress bars |
| 🗺️ 6-Month Roadmap | Personalized step-by-step learning plan with free resources |
| 📈 Progress Dashboard | Track milestones, mark completions, view history |
| 🔐 Google Auth | One-click sign-in via Firebase Authentication |
| ☁️ Cloud Storage | All assessments saved to Firestore in real-time |
| 🔄 Retake Anytime | Update profile and get fresh recommendations |
| 🐳 Docker Ready | Fully containerized with docker-compose |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** — Component-based UI
- **Vite** — Fast build tool and dev server
- **Firebase SDK** — Auth + Firestore on the client
- **Google Fonts** — DM Sans + Syne typography

### Backend
- **Python 3.11 + Flask** — REST API server
- **OpenAI GPT-4o-mini** — Career analysis and roadmap generation
- **Firebase Admin SDK** — Server-side Firestore writes
- **Gunicorn** — Production WSGI server

### Google / Firebase Technologies *(Evaluation Criteria #2)*
- ✅ **Firebase Authentication** — Google OAuth sign-in
- ✅ **Cloud Firestore** — NoSQL database for assessments & milestones
- ✅ **Firebase Hosting** *(optional deployment target)*

### DevOps
- **Docker + Docker Compose** — Full containerization
- **Vercel** — Frontend deployment
- **Render / Railway** — Backend deployment

---

## 📁 Project Structure

```
pathfinder/
├── frontend/                  # React app
│   ├── src/
│   │   ├── App.jsx            # Root component + routing
│   │   ├── main.jsx           # Entry point
│   │   ├── firebase/
│   │   │   └── config.js      # Firebase initialization
│   │   └── pages/
│   │       ├── LandingPage.jsx    # Home / hero page
│   │       ├── AssessmentPage.jsx # 5-step assessment form
│   │       ├── ResultsPage.jsx    # AI results + roadmap
│   │       └── DashboardPage.jsx  # Progress tracker
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
│
├── backend/                   # Flask API
│   ├── app.py                 # Main server + GPT integration
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml         # Full stack orchestration
├── vercel.json                # Vercel deployment config
├── LICENSE                    # MIT License
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- A Firebase project (free)
- An OpenAI API key (get at platform.openai.com)

---

### Step 1 — Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/pathfinder-ai.git
cd pathfinder-ai
```

---

### Step 2 — Firebase Setup
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project (e.g. `pathfinder-ai`)
3. Enable **Authentication** → Sign-in method → **Google**
4. Create a **Firestore Database** (start in test mode)
5. Go to **Project Settings** → **Your apps** → Add a Web App
6. Copy the config object and paste it into `frontend/src/firebase/config.js`
7. Go to **Project Settings** → **Service Accounts** → Generate new private key
8. Save the downloaded JSON as `backend/serviceAccountKey.json`

---

### Step 3 — Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Run the server
python app.py
# → Running on http://localhost:5000
```

---

### Step 4 — Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
# → Running on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser. ✅

---

## 🐳 Docker Setup (Bonus +5 pts)

Make sure Docker Desktop is installed, then:

```bash
# From the root pathfinder/ directory
# Add your OpenAI key to environment
export OPENAI_API_KEY=your_key_here

# Build and start everything
docker-compose up --build

# Frontend → http://localhost:3000
# Backend  → http://localhost:5000
```

---

## ☁️ Deployment (Bonus +5 pts)

### Frontend → Vercel (Free)
```bash
cd frontend
npm install -g vercel
vercel
# Follow the prompts — it auto-detects Vite
```

### Backend → Render (Free)
1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo → select `backend/` as root
4. Set environment variable: `OPENAI_API_KEY`
5. Start command: `gunicorn app:app`

---

## 🔌 API Reference

### `POST /api/analyze`
Analyzes student profile and returns career recommendations.

**Request Body:**
```json
{
  "name": "Rahul Sharma",
  "year": "3rd Year",
  "cgpa": "7.8",
  "skills": ["Python", "Machine Learning", "Data Analysis"],
  "interests": ["Data Science & AI", "Research & Academia"],
  "subjects": ["Mathematics", "AI/ML", "Statistics"],
  "goal": "Become a data scientist at a product company",
  "workStyle": "Large Company",
  "experience": "Built a sentiment analysis project",
  "uid": "firebase_user_id",
  "email": "rahul@example.com"
}
```

**Response:**
```json
{
  "summary": "Rahul, your strong foundation in Python and ML...",
  "careers": [
    {
      "title": "Data Scientist",
      "matchScore": 91,
      "description": "...",
      "keySkills": ["Python", "ML", "SQL", "Statistics"],
      "avgSalary": "₹8-18 LPA",
      "growth": "High (30% YoY)"
    }
  ],
  "skillsGap": [...],
  "roadmap": [...]
}
```

### `GET /api/health`
Returns server status.

---

## 🗺️ Future Scope

- 🌐 **Regional Language Support** — Hindi, Marathi, Tamil guidance
- 🤝 **Mentor Connect** — Match students with industry professionals
- 🏫 **College-specific Data** — Placement trends from Indian universities
- 💼 **Job Portal Integration** — Direct links to Internshala, LinkedIn
- 📱 **Mobile App** — React Native version for Android/iOS
- 🏆 **Peer Leaderboard** — Gamified learning with milestones
- 🔍 **Resume Builder** — Auto-generate resume based on completed roadmap

---

## 👥 Open Source Contribution

This project is open source under the MIT License. Contributions are welcome!

```bash
# Fork the repo, make changes, then:
git checkout -b feature/your-feature-name
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
# Open a Pull Request
```

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙌 Acknowledgements

- [OpenAI](https://openai.com) — GPT-4o-mini API
- [Firebase](https://firebase.google.com) — Auth + Firestore
- [Indian OpenSource Community](https://indianopensourcecommunity.in) — Hackathon organizers
- [Google for Developers](https://developers.google.com) — Technology sponsor

---

*Built with ❤️ for IOSC Hackathon 2026 · GGSCER, Nashik*
