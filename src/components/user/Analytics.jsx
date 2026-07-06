import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
axios.defaults.withCredentials = true;

/* ── Custom Tooltip ────────────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const count = payload[0].value;
  return (
    <div style={{
      background: "var(--surface-color, #1e1e2e)",
      border: "1.5px solid #6c63ff",
      borderRadius: "10px",
      padding: "0.6rem 1rem",
      boxShadow: "0 4px 24px rgba(108,99,255,0.25)",
    }}>
      <p style={{ margin: 0, fontSize: "0.78rem", color: "#a0a0b8" }}>{label}</p>
      <p style={{ margin: "0.25rem 0 0", fontSize: "1.1rem", fontWeight: 800, color: "#6c63ff" }}>
        {count} {count === 1 ? "request" : "requests"}
      </p>
    </div>
  );
}

/* ── Custom X-axis tick (rotated date labels) ──────────────────────────── */
function CustomXTick({ x, y, payload }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        transform="rotate(-35)"
        textAnchor="end"
        dx={-4}
        dy={4}
        fontSize={10}
        fill="var(--text-muted, #888)"
        fontFamily="Inter, sans-serif"
      >
        {payload.value}
      </text>
    </g>
  );
}

/* ── Main Analytics Page ───────────────────────────────────────────────── */
function Analytics() {
  const [activity, setActivity] = useState([]);
  const [total, setTotal] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API_URL}/analytics`, { headers: { Accept: "application/json" } })
      .then((res) => {
        // Format dates for display on X-axis
        const formatted = (res.data.activity || []).map((d) => ({
          ...d,
          label: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
        }));
        setActivity(formatted);
        setTotal(res.data.total || 0);
      })
      .catch((err) => {
        if (err.response && [401, 403].includes(err.response.status))
          navigate("/login");
      })
      .finally(() => setIsLoading(false));
  }, [navigate]);

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <div className="spinner" style={{ borderTopColor: "#6c63ff" }} />
      </div>
    );
  }

  const peak = activity.reduce(
    (a, b) => (b.count > a.count ? b : a),
    { count: 0, label: "" }
  );
  const activeDays = activity.filter((d) => d.count > 0).length;
  const avg = total > 0 ? (total / (activeDays || 1)).toFixed(1) : "0";

  return (
    <div>
      {/* ── Page Header ── */}
      <div style={{
        marginBottom: "1.5rem",
        paddingBottom: "1rem",
        borderBottom: "1px solid var(--border-color)",
      }}>
        <h2 style={{ margin: 0, fontSize: "1.4rem", color: "var(--text-main)", fontWeight: 700 }}>
          Organization Usage
        </h2>
        <p style={{ margin: "0.3rem 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
          View your request activity over the last 30 days &middot;{" "}
          <span style={{ fontStyle: "italic" }}>
            Data may be delayed up to a few minutes
          </span>
        </p>
      </div>

      {/* ── Tab bar ── */}
      <div style={{
        display: "flex",
        marginBottom: "1.5rem",
        borderBottom: "2px solid var(--border-color)",
      }}>
        <button style={{
          background: "none",
          border: "none",
          padding: "0.6rem 1.2rem",
          cursor: "pointer",
          fontSize: "0.9rem",
          fontWeight: 700,
          color: "#6c63ff",
          borderBottom: "2px solid #6c63ff",
          marginBottom: "-2px",
          fontFamily: "Inter, sans-serif",
        }}>
          Activity
        </button>
      </div>

      {/* ── Summary Cards ── */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {[
          { label: "Total Requests (30d)", value: total,  accent: "#6c63ff" },
          { label: "Peak Day",             value: peak.count ? `${peak.count} on ${peak.label}` : "—", accent: "#3b82f6" },
          { label: "Avg per Active Day",   value: avg,    accent: "#10b981" },
        ].map((card, i) => (
          <div key={i} style={{
            flex: "1 1 160px",
            padding: "1rem 1.25rem",
            background: "var(--surface-color)",
            border: "1px solid var(--border-color)",
            borderRadius: "10px",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0,
              width: "3px", height: "100%",
              background: card.accent, borderRadius: "10px 0 0 10px",
            }} />
            <div style={{
              fontSize: "0.72rem", color: "var(--text-muted)",
              marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em",
            }}>
              {card.label}
            </div>
            <div style={{
              fontSize: "1.35rem", fontWeight: 800,
              color: card.accent, fontFamily: "Inter, sans-serif",
            }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Chart Card ── */}
      <div className="admin-card" style={{ padding: "1.5rem" }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: "1.25rem",
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--text-main)" }}>
              Daily Request Activity
            </h3>
            <p style={{ margin: "0.2rem 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Last 30 days &middot; X axis = Date &middot; Y axis = No. of Requests
            </p>
          </div>
          <span style={{
            padding: "0.3rem 0.75rem",
            background: "rgba(108,99,255,0.12)",
            color: "#6c63ff",
            borderRadius: "20px",
            fontSize: "0.78rem",
            fontWeight: 600,
          }}>
            Activity
          </span>
        </div>

        {total === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "4rem 2rem", color: "var(--text-muted)", textAlign: "center",
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5"
              style={{ opacity: 0.4, marginBottom: "1rem" }}>
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
            <p style={{ margin: 0 }}>No requests recorded in the last 30 days.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={340}>
            <BarChart
              data={activity}
              margin={{ top: 16, right: 16, left: 8, bottom: 60 }}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* subtle grid */}
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="var(--border-color, #2a2a3a)"
                vertical={false}
              />

              <XAxis
                dataKey="label"
                tick={<CustomXTick />}
                axisLine={{ stroke: "var(--border-color, #2a2a3a)" }}
                tickLine={false}
                interval={Math.ceil(activity.length / 10) - 1}
              />

              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "var(--text-muted, #888)", fontFamily: "Inter, sans-serif" }}
                axisLine={false}
                tickLine={false}
                label={{
                  value: "No. of Requests",
                  angle: -90,
                  position: "insideLeft",
                  offset: -4,
                  style: { fontSize: 11, fill: "var(--text-muted, #888)", fontFamily: "Inter, sans-serif" },
                }}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(108,99,255,0.08)", radius: 4 }}
              />

              <Bar
                dataKey="count"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
                onMouseEnter={(_, index) => setHoveredIndex(index)}
              >
                {activity.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      hoveredIndex === index
                        ? "#a78bfa"
                        : `url(#rechartBarGrad)`
                    }
                  />
                ))}
                {/* Define gradient inside the SVG via hidden defs trick */}
              </Bar>

              {/* Gradient definition — injected via recharts customized component */}
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Gradient overlay via SVG def — needs to be in DOM */}
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <linearGradient id="rechartBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6c63ff" stopOpacity="1" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.7" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

export default Analytics;
