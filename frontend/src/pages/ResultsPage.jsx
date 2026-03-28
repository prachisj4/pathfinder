export default function ResultsPage({ user, results, navigate }) {
  if (!results) { navigate("assessment"); return null; }

  const { 
  careers = [], 
  skillsGap = [], 
  roadmap = [], 
  summary = "", 
  formData = {} 
} = results;
  const colors = ["#6366f1", "#10b981", "#f59e0b"];
  const colorsBg = ["rgba(99,102,241,0.12)", "rgba(16,185,129,0.12)", "rgba(245,158,11,0.12)"];
  const colorsBorder = ["rgba(99,102,241,0.3)", "rgba(16,185,129,0.3)", "rgba(245,158,11,0.3)"];

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0f", color: "#f0f0f0",
      fontFamily: "'DM Sans', sans-serif", padding: "40px 20px"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .result-card { animation: fadeUp 0.5s ease forwards; }
        .skill-bar { transition: width 1s ease; }
      `}</style>

      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "48px" }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "20px", fontWeight: 800 }}>
            🧭 PathFinder<span style={{ color: "#6366f1" }}>AI</span>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={() => navigate("dashboard")} style={btnSecondary}>📊 Dashboard</button>
            <button onClick={() => navigate("assessment")} style={btnPrimary}>🔄 Retake</button>
          </div>
        </div>

        {/* Greeting */}
        <div style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(16,185,129,0.1))",
          border: "1px solid rgba(99,102,241,0.25)", borderRadius: "20px",
          padding: "32px", marginBottom: "36px"
        }}>
          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontSize: "32px",
            fontWeight: 800, marginBottom: "12px", letterSpacing: "-0.5px"
          }}>
            Hey {formData.name?.split(" ")[0] || "there"}! 👋 Here's your career analysis
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "16px", lineHeight: 1.7, margin: 0 }}>
            {summary}
          </p>
        </div>

        {/* Top Career Matches */}
        <h2 style={sectionTitle}>🎯 Your Top Career Matches</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "40px" }}>
          {careers.map((c, i) => (
            <div key={i} className="result-card" style={{
              background: colorsBg[i] || "rgba(255,255,255,0.04)",
              border: `1px solid ${colorsBorder[i] || "rgba(255,255,255,0.08)"}`,
              borderRadius: "20px", padding: "28px",
              animationDelay: `${i * 0.1}s`
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <div style={{
                    display: "inline-block", background: colors[i] || "#6366f1",
                    color: "white", borderRadius: "8px", padding: "3px 10px",
                    fontSize: "12px", fontWeight: 600, marginBottom: "8px"
                  }}>#{i + 1} Match</div>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "22px", fontWeight: 700, margin: 0 }}>
                    {c.title}
                  </h3>
                </div>
                <div style={{
                  background: "rgba(0,0,0,0.3)", borderRadius: "12px",
                  padding: "10px 18px", textAlign: "center"
                }}>
                  <div style={{ fontSize: "24px", fontWeight: 700, color: colors[i] || "#6366f1" }}>
                    {c.matchScore}%
                  </div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>match</div>
                </div>
              </div>

              {/* Match score bar */}
              <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "100px", height: "6px", marginBottom: "16px" }}>
                <div style={{
                  width: `${c.matchScore}%`, height: "100%",
                  background: colors[i] || "#6366f1", borderRadius: "100px"
                }} />
              </div>

              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", lineHeight: 1.6, marginBottom: "16px" }}>
                {c.description}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {(c.keySkills || []).map((sk, j) => (
                  <span key={j} style={{
                    background: "rgba(0,0,0,0.3)", border: `1px solid ${colors[i]}40`,
                    color: "rgba(255,255,255,0.7)", padding: "4px 12px",
                    borderRadius: "100px", fontSize: "12px"
                  }}>{sk}</span>
                ))}
              </div>

              {c.avgSalary && (
                <div style={{ marginTop: "14px", color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
                  💼 Avg Salary: <span style={{ color: colors[i], fontWeight: 600 }}>{c.avgSalary}</span>
                  &nbsp;&nbsp;📈 Growth: <span style={{ color: colors[i], fontWeight: 600 }}>{c.growth}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Skills Gap */}
        <h2 style={sectionTitle}>📊 Skills Gap Analysis</h2>
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px", padding: "28px", marginBottom: "40px"
        }}>
          {skillsGap.map((sg, i) => (
            <div key={i} style={{ marginBottom: i < skillsGap.length - 1 ? "20px" : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "14px", fontWeight: 500 }}>{sg.skill}</span>
                <span style={{
                  fontSize: "12px", padding: "2px 10px", borderRadius: "100px",
                  background: sg.status === "Have" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                  color: sg.status === "Have" ? "#10b981" : "#f59e0b"
                }}>{sg.status}</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "100px", height: "8px" }}>
                <div style={{
                  width: `${sg.level}%`, height: "100%",
                  background: sg.status === "Have"
                    ? "linear-gradient(90deg, #10b981, #059669)"
                    : "linear-gradient(90deg, #f59e0b, #d97706)",
                  borderRadius: "100px"
                }} />
              </div>
              {sg.resource && (
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "6px" }}>
                  📚 {sg.resource}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* 6-Month Roadmap */}
        <h2 style={sectionTitle}>🗺️ Your 6-Month Learning Roadmap</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "48px" }}>
          {roadmap.map((r, i) => (
            <div key={i} style={{
              display: "flex", gap: "20px", alignItems: "flex-start",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "16px", padding: "24px"
            }}>
              <div style={{
                minWidth: "52px", height: "52px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                borderRadius: "14px", display: "flex", alignItems: "center",
                justifyContent: "center", flexDirection: "column"
              }}>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>Month</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "16px" }}>{r.month}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: "16px", marginBottom: "6px" }}>{r.title}</div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", lineHeight: 1.6, marginBottom: "10px" }}>
                  {r.description}
                </div>
                {r.resources && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {r.resources.map((res, j) => (
                      <span key={j} style={{
                        background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
                        color: "#a5b4fc", padding: "3px 10px", borderRadius: "6px", fontSize: "12px"
                      }}>🔗 {res}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(16,185,129,0.15))",
          border: "1px solid rgba(99,102,241,0.3)", borderRadius: "20px",
          padding: "36px", textAlign: "center"
        }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "24px", fontWeight: 800, marginBottom: "12px" }}>
            Ready to start your journey? 🚀
          </h3>
          <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "24px", fontSize: "15px" }}>
            Save this roadmap to your dashboard and track your progress over time.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("dashboard")} style={btnPrimary}>
              📊 Go to My Dashboard
            </button>
            <button onClick={() => navigate("assessment")} style={btnSecondary}>
              🔄 Retake Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const sectionTitle = {
  fontFamily: "'Syne', sans-serif", fontSize: "22px", fontWeight: 800,
  marginBottom: "20px", letterSpacing: "-0.3px"
};
const btnPrimary = {
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none",
  color: "white", padding: "12px 24px", borderRadius: "12px",
  cursor: "pointer", fontSize: "14px", fontWeight: 600,
  fontFamily: "'DM Sans', sans-serif"
};
const btnSecondary = {
  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
  color: "white", padding: "12px 24px", borderRadius: "12px",
  cursor: "pointer", fontSize: "14px", fontFamily: "'DM Sans', sans-serif"
};
