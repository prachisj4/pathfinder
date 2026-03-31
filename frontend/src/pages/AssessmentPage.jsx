import { useState } from "react";

const SKILLS = ["Python","JavaScript","Java","C/C++","HTML/CSS","React","Machine Learning","Data Analysis","Problem Solving","Communication","Leadership","Design","Mathematics","Statistics","Networking","Databases","Cloud Computing","Mobile Dev","DevOps","Research"];
const INTERESTS = ["Software Development","Data Science & AI","Cybersecurity","Web Development","Game Development","Robotics & IoT","Business & Entrepreneurship","UI/UX Design","Cloud & DevOps","Research & Academia","Mobile Apps","Blockchain","Digital Marketing","Product Management","Embedded Systems"];
const SUBJECTS = ["Mathematics","Physics","Computer Science","Electronics","Data Structures","Algorithms","Operating Systems","DBMS","Networking","Compiler Design","Software Engineering","AI/ML","Web Technologies","Microprocessors","Control Systems"];

export default function AssessmentPage({ user, navigate }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.displayName || "",
    year: "",
    cgpa: "",
    skills: [],
    interests: [],
    subjects: [],
    goal: "",
    workStyle: "",
    experience: ""
  });

  const toggle = (field, val) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(val) ? f[field].filter(x => x !== val) : [...f[field], val]
    }));
  };

  const steps = [
    {
      title: "About You",
      subtitle: "Let's start with the basics",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={labelStyle}>Your Name</label>
            <input style={inputStyle} value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Rahul Sharma" />
          </div>
          <div>
            <label style={labelStyle}>Current Year of Study</label>
            <select style={inputStyle} value={form.year}
              onChange={e => setForm(f => ({ ...f, year: e.target.value }))}>
              <option value="">Select year</option>
              <option>1st Year</option><option>2nd Year</option>
              <option>3rd Year</option><option>4th Year</option>
              <option>Recently Graduated</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Current CGPA / Percentage</label>
            <input style={inputStyle} value={form.cgpa}
              onChange={e => setForm(f => ({ ...f, cgpa: e.target.value }))}
              placeholder="e.g. 7.8 or 78%" />
          </div>
          <div>
            <label style={labelStyle}>Any prior experience? (internships, projects, etc.)</label>
            <textarea style={{ ...inputStyle, height: "90px", resize: "none" }}
              value={form.experience}
              onChange={e => setForm(f => ({ ...f, experience: e.target.value }))}
              placeholder="e.g. Built a todo app, did a 1-month internship at XYZ..." />
          </div>
        </div>
      )
    },
    {
      title: "Your Skills",
      subtitle: "Select all the skills you have (even basic ones count!)",
      content: (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {SKILLS.map(s => (
            <button key={s} onClick={() => toggle("skills", s)}
              style={chipStyle(form.skills.includes(s))}>
              {s}
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Your Interests",
      subtitle: "What excites you? Pick everything that appeals to you",
      content: (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {INTERESTS.map(s => (
            <button key={s} onClick={() => toggle("interests", s)}
              style={chipStyle(form.interests.includes(s))}>
              {s}
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Favourite Subjects",
      subtitle: "Which subjects do you enjoy the most in your course?",
      content: (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {SUBJECTS.map(s => (
            <button key={s} onClick={() => toggle("subjects", s)}
              style={chipStyle(form.subjects.includes(s))}>
              {s}
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Your Goals & Style",
      subtitle: "Help us understand what kind of career environment suits you",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={labelStyle}>What is your primary career goal?</label>
            <textarea style={{ ...inputStyle, height: "90px", resize: "none" }}
              value={form.goal}
              onChange={e => setForm(f => ({ ...f, goal: e.target.value }))}
              placeholder="e.g. I want to become a software engineer at a product company, or start my own startup..." />
          </div>
          <div>
            <label style={labelStyle}>Preferred work style</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "8px" }}>
              {["Remote / Freelance", "Office / Team", "Startup Environment", "Large Company", "Research / Academia", "Own Business"].map(w => (
                <button key={w} onClick={() => setForm(f => ({ ...f, workStyle: w }))}
                  style={chipStyle(form.workStyle === w)}>
                  {w}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    }
  ];

  const canProceed = () => {
    if (step === 0) return form.name && form.year && form.cgpa;
    if (step === 1) return form.skills.length > 0;
    if (step === 2) return form.interests.length > 0;
    if (step === 3) return form.subjects.length > 0;
    if (step === 4) return form.goal && form.workStyle;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
     const res = await fetch("http://127.0.0.1:5000/api/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ...form, uid: user?.uid, email: user?.email })
});

console.log("STATUS:", res.status);

const data = await res.json();
console.log("DATA:", data);

navigate("results", { ...data, formData: form });
    } catch (e) {
      console.error(e);
      alert("Something went wrong. Please check your backend is running.");
    }
    setLoading(false);
  };

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div style={{
      minHeight: "100vh", background: "#020617", color: "#f0f0f0",
      fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "40px 20px"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
      `}</style>

      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "20px", fontWeight: 800 }}>
            🧭 PathFinder<span style={{ color: "#FF0080" }}>AI</span>
          </div>
          <button onClick={() => navigate("landing")} style={{
            background: "none", border: "none", color: "rgba(255,255,255,0.4)",
            cursor: "pointer", fontSize: "14px"
          }}>← Back</button>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: "36px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
              Step {step + 1} of {steps.length}
            </span>
            <span style={{ fontSize: "13px", color: "#FF0080" }}>{Math.round(progress)}% complete</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: "100px", height: "6px" }}>
            <div style={{
              width: `${progress}%`, height: "100%",
              background: "linear-gradient(90deg, #FF0080, #00DFD8)",
              borderRadius: "100px", transition: "width 0.4s ease"
            }} />
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            {steps.map((s, i) => (
              <div key={i} style={{
                flex: 1, height: "4px", borderRadius: "2px",
                background: i <= step ? "#FF0080" : "rgba(255,255,255,0.12)",
                transition: "background 0.3s"
              }} />
            ))}
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "24px", padding: "40px"
        }}>
          <h2 style={{
            fontFamily: "'Outfit', sans-serif", fontSize: "28px",
            fontWeight: 800, marginBottom: "8px", letterSpacing: "-0.5px"
          }}>{steps[step].title}</h2>
          <p style={{ color: "rgba(255,255,255,0.45)", marginBottom: "32px", fontSize: "15px" }}>
            {steps[step].subtitle}
          </p>
          {steps[step].content}
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px" }}>
          <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
            style={{
              background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.1)",
              color: step === 0 ? "rgba(255,255,255,0.2)" : "white",
              padding: "14px 28px", borderRadius: "12px", cursor: step === 0 ? "default" : "pointer",
              fontSize: "15px", fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}>
            ← Previous
          </button>
          {step < steps.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}
              style={{
                background: canProceed() ? "linear-gradient(135deg, #FF0080, #7928CA)" : "rgba(99,102,241,0.3)",
                border: "none", color: "white", padding: "14px 32px",
                borderRadius: "12px", cursor: canProceed() ? "pointer" : "default",
                fontSize: "15px", fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif"
              }}>
              Next →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={!canProceed() || loading}
              style={{
                background: canProceed() && !loading ? "linear-gradient(135deg, #00DFD8, #06b6d4)" : "rgba(16,185,129,0.3)",
                border: "none", color: "white", padding: "14px 32px",
                borderRadius: "12px", cursor: canProceed() && !loading ? "pointer" : "default",
                fontSize: "15px", fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif",
                boxShadow: "0 0 40px rgba(0, 223, 216, 0.4)"
              }}>
              {loading ? "🔮 Analyzing your profile..." : "✨ Get My Career Roadmap"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block", fontSize: "14px", color: "rgba(255,255,255,0.6)",
  marginBottom: "8px", fontWeight: 500
};
const inputStyle = {
  width: "100%", background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px",
  padding: "12px 16px", color: "white", fontSize: "15px",
  fontFamily: "'Plus Jakarta Sans', sans-serif", outline: "none", boxSizing: "border-box"
};
const chipStyle = (active) => ({
  background: active ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.05)",
  border: active ? "1px solid rgba(99,102,241,0.6)" : "1px solid rgba(255,255,255,0.12)",
  color: active ? "#fbcfe8" : "rgba(255,255,255,0.6)",
  padding: "8px 16px", borderRadius: "100px", cursor: "pointer",
  fontSize: "14px", transition: "all 0.2s", fontFamily: "'Plus Jakarta Sans', sans-serif"
});
