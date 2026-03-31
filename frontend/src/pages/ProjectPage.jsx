import { useState, useEffect, useRef } from "react";

export default function ProjectPage({ user, projectData, navigate }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [testResults, setTestResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const pyodideRef = useRef(null);
  const textareaRef = useRef(null);

  const career = projectData?.career || "Software Developer";
  const skill = projectData?.skill || "JavaScript";
  const level = projectData?.level || "beginner";

  useEffect(() => {
    fetchProject();
  }, []);

  const fetchProject = async () => {
    setLoading(true);
    setError(null);
    try {
      const lang = skill.toLowerCase().includes("python") ? "python" : "javascript";
      const res = await fetch("/api/generate-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ career, skill, level, language: lang })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error: ${res.status}`);
      }
      const data = await res.json();
      setProject(data);
      setCode(data.starterCode || "");
      setTestResults([]);

      // Load Pyodide for Python projects
      if (data.language === "python") loadPyodide();
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const loadPyodide = async () => {
    if (pyodideRef.current) { setPyodideReady(true); return; }
    try {
      // Load Pyodide script
      if (!window.loadPyodide) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/pyodide.js";
        script.async = true;
        document.head.appendChild(script);
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }
      pyodideRef.current = await window.loadPyodide();
      setPyodideReady(true);
      console.log(" Pyodide loaded");
    } catch (e) {
      console.error("Pyodide load error:", e);
    }
  };

  // ── RUN CODE & TEST ────────────────────────────────────
  const runTests = async () => {
    if (!project) return;
    setRunning(true);
    const results = [];

    for (const tc of project.testCases) {
      try {
        let output;
        if (project.language === "python") {
          output = await runPython(code, tc.input);
        } else {
          output = runJavaScript(code, tc.input);
        }

        // Compare outputs
        const expected = normalizeOutput(tc.expectedOutput);
        const actual = normalizeOutput(output);
        const passed = expected === actual;

        results.push({
          ...tc, passed, actualOutput: output,
          error: null
        });
      } catch (e) {
        results.push({
          ...tc, passed: false, actualOutput: null,
          error: e.message || String(e)
        });
      }
    }

    setTestResults(results);
    setRunning(false);
  };

  const normalizeOutput = (val) => {
    try {
      // Try to parse as JSON for comparison
      const parsed = typeof val === "string" ? JSON.parse(val) : val;
      return JSON.stringify(parsed);
    } catch {
      return String(val).trim();
    }
  };

  // ── JavaScript Execution ───────────────────────────────
  const runJavaScript = (userCode, input) => {
    try {
      // Create isolated function context
      const fn = new Function(`
        ${userCode}
        const __input = ${typeof input === "string" ? input : JSON.stringify(input)};
        const __result = Array.isArray(__input) ? solution(...__input) : solution(__input);
        return __result;
      `);
      const result = fn();
      return JSON.stringify(result);
    } catch (e) {
      throw new Error(`Runtime Error: ${e.message}`);
    }
  };

  // ── Python Execution (Pyodide) ─────────────────────────
  const runPython = async (userCode, input) => {
    if (!pyodideRef.current) throw new Error("Python runtime not loaded yet");
    const pyodide = pyodideRef.current;

    try {
      const inputStr = typeof input === "string" ? input : JSON.stringify(input);
      const fullCode = `
import json

${userCode}

__input = json.loads('${inputStr.replace(/'/g, "\\'")}')
if isinstance(__input, list):
    __result = solution(*__input)
else:
    __result = solution(__input)
json.dumps(__result)
`;
      const result = await pyodide.runPythonAsync(fullCode);
      return result;
    } catch (e) {
      throw new Error(`Python Error: ${e.message}`);
    }
  };

  // ── Handle Tab in textarea ─────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = textareaRef.current;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newCode = code.substring(0, start) + "  " + code.substring(end);
      setCode(newCode);
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 2; }, 0);
    }
  };

  const passedCount = testResults.filter(t => t.passed).length;
  const totalTests = testResults.length;

  // ── Loading State ──
  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <Header navigate={navigate} />
          <div style={{ textAlign: "center", paddingTop: "60px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}></div>
            <p style={{ color: "#64748b" }}>Generating your practice project...</p>
            <p style={{ fontSize: "12px", color: "#94a3b8" }}>Creating test cases and starter code</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageStyle}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <Header navigate={navigate} />
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "12px", padding: "24px", textAlign: "center" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}></div>
            <p style={{ color: "#f87171", marginBottom: "16px" }}>{error}</p>
            <button onClick={fetchProject} style={btnPri}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <Header navigate={navigate} />

        {/* Project Description */}
        <div style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(16,185,129,0.1))",
          border: "1px solid rgba(99,102,241,0.25)", borderRadius: "20px",
          padding: "28px", marginBottom: "24px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "11px", color: "#475569", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
                Practice Project · {project.language} · {project.difficulty}
              </div>
              <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: "26px", fontWeight: 800, marginBottom: "10px" }}>
                 {project.title}
              </h1>
              <p style={{ color: "#475569", fontSize: "14px", lineHeight: 1.7, margin: 0 }}>
                {project.description}
              </p>
            </div>
          </div>
        </div>

        {/* Main layout: Editor + Test Results */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
          {/* Code Editor */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#334155" }}>
                 Code Editor ({project.language})
              </h3>
              {project.language === "python" && !pyodideReady && (
                <span style={{ fontSize: "11px", color: "#F5A623" }}> Loading Python runtime...</span>
              )}
            </div>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck="false"
              style={{
                width: "100%", height: "380px", background: "#1e293b",
                border: "1px solid #cbd5e1", borderRadius: "10px",
                padding: "16px", color: "#f8fafc", fontSize: "13px",
                fontFamily: "'Fira Code', 'Consolas', monospace", lineHeight: 1.6,
                resize: "none", outline: "none", boxSizing: "border-box",
                tabSize: 2
              }}
            />
            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <button onClick={runTests} disabled={running || (project.language === "python" && !pyodideReady)}
                style={{
                  ...btnPri, flex: 1,
                  background: running ? "#cbd5e1" : "#000000",
                  boxShadow: "0 0 20px rgba(16,185,129,0.2)"
                }}>
                {running ? " Running tests..." : " Run Tests"}
              </button>
              <button onClick={() => setCode(project.starterCode || "")} style={{ ...btnSec, padding: "10px 16px" }}>
                🔄 Reset
              </button>
            </div>
          </div>

          {/* Test Results */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#334155" }}> Test Results</h3>
              {totalTests > 0 && (
                <span style={{
                  fontSize: "12px", fontWeight: 600, padding: "3px 10px", borderRadius: "6px",
                  background: passedCount === totalTests ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                  color: passedCount === totalTests ? "#00DFD8" : "#ef4444"
                }}>{passedCount}/{totalTests} passed</span>
              )}
            </div>

            {totalTests === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}></div>
                <p>Write your solution and click "Run Tests"</p>
                <p style={{ fontSize: "12px", marginTop: "8px" }}>{project.testCases?.length || 0} test cases ready</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "400px", overflowY: "auto" }}>
                {testResults.map((t, i) => (
                  <div key={i} style={{
                    background: t.passed ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.06)",
                    border: `1px solid ${t.passed ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
                    borderRadius: "10px", padding: "14px"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <span style={{ fontSize: "16px" }}>{t.passed ? "" : ""}</span>
                      <span style={{ fontWeight: 600, fontSize: "13px" }}>Test {t.id}: {t.description}</span>
                    </div>
                    <div style={{ fontSize: "11px", fontFamily: "monospace", marginLeft: "24px" }}>
                      <div style={{ color: "#94a3b8" }}>Input: <code>{typeof t.input === 'string' ? t.input : JSON.stringify(t.input)}</code></div>
                      <div style={{ color: "#00DFD8" }}>Expected: <code>{typeof t.expectedOutput === 'string' ? t.expectedOutput : JSON.stringify(t.expectedOutput)}</code></div>
                      {t.actualOutput !== null && (
                        <div style={{ color: t.passed ? "#00DFD8" : "#ef4444" }}>
                          Got: <code>{t.actualOutput}</code>
                        </div>
                      )}
                      {t.error && <div style={{ color: "#ef4444" }}>Error: {t.error}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hints */}
        {project.hints && project.hints.length > 0 && (
          <div style={{ ...cardStyle, marginBottom: "24px" }}>
            <button onClick={() => setShowHints(!showHints)} style={{
              background: "none", border: "none", color: "#475569", cursor: "pointer",
              fontSize: "14px", fontFamily: "'Inter', sans-serif", padding: 0
            }}>
               {showHints ? "Hide Hints" : "Show Hints"} ({project.hints.length})
            </button>
            {showHints && (
              <div style={{ marginTop: "12px" }}>
                {project.hints.map((h, i) => (
                  <div key={i} style={{
                    background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)",
                    borderRadius: "8px", padding: "10px 14px", marginBottom: "8px",
                    fontSize: "13px", color: "#475569"
                  }}> {h}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Overall result */}
        {totalTests > 0 && passedCount === totalTests && (
          <div style={{
            background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(99,102,241,0.1))",
            border: "1px solid #cbd5e1", borderRadius: "16px",
            padding: "28px", textAlign: "center", marginBottom: "24px"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}></div>
            <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: "24px", fontWeight: 800, color: "#00DFD8" }}>
              All Tests Passed!
            </h3>
            <p style={{ color: "#64748b", marginTop: "8px" }}>
              Great job! You've completed this practice project successfully.
            </p>
          </div>
        )}

        <button onClick={() => navigate("results")} style={{ ...btnSec, width: "100%" }}>
          ← Back to Results
        </button>
      </div>
    </div>
  );
}

function Header({ navigate }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
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
const cardStyle = { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px" };
const btnPri = { background: "#000000", border: "none", color: "#ffffff", padding: "12px 24px",
  borderRadius: "12px", cursor: "pointer", fontSize: "14px", fontWeight: 600, fontFamily: "'Inter', sans-serif" };
const btnSec = { background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#ffffff", padding: "12px 24px",
  borderRadius: "12px", cursor: "pointer", fontSize: "14px", fontFamily: "'Inter', sans-serif" };
