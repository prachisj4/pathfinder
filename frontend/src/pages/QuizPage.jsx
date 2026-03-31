import { useState } from "react";

export default function QuizPage({ user, quizData, navigate }) {
  const [difficulty, setDifficulty] = useState(null); // "easy" | "moderate" | "hard"
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState("");

  const topic = quizData?.topic || "General";
  const subtopics = quizData?.subtopics || [];

  const fetchQuiz = async (diff) => {
    setDifficulty(diff);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, subtopic: selectedSubtopic, difficulty: diff })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error: ${res.status}`);
      }
      const data = await res.json();
      if (!data.questions || data.questions.length === 0) throw new Error("No questions generated");
      setQuestions(data.questions);
      setCurrent(0);
      setAnswers({});
      setShowResults(false);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const selectAnswer = (qId, optIndex) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [qId]: optIndex }));
  };

  const score = questions.reduce((acc, q) => acc + (answers[q.id] === q.correct ? 1 : 0), 0);
  const totalAnswered = Object.keys(answers).length;
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  // ── Difficulty Selection Screen ──
  if (!difficulty || questions.length === 0) {
    return (
      <div style={pageStyle}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <Header navigate={navigate} />
          <h1 style={h1Style}> Quiz: {topic}</h1>
          {selectedSubtopic && <p style={{ color: "#475569", fontSize: "14px", marginBottom: "8px" }}>Subtopic: {selectedSubtopic}</p>}
          <p style={{ color: "#64748b", marginBottom: "32px", fontSize: "15px" }}>
            Test your knowledge with 15 AI-generated questions. Choose your difficulty level:
          </p>

          {/* Subtopic selector */}
          {subtopics.length > 0 && (
            <div style={{ marginBottom: "28px" }}>
              <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "10px" }}>Select a subtopic (optional):</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                <button onClick={() => setSelectedSubtopic("")}
                  style={chipStyle(!selectedSubtopic)}>All Topics</button>
                {subtopics.map((st, i) => (
                  <button key={i} onClick={() => setSelectedSubtopic(st.name)}
                    style={chipStyle(selectedSubtopic === st.name)}>{st.name}</button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "12px", padding: "16px", marginBottom: "24px", color: "#f87171", fontSize: "14px" }}>
               {error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            {[
              { key: "easy", label: "🟢 Easy", desc: "Basic concepts & definitions", color: "#00DFD8" },
              { key: "moderate", label: "🟡 Moderate", desc: "Application & understanding", color: "#F5A623" },
              { key: "hard", label: "🔴 Hard", desc: "Advanced problem-solving", color: "#ef4444" },
            ].map(d => (
              <button key={d.key} onClick={() => fetchQuiz(d.key)} disabled={loading}
                style={{
                  background: "#f8fafc", border: `1px solid ${d.color}30`,
                  borderRadius: "16px", padding: "28px 20px", cursor: loading ? "wait" : "pointer",
                  color: "#ffffff", textAlign: "center", fontFamily: "'Inter', sans-serif",
                  transition: "all 0.2s"
                }}>
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>{d.label.split(" ")[0]}</div>
                <div style={{ fontWeight: 600, fontSize: "16px", marginBottom: "6px", color: d.color }}>{d.label.split(" ")[1]}</div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>{d.desc}</div>
              </button>
            ))}
          </div>

          {loading && (
            <div style={{ textAlign: "center", marginTop: "40px", color: "#64748b" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}></div>
              <p>Generating your personalized quiz...</p>
              <p style={{ fontSize: "12px", color: "#94a3b8" }}>This may take 5-10 seconds</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Results Screen ──
  if (showResults) {
    const weakAreas = questions
      .filter(q => answers[q.id] !== q.correct)
      .map(q => q.question.slice(0, 60) + "...");

    return (
      <div style={pageStyle}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <Header navigate={navigate} />

          <div style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(16,185,129,0.1))",
            border: "1px solid rgba(99,102,241,0.25)", borderRadius: "20px",
            padding: "32px", textAlign: "center", marginBottom: "32px"
          }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>
              {percentage >= 80 ? "" : percentage >= 50 ? "👍" : ""}
            </div>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: "36px", fontWeight: 800, marginBottom: "8px" }}>
              <span style={{ color: percentage >= 80 ? "#00DFD8" : percentage >= 50 ? "#F5A623" : "#ef4444" }}>
                {score}/{questions.length}
              </span>
            </h2>
            <p style={{ color: "#64748b", fontSize: "16px" }}>
              {percentage >= 80 ? "Excellent! You've mastered this topic!" :
               percentage >= 50 ? "Good job! Keep practicing the areas below." :
               "Keep learning! Focus on the weak areas identified below."}
            </p>
            <div style={{ marginTop: "16px", fontSize: "14px" }}>
              <span style={{ color: "#475569" }}>Topic: {topic}</span>
              <span style={{ margin: "0 12px", color: "#cbd5e1" }}>|</span>
              <span style={{ color: difficulty === "easy" ? "#00DFD8" : difficulty === "moderate" ? "#F5A623" : "#ef4444" }}>
                Difficulty: {difficulty}
              </span>
            </div>
          </div>

          {/* Review each question */}
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}> Question Review</h3>
          {questions.map((q, i) => {
            const isCorrect = answers[q.id] === q.correct;
            return (
              <div key={i} style={{
                background: isCorrect ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.06)",
                border: `1px solid ${isCorrect ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
                borderRadius: "12px", padding: "16px", marginBottom: "12px"
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "16px" }}>{isCorrect ? "" : ""}</span>
                  <span style={{ fontSize: "14px", lineHeight: 1.5 }}>{q.question}</span>
                </div>
                <div style={{ marginLeft: "26px", fontSize: "12px" }}>
                  {!isCorrect && answers[q.id] !== undefined && (
                    <div style={{ color: "#ef4444", marginBottom: "4px" }}>Your answer: {q.options[answers[q.id]]}</div>
                  )}
                  <div style={{ color: "#00DFD8", marginBottom: "4px" }}>Correct: {q.options[q.correct]}</div>
                  {q.explanation && <div style={{ color: "#94a3b8", fontStyle: "italic" }}>{q.explanation}</div>}
                </div>
              </div>
            );
          })}

          <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
            <button onClick={() => { setDifficulty(null); setQuestions([]); }} style={btnPri}>🔄 Try Different Difficulty</button>
            <button onClick={() => navigate("results")} style={btnSec}>← Back to Results</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz Taking Screen ──
  const q = questions[current];
  if (!q) return null;

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <Header navigate={navigate} />

        {/* Progress */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", color: "#94a3b8" }}>
              Question {current + 1} of {questions.length}
            </span>
            <span style={{ fontSize: "13px", color: "#FF0080" }}>
              {totalAnswered} answered · {difficulty}
            </span>
          </div>
          <div style={{ background: "#e2e8f0", borderRadius: "100px", height: "6px" }}>
            <div style={{
              width: `${((current + 1) / questions.length) * 100}%`, height: "100%",
              background: "#000000", borderRadius: "100px",
              transition: "width 0.3s ease"
            }} />
          </div>
          {/* Mini question dots */}
          <div style={{ display: "flex", gap: "4px", marginTop: "10px", flexWrap: "wrap" }}>
            {questions.map((qq, i) => (
              <div key={i} onClick={() => setCurrent(i)} style={{
                width: 18, height: 18, borderRadius: "4px", cursor: "pointer",
                fontSize: "9px", display: "flex", alignItems: "center", justifyContent: "center",
                background: i === current ? "#FF0080" :
                  answers[qq.id] !== undefined ? (answers[qq.id] === qq.correct ? "#cbd5e1" : "#e2e8f0") : "#f8fafc",
                border: i === current ? "2px solid #818cf8" : "1px solid #e2e8f0",
                color: "#64748b"
              }}>{i + 1}</div>
            ))}
          </div>
        </div>

        {/* Question */}
        <div style={{
          background: "#f8fafc", border: "1px solid #e2e8f0",
          borderRadius: "20px", padding: "32px", marginBottom: "24px"
        }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, lineHeight: 1.6, marginBottom: "24px" }}>
            {q.question}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {q.options.map((opt, oi) => {
              const selected = answers[q.id] === oi;
              return (
                <button key={oi} onClick={() => selectAnswer(q.id, oi)}
                  style={{
                    background: selected ? "rgba(99,102,241,0.15)" : "#f8fafc",
                    border: selected ? "2px solid #FF0080" : "1px solid #e2e8f0",
                    borderRadius: "12px", padding: "14px 18px", cursor: "pointer",
                    color: selected ? "#475569" : "#334155",
                    fontSize: "14px", textAlign: "left", fontFamily: "'Inter', sans-serif",
                    transition: "all 0.2s", display: "flex", alignItems: "center", gap: "12px"
                  }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                    border: selected ? "2px solid #FF0080" : "2px solid #cbd5e1",
                    background: selected ? "#FF0080" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", fontWeight: 700, color: selected ? "white" : "#94a3b8"
                  }}>{String.fromCharCode(65 + oi)}</div>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
            style={{ ...btnSec, opacity: current === 0 ? 0.3 : 1 }}>← Previous</button>
          {current < questions.length - 1 ? (
            <button onClick={() => setCurrent(c => c + 1)} style={btnPri}>Next →</button>
          ) : (
            <button onClick={() => setShowResults(true)} disabled={totalAnswered < questions.length}
              style={{
                ...btnPri,
                background: totalAnswered >= questions.length
                  ? "#000000"
                  : "#cbd5e1",
                opacity: totalAnswered >= questions.length ? 1 : 0.5
              }}>
               Submit Quiz ({totalAnswered}/{questions.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────
function Header({ navigate }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "20px", fontWeight: 800 }}>
        PathFinder
      </div>
      <button onClick={() => navigate("results")} style={{
        background: "none", border: "none", color: "#94a3b8",
        cursor: "pointer", fontSize: "14px", fontFamily: "'Inter', sans-serif"
      }}>← Back to Results</button>
    </div>
  );
}

const pageStyle = { minHeight: "100vh", background: "#ffffff", color: "#0f172a", fontFamily: "'Inter', sans-serif", padding: "40px 20px" };
const h1Style = { fontFamily: "'Inter', sans-serif", fontSize: "32px", fontWeight: 800, marginBottom: "8px" };
const btnPri = { background: "#000000", border: "none", color: "#ffffff", padding: "12px 24px",
  borderRadius: "12px", cursor: "pointer", fontSize: "14px", fontWeight: 600, fontFamily: "'Inter', sans-serif" };
const btnSec = { background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#ffffff", padding: "12px 24px",
  borderRadius: "12px", cursor: "pointer", fontSize: "14px", fontFamily: "'Inter', sans-serif" };
const chipStyle = (active) => ({
  background: active ? "rgba(99,102,241,0.25)" : "#f8fafc",
  border: active ? "1px solid rgba(99,102,241,0.6)" : "1px solid #e2e8f0",
  color: active ? "#475569" : "#64748b", padding: "6px 14px",
  borderRadius: "100px", cursor: "pointer", fontSize: "13px", fontFamily: "'Inter', sans-serif"
});
