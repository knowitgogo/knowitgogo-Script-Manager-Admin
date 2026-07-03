import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  UserX,
  Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardCard from "../../dashboard/DashboardCard";
import "../../dashboard/Dashboard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
axios.defaults.withCredentials = true;

function ManagerDashboard({ onSwitchView }) {
  const [stats, setStats] = useState({ totalUsers: 0, disabledUsers: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_URL}/manager/dashboard`, {
          headers: { Accept: "application/json" },
        });
        if (response.data) {
          setStats({
            totalUsers: response.data.totalUsers || 0,
            disabledUsers: response.data.disabledUsers || 0,
          });
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          if (onSwitchView) onSwitchView("login");
          else navigate('/admin/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [onSwitchView, navigate]);

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
        Manager Dashboard
      </h1>

      <div className="dashboard-grid">
        <DashboardCard
          title="Users Overview"
          description="Manage and view all registered users in the system."
          value={stats.totalUsers}
          icon={Users}
          actionLabel="View Users"
          primary={true}
          onClick={() => navigate('/manager/users')}
        />

        <DashboardCard
          title="Disabled Users"
          description="View users that have been disabled."
          value={stats.disabledUsers}
          icon={UserX}
          actionLabel="Manage Users"
          primary={false}
          onClick={() => navigate('/manager/users')}
        />
      </div>
    </div>
  );
}

export default ManagerDashboard;
