import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Pagination from "../Pagination";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
axios.defaults.withCredentials = true;

function Requests() {
  const [requests, setRequests] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async (page = 1) => {
      try {
        const response = await axios.get(`${API_URL}/requests?page=${page}`, {
          headers: { Accept: "application/json" },
        });
        if (response.data) {
          setRequests(response.data.requests || []);
          setAnalytics(response.data.analytics || []);
          if (response.data.pagination) {
            setCurrentPage(response.data.pagination.current_page);
            setLastPage(response.data.pagination.last_page);
          }
        }
      } catch (err) {
        console.error("Failed to load user requests", err);
        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests(currentPage);
  }, [navigate, currentPage]);

  if (isLoading && requests.length === 0) {
    return (
      <div
        className="spinner"
        style={{
          margin: "2rem auto",
          borderColor: "var(--border-color)",
          borderTopColor: "var(--primary-color)",
        }}
      ></div>
    );
  }

  return (
    <div className="admin-card">
      <h2 style={{ margin: "0 0 1.5rem 0", color: "var(--text-main)" }}>
        Token Analytics & Requests
      </h2>

      {/* Analytics Dashboard */}
      <div
        style={{
          marginBottom: "2rem",
          padding: "1.5rem",
          background: "var(--surface-color)",
          borderRadius: "8px",
          border: "1px solid var(--border-color)",
        }}
      >
        <h3 style={{ margin: "0 0 1rem 0", color: "var(--text-main)" }}>
          Most Popular Questions Asked This Week
        </h3>
        {analytics.length === 0 ? (
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            No queries recorded in the last 7 days.
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {analytics.map((item, idx) => (
              <li
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.75rem 0",
                  borderBottom:
                    idx !== analytics.length - 1
                      ? "1px solid var(--border-color)"
                      : "none",
                }}
              >
                <span style={{ color: "var(--text-main)" }}>{item.query}</span>
                <span style={{ color: "var(--primary-color)" }}>
                  {item.count} {item.count === 1 ? "request" : "requests"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <br />
      <hr style={{ opacity: 0.4, borderColor: "var(--border-color)" }} />
      <br />

      <h3 style={{ margin: "0 0 1rem 0", color: "var(--text-main)" }}>
        Recent Requests Log
      </h3>

      <div
        style={{
          background: "var(--bg-color)",
          borderRadius: "12px",
          border: "1px solid var(--border-color)",
          overflow: "hidden"
        }}
      >
        {requests.length === 0 ? (
          <div
            style={{
              padding: "3rem 2rem",
              color: "var(--text-muted)",
              textAlign: "center",
            }}
          >
            No requests found.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table" style={{ width: "100%", margin: 0 }}>
              <thead style={{ background: "var(--surface-color)" }}>
                <tr>
                  <th style={{ textTransform: "uppercase", fontSize: "0.75rem", color: "var(--text-muted)", paddingBottom: "1rem" }}>User</th>
                  <th style={{ textTransform: "uppercase", fontSize: "0.75rem", color: "var(--text-muted)", paddingBottom: "1rem" }}>Token Name</th>
                  <th style={{ textTransform: "uppercase", fontSize: "0.75rem", color: "var(--text-muted)", paddingBottom: "1rem" }}>Query</th>
                  <th style={{ textTransform: "uppercase", fontSize: "0.75rem", color: "var(--text-muted)", paddingBottom: "1rem" }}>Asked at</th>
                </tr>
            </thead>
            <tbody>
              {requests.map((req, idx) => (
                <tr key={req.id || idx}>
                  <td>{req.user ? req.user.name : "Unknown"}</td>
                  <td>{req.token ? req.token.name : "Unknown Token"}</td>
                  <td
                    style={{
                      maxWidth: "200px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {req.query}
                  </td>
                  <td>{new Date(req.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: "1.5rem" }}>
            <Pagination
              currentPage={currentPage}
              lastPage={lastPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default Requests;
