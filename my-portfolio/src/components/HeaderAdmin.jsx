import { useState } from "react";

function HeaderAdmin({ notifications = [] }) {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <header className="workspace-topbar">
      <div className="topbar-left-spacer">
        <span className="system-status-indicator">● Core API Connected</span>
      </div>

      <div className="topbar-actions">
        <div className="bell-trigger-wrapper" onClick={() => setShowPopup(!showPopup)}>
          <span className="bell-icon">🔔</span>
          {notifications.length > 0 && (
            <span className="notification-badge-counter">{notifications.length}</span>
          )}
        </div>

        {showPopup && (
          <div className="notification-glass-popup animate-fade">
            <div className="popup-header">
              <h4>Activity Signals</h4>
              <button onClick={() => setShowPopup(false)}>✕</button>
            </div>
            <div className="popup-notification-list">
              {notifications.length === 0 ? (
                <p className="empty-notif-text">No recent visitor trace active.</p>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className="notification-track-item">
                    <div className="track-indicator-dot"></div>
                    <div>
                      <p><strong>New User Encountered</strong></p>
                      <span>Logged on: {new Date(notif.visited_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default HeaderAdmin;
