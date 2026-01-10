import React, { useEffect } from 'react';
import './NotificationBadge.css';

const NotificationBadge = ({ message, type = 'info', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`notification-badge ${type}`}>
            <div className="notification-content">
                {type === 'success' && <span className="notification-icon">✅</span>}
                {type === 'error' && <span className="notification-icon">⚠️</span>}
                {type === 'info' && <span className="notification-icon">ℹ️</span>}
                <span className="notification-message">{message}</span>
            </div>
            <button className="notification-close" onClick={onClose}>×</button>
        </div>
    );
};

export default NotificationBadge;
