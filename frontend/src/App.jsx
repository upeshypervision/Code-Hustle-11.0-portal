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
import Teamup from "./pages/Teamup.jsx";
import TeamUpPage from "./components/Incomplete_teams/teamuppage.jsx";
import CreateTeam from "./pages/CreateTeam.jsx";
import JoinTeam from "./pages/JoinTeam.jsx";


const AdminPanel = lazy(() => import("./pages/AdminPanel"));

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Teamup />} />
        <Route path="/create-team" element={<CreateTeam />} />
<<<<<<< HEAD
        <Route path="/team-up" element={<TeamUpPage />} />
=======
        <Route path="/join" element={<JoinTeam />} />
>>>>>>> main
        <Route path="/register" element={<Register />} />
        <Route path="/userlogin" element={<Userlogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />

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
