import React, { useEffect, useState } from "react";
import "./App.css";
import LoginModal from "./LoginModal";
import { axios } from "./utils";

const TopNav = ({ user, onLogin, onLogout }) => {
  const [notifications, setNotifications] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const handleLoginClick = () => {
    setShowLogin(true);
  };

  const handleCloseModal = () => {
    setShowLogin(false);
  };

  const notificationFetch = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/notification", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data.notifications);
    } catch (error) {
      alert(error.response.data.error);
    }
  };
  const notificationMarkRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/notification/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await notificationFetch();
    } catch (error) {
      alert(error.response.data.error);
    }
  };

  useEffect(() => {
    notificationFetch();
  }, []);

  return (
    <div className="top-nav">
      <div className="pos-title">
        <h1>POS System</h1> {/* Large title for POS System */}
      </div>
      <div className="user-info">
        {user ? (
          <>
            <span
              className="welcome-notificatin"
              onClick={() => setShowNotif(true)}
            >
              Notification{" "}
            </span>
            <span className="welcome-message">Welcome, {user.UserName}</span>
            <button onClick={onLogout} className="logout-button">
              Logout
            </button>
          </>
        ) : (
          <button onClick={handleLoginClick} className="login-button">
            Login
          </button>
        )}
      </div>
      {showNotif ? (
        <div className="modal">
          <div
            className="modal-overlay"
            onClick={() => setShowNotif(false)}
          ></div>
          <div className="modal-content">
            {notifications.map((notif) => (
              <p style={{ padding: "20px", width: 500 }}>
                <b
                  style={{ cursor: "pointer" }}
                  onClick={() => notificationMarkRead(notif.NotificationID)}
                >
                  {notif.IsRead ? null : "Unread: "}
                </b>
                {notif.Message} -{" "}
                <i>{new Date(notif.CreatedAt).toLocaleString()}</i>
              </p>
            ))}
          </div>
        </div>
      ) : null}
      <LoginModal
        show={showLogin}
        onClose={handleCloseModal}
        onLogin={onLogin}
      />{" "}
      {/* Pass onLogin to LoginModal */}
    </div>
  );
};

export default TopNav;
