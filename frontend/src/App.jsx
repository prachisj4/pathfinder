import { useEffect, useState } from "react";
import LandingPage from "./pages/LandingPage";
import AssessmentPage from "./pages/AssessmentPage";
import ResultsPage from "./pages/ResultsPage";
import DashboardPage from "./pages/DashboardPage";
import { auth } from "./firebase/config";
import { onAuthStateChanged } from "firebase/auth";

export default function App() {
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  const navigate = (p, data = null) => {
    if (data) setResults(data);
    setPage(p);
    window.scrollTo(0, 0);
  };

  if (page === "landing") return <LandingPage user={user} navigate={navigate} />;
  if (page === "assessment") return <AssessmentPage user={user} navigate={navigate} />;
  if (page === "results") return <ResultsPage user={user} results={results} navigate={navigate} />;
  if (page === "dashboard") return <DashboardPage user={user} navigate={navigate} />;
  return <LandingPage user={user} navigate={navigate} />;
}
