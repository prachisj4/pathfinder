import { useEffect, useState } from "react";
import LandingPage from "./pages/LandingPage";
import AssessmentPage from "./pages/AssessmentPage";
import ResultsPage from "./pages/ResultsPage";
import DashboardPage from "./pages/DashboardPage";
import QuizPage from "./pages/QuizPage";
import ProjectPage from "./pages/ProjectPage";
import { auth } from "./firebase/config";
import { onAuthStateChanged } from "firebase/auth";

export default function App() {
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);
  const [results, setResults] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [projectData, setProjectData] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  const navigate = (p, data = null) => {
    if (p === "results" && data) setResults(data);
    if (p === "quiz" && data) setQuizData(data);
    if (p === "project" && data) setProjectData(data);
    setPage(p);
    window.scrollTo(0, 0);
  };

  if (page === "landing") return <LandingPage user={user} navigate={navigate} />;
  if (page === "assessment") return <AssessmentPage user={user} navigate={navigate} />;
  if (page === "results") return <ResultsPage user={user} results={results} navigate={navigate} />;
  if (page === "dashboard") return <DashboardPage user={user} navigate={navigate} />;
  if (page === "quiz") return <QuizPage user={user} quizData={quizData} navigate={navigate} />;
  if (page === "project") return <ProjectPage user={user} projectData={projectData} navigate={navigate} />;
  return <LandingPage user={user} navigate={navigate} />;
}
