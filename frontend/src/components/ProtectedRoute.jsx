import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
  role = "admin",
  redirectTo,
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      let endpoint;
      if (role === "student")
        endpoint = "http://localhost:5000/api/check-student-auth";
      else if (role === "evaluator")
        endpoint = "http://localhost:5000/api/check-evaluator-auth";
      else if (role === "individual")
        endpoint = "http://localhost:5000/api/check-individual-auth";
      else if (role === "team")
        endpoint = "http://localhost:5000/api/check-team-auth";
      else endpoint = "http://localhost:5000/api/check-auth";

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
            : role === "individual"
              ? "Verifying Individual Access..."
              : role === "team"
                ? "Verifying Team Access..."
                : "Verifying Access..."}
      </div>
    );
  }

  if (!isAuthenticated) {
    let defaultRedirect;
    if (role === "student") defaultRedirect = "/userlogin";
    else if (role === "evaluator") defaultRedirect = "/evaluator-login";
    else if (role === "individual") defaultRedirect = "/individual-login";
    else if (role === "team") defaultRedirect = "/team-login";
    else defaultRedirect = "/admin-login";

    return <Navigate to={redirectTo || defaultRedirect} replace />;
  }

  return children;
}
