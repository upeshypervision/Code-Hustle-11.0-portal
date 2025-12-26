import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/check-auth', {
                    // CRITICAL: Send cookies with request
                    credentials: 'include'
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
    }, []);

    if (isAuthenticated === null) {
        // You can return a spinner here
        return <div style={{ color: '#fff', padding: '20px' }}>Verifying access...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin-login" replace />;
    }

    return children;
}
