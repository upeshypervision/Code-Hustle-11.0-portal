import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogin from './pages/AdminLogin';

// Lazy load the AdminPanel
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

import './styles/global.css';
import Register from "./pages/Register.jsx";

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<Register />} />

        <Route path="/admin-login" element={<AdminLogin />} />
        <Route
          path="/admin-panel"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div style={{ color: '#fff', padding: '20px' }}>Loading Console...</div>}>
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
