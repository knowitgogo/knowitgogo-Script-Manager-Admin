import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { LogOut } from "lucide-react";
import ThemeToggle from "../ThemeToggle";
import "../admin/AdminLayout.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
axios.defaults.withCredentials = true;

function ManagerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/manager/dashboard`, {
        headers: { Accept: "application/json" },
      })
      .then((res) => {
        setIsAuthenticated(true);
        setUserName(res.data?.manager?.name || "");
      })
      .catch(() => navigate("/admin/login"))
      .finally(() => setIsLoading(false));
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_URL}/manager/logout`,
        {},
        {
          headers: { Accept: "application/json" },
        },
      );
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      navigate("/admin/login");
    }
  };

  const isActive = (path) => (location.pathname === path ? "active" : "");

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "var(--bg-color)",
        }}
      >
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="admin-layout">
      <nav className="admin-navbar">
        <div className="navbar-brand">
          <h2>Manager Panel</h2>
        </div>
        <div className="navbar-links">
          <Link
            to="/manager/dashboard"
            className={`nav-link ${isActive("/manager/dashboard")}`}
          >
            Dashboard
          </Link>
          <Link
            to="/manager/users"
            className={`nav-link ${isActive("/manager/users")}`}
          >
            Users
          </Link>
        </div>
        <div className="nav-actions-container">
          {userName && (
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: "0.875rem",
                marginRight: "0.75rem",
                fontWeight: 500,
              }}
            >
              Hi, {userName}
            </span>
          )}
          <ThemeToggle />
          <button className="nav-logout-btn" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

export default ManagerLayout;
