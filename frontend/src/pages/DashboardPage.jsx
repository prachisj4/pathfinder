import { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs, doc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "../firebase/config";

export default function DashboardPage({ user, navigate }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [milestones, setMilestones] = useState({});

  useEffect(() => {
    if (!user) { navigate("landing"); return; }
    fetchAssessments();
  }, [user]);

  const fetchAssessments = async () => {
    try {
      const q = query(
        collection(db, "assessments"),
        where("uid", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAssessments(data);
      if (data.length > 0) {
        setSelected(data[0]);
        setMilestones(data[0].milestones || {});
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const toggleMilestone = async (month) => {
    if (!selected) return;
    const updated = { ...milestones, [month]: !milestones[month] };
    setMilestones(updated);
    try {
      await updateDoc(doc(db, "assessments", selected.id), { milestones: updated });
    } catch (e) { console.error(e); }
  };

  const completedCount = Object.values(milestones).filter(Boolean).length;
  const totalMonths = selected?.results?.roadmap?.length || 6;
  const progress = Math.round((completedCount / totalMonths) * 100);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("landing");
  };

  if (loading) return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0f", display: "flex",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif", color: "white"
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🧭</div>
        <p style={{ color: "rgba(255,255,255,0.5)" }}>Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0f", color: "#f0f0f0",
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
        .milestone-row:hover { background: rgba(99,102,241,0.08) !important; }
      `}</style>

      {/* Sidebar + Main layout */}
      <div style={{ display: "flex", minHeight: "100vh" }}>

        {/* Sidebar */}
        <div style={{
          width: "240px", background: "rgba(255,255,255,0.02)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          padding: "28px 20px", display: "flex", flexDirection: "column",
          position: "sticky", top: 0, height: "100vh"
        }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: 800, marginBottom: "32px" }}>
            🧭 PathFinder<span style={{ color: "#6366f1" }}>AI</span>
          </div>

          <nav style={{ flex: 1 }}>
            {[
              { icon: "📊", label: "Dashboard", active: true },
              { icon: "✏️", label: "New Assessment", action: () => navigate("assessment") },
              { icon: "🏠", label: "Home", action: () => navigate("landing") },
            ].map((item, i) => (
              <button key={i} onClick={item.action}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  width: "100%", padding: "12px 14px", borderRadius: "10px",
                  background: item.active ? "rgba(99,102,241,0.15)" : "none",
                  border: item.active ? "1px solid rgba(99,102,241,0.25)" : "1px solid transparent",
                  color: item.active ? "#a5b4fc" : "rgba(255,255,255,0.5)",
                  cursor: "pointer", fontSize: "14px", marginBottom: "6px",
                  fontFamily: "'DM Sans', sans-serif", textAlign: "left"
                }}>
                {item.icon} {item.label}
              </button>
            ))}
          </nav>

          {/* User info */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              {user?.photoURL && (
                <img src={user.photoURL} alt="avatar" style={{ width: 32, height: 32, borderRadius: "50%" }} />
              )}
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>{user?.displayName?.split(" ")[0]}</div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{user?.email?.slice(0, 20)}...</div>
              </div>
            </div>
            <button onClick={handleSignOut} style={{
              width: "100%", padding: "10px", borderRadius: "8px",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "13px",
              fontFamily: "'DM Sans', sans-serif"
            }}>Sign Out</button>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: "40px", overflowY: "auto" }}>

          {assessments.length === 0 ? (
            <div style={{ textAlign: "center", paddingTop: "80px" }}>
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>🗺️</div>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "28px", marginBottom: "12px" }}>
                No assessments yet
              </h2>
              <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: "28px" }}>
                Take your first assessment to get a personalized career roadmap
              </p>
              <button onClick={() => navigate("assessment")} style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none",
                color: "white", padding: "14px 32px", borderRadius: "12px",
                cursor: "pointer", fontSize: "15px", fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif"
              }}>
                Start My Assessment →
              </button>
            </div>
          ) : (
            <>
              <h1 style={{
                fontFamily: "'Syne', sans-serif", fontSize: "32px",
                fontWeight: 800, marginBottom: "8px", letterSpacing: "-0.5px"
              }}>
                Welcome back, {user?.displayName?.split(" ")[0]}! 👋
              </h1>
              <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: "36px", fontSize: "15px" }}>
                Track your career progress and milestones
              </p>

              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "36px" }}>
                {[
                  { label: "Assessments Taken", value: assessments.length, color: "#6366f1" },
                  { label: "Roadmap Progress", value: `${progress}%`, color: "#10b981" },
                  { label: "Milestones Done", value: `${completedCount}/${totalMonths}`, color: "#f59e0b" },
                  { label: "Top Career Match", value: selected?.results?.careers?.[0]?.title?.split(" ")?.[0] || "—", color: "#a5b4fc" },
                ].map((stat, i) => (
                  <div key={i} style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "16px", padding: "20px"
                  }}>
                    <div style={{ fontSize: "26px", fontWeight: 700, color: stat.color, fontFamily: "'Syne', sans-serif" }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "4px" }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              {selected && (
                <div style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "16px", padding: "24px", marginBottom: "28px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ fontWeight: 600 }}>Overall Roadmap Progress</span>
                    <span style={{ color: "#10b981", fontWeight: 600 }}>{progress}%</span>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "100px", height: "10px" }}>
                    <div style={{
                      width: `${progress}%`, height: "100%",
                      background: "linear-gradient(90deg, #6366f1, #10b981)",
                      borderRadius: "100px", transition: "width 0.6s ease"
                    }} />
                  </div>
                </div>
              )}

              {/* Milestone tracker */}
              {selected?.results?.roadmap && (
                <div style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "16px", padding: "24px", marginBottom: "28px"
                }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: 700, marginBottom: "20px" }}>
                    📅 6-Month Milestone Tracker
                  </h3>
                  {selected.results.roadmap.map((r, i) => (
                    <div key={i} className="milestone-row" onClick={() => toggleMilestone(r.month)}
                      style={{
                        display: "flex", alignItems: "center", gap: "14px",
                        padding: "14px", borderRadius: "10px", cursor: "pointer",
                        background: milestones[r.month] ? "rgba(16,185,129,0.08)" : "transparent",
                        transition: "background 0.2s",
                        marginBottom: "6px"
                      }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: "6px",
                        border: `2px solid ${milestones[r.month] ? "#10b981" : "rgba(255,255,255,0.2)"}`,
                        background: milestones[r.month] ? "#10b981" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "14px", flexShrink: 0, transition: "all 0.2s"
                      }}>
                        {milestones[r.month] ? "✓" : ""}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontWeight: 500, fontSize: "14px",
                          textDecoration: milestones[r.month] ? "line-through" : "none",
                          color: milestones[r.month] ? "rgba(255,255,255,0.35)" : "white"
                        }}>
                          Month {r.month}: {r.title}
                        </div>
                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>{r.description?.slice(0, 80)}...</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Past assessments */}
              {assessments.length > 1 && (
                <div style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "16px", padding: "24px"
                }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>
                    📁 Past Assessments
                  </h3>
                  {assessments.map((a, i) => (
                    <div key={i} onClick={() => { setSelected(a); setMilestones(a.milestones || {}); }}
                      style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "14px", borderRadius: "10px", cursor: "pointer",
                        background: selected?.id === a.id ? "rgba(99,102,241,0.1)" : "transparent",
                        border: selected?.id === a.id ? "1px solid rgba(99,102,241,0.25)" : "1px solid transparent",
                        marginBottom: "8px", transition: "all 0.2s"
                      }}>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 500 }}>
                          {a.results?.careers?.[0]?.title || "Career Analysis"}
                        </div>
                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
                          {a.createdAt?.toDate?.()?.toLocaleDateString() || "Recent"}
                        </div>
                      </div>
                      <div style={{
                        background: "rgba(99,102,241,0.15)", color: "#a5b4fc",
                        padding: "4px 10px", borderRadius: "6px", fontSize: "12px"
                      }}>
                        {a.results?.careers?.[0]?.matchScore || "--"}% match
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
