import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Removed import "../components/admin/AdminPanel.css"; as it doesn't exist
import EvaluatorDashboard from "../components/evaluator/EvaluatorDashboard";
import GlobalNavbar from "../components/GlobalNavbar";

export default function EvaluatorPanel() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [evaluatorInfo, setEvaluatorInfo] = useState({ username: "Evaluator" });
  const navigate = useNavigate();

  // Menu items for evaluator panel
  const evaluatorMenuItems = [
    {
      id: "dashboard",
      label: "Evaluation Dashboard",
      active: activeSection === "dashboard",
    },
  ];

  const handleMenuItemClick = (item) => {
    setActiveSection(item.id);
  };

  useEffect(() => {
    fetch("http://localhost:5001/api/user-info", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.role === "evaluator") {
          setEvaluatorInfo({ username: data.username || "Evaluator" });
        }
      })
      .catch((err) => console.error("Error fetching evaluator info:", err));
  }, []);

  return (
    <div className="dashboard-page">
      <GlobalNavbar
        userInfo={
          <>
            Evaluator: <strong>{evaluatorInfo.username}</strong>
          </>
        }
        isEvaluator={true}
        menuItems={evaluatorMenuItems}
        onMenuItemClick={handleMenuItemClick}
      />

      <div
        className="admin-content-full"
        style={{ padding: "20px", width: "100%" }}
      >
        <main className="admin-content-wrapper">
          <header className="admin-header">
            <h1 className="admin-page-title">
              {activeSection === "dashboard" && "Evaluation Dashboard"}
            </h1>
          </header>

          <div className="admin-content-inner">
            {activeSection === "dashboard" && <EvaluatorDashboard />}
          </div>
        </main>
      </div>
    </div>
  );
}
