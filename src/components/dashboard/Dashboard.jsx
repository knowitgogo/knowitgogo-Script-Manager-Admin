import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Activity,
  Users,
  Key,
  FileText,
  Settings,
  UserPlus,
  LogOut,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardCard from "./DashboardCard";
import "./Dashboard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
axios.defaults.withCredentials = true;

function Dashboard({ onSwitchView }) {
  const [stats, setStats] = useState({ totalUsers: 0, totalTokens: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/dashboard`, {
          headers: { Accept: "application/json" },
        });
        if (response.data) {
          setStats({
            totalUsers: response.data.totalUsers || 0,
            totalTokens: response.data.totalTokens || 0,
          });
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          onSwitchView("login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [onSwitchView]);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_URL}/admin/logout`,
        {},
        {
          headers: { Accept: "application/json" },
        },
      );
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      onSwitchView("login");
    }
  };

  if (isLoading) {
    return (
      <div
        className="dashboard-layout"
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <div className="spinner" style={{ width: 40, height: 40 }}></div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 600,
          margin: "0 0 2rem 0",
          color: "white",
        }}
      >
        Admin Dashboard
      </h1>

      <div className="dashboard-grid">
        <DashboardCard
          title="System Status"
          description="View the current status of all backend services and APIs."
          icon={Activity}
          actionLabel="View Status"
          primary={true}
          onClick={() => navigate('/admin/status')}
        />

        <DashboardCard
          title="Users Overview"
          description="Manage and view all registered users in the system."
          value={stats.totalUsers}
          icon={Users}
          actionLabel="View Users"
          primary={true}
          onClick={() => navigate('/admin/users')}
        />

        <DashboardCard
          title="Token Management"
          description="Manage API tokens assigned to users and services."
          value={stats.totalTokens}
          icon={Key}
          actionLabel="View Tokens"
          primary={false}
          onClick={() => navigate('/admin/tokens')}
        />

        <DashboardCard
          title="Generate Token"
          description="Create a new secure API token for system access."
          icon={CheckCircle}
          actionLabel="Generate Token"
          primary={true}
          onClick={() => navigate('/admin/tokens?generate=true')}
        />

        <DashboardCard
          title="Create Manager"
          description="Provision a new manager account with restricted privileges."
          icon={UserPlus}
          actionLabel="Create Manager"
          primary={true}
          onClick={() => navigate('/admin/managers')}
        />
      </div>
    </div>
  );
}

export default Dashboard;
