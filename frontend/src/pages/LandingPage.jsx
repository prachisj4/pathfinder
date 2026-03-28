import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase/config";

export default function LandingPage({ user, navigate }) {
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      color: "#f0f0f0",
      fontFamily: "'DM Sans', sans-serif",
      overflow: "hidden",
      position: "relative"
    }}>
      {/* Animated background orbs */}
      <div style={{
        position: "fixed", top: "-20%", right: "-10%",
        width: "600px", height: "600px",
        background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none", zIndex: 0,
        animation: "float 8s ease-in-out infinite"
      }} />
      <div style={{
        position: "fixed", bottom: "-20%", left: "-10%",
        width: "500px", height: "500px",
        background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none", zIndex: 0,
        animation: "float 10s ease-in-out infinite reverse"
      }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-30px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
        .hero-title { animation: fadeUp 0.8s ease forwards; }
        .hero-sub { animation: fadeUp 0.8s 0.2s ease both; }
        .hero-cta { animation: fadeUp 0.8s 0.4s ease both; }
        .hero-cards { animation: fadeUp 0.8s 0.6s ease both; }
        .glow-btn {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none; color: white; padding: 16px 36px;
          border-radius: 14px; font-size: 17px; font-weight: 600;
          cursor: pointer; transition: all 0.3s;
          box-shadow: 0 0 30px rgba(99,102,241,0.4);
          font-family: 'DM Sans', sans-serif;
        }
        .glow-btn:hover { transform: translateY(-2px); box-shadow: 0 0 50px rgba(99,102,241,0.6); }
        .google-btn {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
          color: white; padding: 14px 28px; border-radius: 12px;
          font-size: 15px; font-weight: 500; cursor: pointer;
          transition: all 0.3s; font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; gap: 10px;
        }
        .google-btn:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.25); }
        .stat-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; padding: 24px;
          text-align: center; flex: 1;
        }
        .feature-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px; padding: 28px 24px;
          transition: all 0.3s;
        }
        .feature-card:hover {
          background: rgba(99,102,241,0.08);
          border-color: rgba(99,102,241,0.3);
          transform: translateY(-4px);
        }
        .nav-link { color: rgba(255,255,255,0.6); text-decoration: none; font-size: 15px; transition: color 0.2s; }
        .nav-link:hover { color: white; }
      `}</style>

      {/* Navbar */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "24px 60px", position: "relative", zIndex: 10,
        borderBottom: "1px solid rgba(255,255,255,0.05)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: 36, height: 36,
            background: "linear-gradient(135deg, #6366f1, #10b981)",
            borderRadius: "10px", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "18px"
          }}>🧭</div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "20px", fontWeight: 800, letterSpacing: "-0.5px" }}>
            PathFinder<span style={{ color: "#6366f1" }}>AI</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
          <a href="#features" className="nav-link">Features</a>
          <a href="#how" className="nav-link">How It Works</a>
          {user ? (
            <button className="glow-btn" style={{ padding: "10px 22px", fontSize: "14px" }}
              onClick={() => navigate("dashboard")}>
              My Dashboard →
            </button>
          ) : (
            <button className="google-btn" onClick={handleGoogle} disabled={loading}>
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        maxWidth: "900px", margin: "0 auto", padding: "80px 40px 60px",
        textAlign: "center", position: "relative", zIndex: 10
      }}>
        <div className="hero-title" style={{
          display: "inline-block", background: "rgba(99,102,241,0.15)",
          border: "1px solid rgba(99,102,241,0.3)", borderRadius: "100px",
          padding: "6px 18px", fontSize: "13px", color: "#a5b4fc",
          letterSpacing: "1px", textTransform: "uppercase", marginBottom: "28px"
        }}>
          🚀 AI-Powered Career Guidance
        </div>

        <h1 className="hero-title" style={{
          fontFamily: "'Syne', sans-serif", fontSize: "clamp(42px, 6vw, 72px)",
          fontWeight: 800, lineHeight: 1.1, margin: "0 0 24px",
          letterSpacing: "-2px"
        }}>
          Discover Your Perfect<br />
          <span style={{
            background: "linear-gradient(135deg, #6366f1 0%, #10b981 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>Career Path</span>
        </h1>

        <p className="hero-sub" style={{
          fontSize: "19px", color: "rgba(255,255,255,0.55)", lineHeight: 1.7,
          maxWidth: "580px", margin: "0 auto 40px"
        }}>
          Tell us about your skills and interests. Our AI analyzes your profile and builds a personalized roadmap to your dream career — with a skills gap analysis and free learning resources.
        </p>

        <div className="hero-cta" style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
          {user ? (
            <>
              <button className="glow-btn" onClick={() => navigate("assessment")}>
                Start My Assessment →
              </button>
              <button className="google-btn" onClick={() => navigate("dashboard")}>
                📊 View Dashboard
              </button>
            </>
          ) : (
            <>
              <button className="glow-btn" onClick={handleGoogle} disabled={loading}>
                {loading ? "Signing in..." : "Get Started Free →"}
              </button>
              <button className="google-btn" onClick={handleGoogle}>
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Sign in with Google
              </button>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="hero-cards" style={{
          display: "flex", gap: "16px", marginTop: "60px", flexWrap: "wrap"
        }}>
          {[
            { num: "100+", label: "Career Paths Mapped" },
            { num: "AI", label: "GPT-Powered Analysis" },
            { num: "Free", label: "Learning Resources" },
            { num: "6mo", label: "Personalized Roadmap" },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div style={{ fontSize: "28px", fontWeight: 700, color: "#a5b4fc", fontFamily: "'Syne', sans-serif" }}>{s.num}</div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div id="features" style={{ maxWidth: "1100px", margin: "0 auto", padding: "60px 40px", position: "relative", zIndex: 10 }}>
        <h2 style={{
          fontFamily: "'Syne', sans-serif", fontSize: "38px", fontWeight: 800,
          textAlign: "center", marginBottom: "48px", letterSpacing: "-1px"
        }}>
          Everything you need to <span style={{ color: "#6366f1" }}>find your path</span>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {[
            { icon: "🎯", title: "Career Match Score", desc: "AI ranks top 3 careers based on your unique skills, interests, and academic background." },
            { icon: "📊", title: "Skills Gap Analysis", desc: "See exactly what skills you have, what's missing, and how to bridge the gap efficiently." },
            { icon: "🗺️", title: "6-Month Roadmap", desc: "Step-by-step personalized learning plan with curated free resources from YouTube & Coursera." },
            { icon: "📈", title: "Progress Dashboard", desc: "Track your milestones, update your profile, and watch your career readiness grow over time." },
            { icon: "🔐", title: "Google Sign-In", desc: "Secure, one-click login with your Google account. Your data is safely stored in Firebase." },
            { icon: "♻️", title: "Retake Anytime", desc: "Your interests evolve. Retake the assessment as you grow and get updated recommendations." },
          ].map((f, i) => (
            <div key={i} className="feature-card">
              <div style={{ fontSize: "32px", marginBottom: "14px" }}>{f.icon}</div>
              <div style={{ fontWeight: 600, fontSize: "17px", marginBottom: "8px" }}>{f.title}</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "14px", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div id="how" style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 40px 80px", position: "relative", zIndex: 10 }}>
        <h2 style={{
          fontFamily: "'Syne', sans-serif", fontSize: "38px", fontWeight: 800,
          textAlign: "center", marginBottom: "48px", letterSpacing: "-1px"
        }}>
          How it works
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {[
            { step: "01", title: "Sign in with Google", desc: "One click, fully secure. Your profile is created automatically." },
            { step: "02", title: "Fill the Assessment", desc: "Tell us your skills, interests, subjects you love, and academic performance." },
            { step: "03", title: "AI Analyzes Your Profile", desc: "GPT-4 processes your inputs and generates a personalized career analysis." },
            { step: "04", title: "Get Your Roadmap", desc: "Receive top career matches, skills gap report, and a 6-month learning plan." },
          ].map((h, i) => (
            <div key={i} style={{
              display: "flex", gap: "24px", alignItems: "flex-start",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "16px", padding: "24px"
            }}>
              <div style={{
                minWidth: "48px", height: "48px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                borderRadius: "12px", display: "flex", alignItems: "center",
                justifyContent: "center", fontFamily: "'Syne', sans-serif",
                fontWeight: 800, fontSize: "16px"
              }}>{h.step}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "17px", marginBottom: "6px" }}>{h.title}</div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "14px", lineHeight: 1.6 }}>{h.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "48px" }}>
          {user ? (
            <button className="glow-btn" onClick={() => navigate("assessment")}>
              Start My Assessment →
            </button>
          ) : (
            <button className="glow-btn" onClick={handleGoogle} disabled={loading}>
              {loading ? "Signing in..." : "Get Started Free →"}
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "24px 60px", textAlign: "center",
        color: "rgba(255,255,255,0.25)", fontSize: "13px", position: "relative", zIndex: 10
      }}>
        PathFinder AI · Built for IOSC Hackathon 2026 · Open Source · MIT License
      </footer>
    </div>
  );
}
