import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role = "admin" }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      const endpoint =
        role === "student"
          ? "http://localhost:5000/api/check-student-auth"
          : role === "evaluator"
            ? "http://localhost:5000/api/check-evaluator-auth"
            : "http://localhost:5000/api/check-auth";

      try {
        const res = await fetch(endpoint, {
          credentials: "include",
        });
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
      }
    };
    verifyAuth();
  }, [role]);

  if (isAuthenticated === null) {
    return (
      <div style={{ color: "#fff", padding: "20px", textAlign: "center" }}>
        {role === "student"
          ? "Authenticating Session..."
          : role === "evaluator"
            ? "Verifying Evaluator..."
            : "Verifying Access..."}
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirectPath =
      role === "student" ? "/userlogin" :
        role === "evaluator" ? "/evaluator-login" :
          "/admin-login";
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}