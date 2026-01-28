import { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLogin from "./pages/AdminLogin";
import Userlogin from "./pages/StudentLogin.jsx";
import "./styles/global.css";
import Register from "./pages/Register.jsx";
import UserPortal from "./pages/UserPortal.jsx";
import Landing_Page from "./pages/Landing_Page.jsx";
import Incomp_Page from "./components/Incomplete_teams/Incomp_Page.jsx";
import Team_Regi from "./pages/Team_Regi.jsx";
import Indi_Dashboard from "./components/Individual-Member/Indi_Dashboard.jsx";
import AcceptedTeamPage from "./components/Individual-Member/AcceptedTeamPage.jsx";
import Indi_Regi from "./pages/Indi_Regi.jsx";
import Indi_Login from './pages/Indi_Login.jsx';
import TeamLogin from './pages/TeamLogin.jsx';
import EvaluatorLogin from "./pages/EvaluatorLogin";
import EvaluatorPanel from "./pages/EvaluatorPanel";

// Lazy load AdminPanel which includes PaymentValidation
const AdminPanel = lazy(() => import("./pages/AdminPanel"));

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing_Page />} />
        <Route path="/create-team" element={<Team_Regi />} />
        <Route
          path="/indimember"
          element={
            <ProtectedRoute role="individual" redirectTo="/individual-login">
              <Indi_Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accepted-team"
          element={<AcceptedTeamPage />}
        />
        <Route
          path="/team-up"
          element={
            <ProtectedRoute role="team" redirectTo="/team-login">
              <Incomp_Page />
            </ProtectedRoute>
          }
        />
        <Route path="/Indiregi" element={<Indi_Regi />} />
        <Route path="/individual-login" element={<Indi_Login />} />
        <Route path="/team-login" element={<TeamLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/userlogin" element={<Userlogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/evaluator-login" element={<EvaluatorLogin />} />
        <Route
          path="/evaluator-dashboard"
          element={
            <ProtectedRoute role="evaluator">
              <EvaluatorPanel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Arena"
          element={
            <ProtectedRoute role="student">
              <UserPortal />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-panel"
          element={
            <ProtectedRoute role="admin">
              <Suspense
                fallback={
                  <div style={{ color: "#fff", padding: "20px" }}>
                    Loading Console...
                  </div>
                }
              >
                <AdminPanel />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;