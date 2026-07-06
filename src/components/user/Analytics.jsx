import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
axios.defaults.withCredentials = true;

const MARGIN = { top: 24, right: 20, bottom: 64, left: 52 };

function BarChart({ data }) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(800);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      if (entries[0]) setWidth(entries[0].contentRect.width);
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!data || data.length === 0) return null;

  const height = 320;
  const innerW = width - MARGIN.left - MARGIN.right;
  const innerH = height - MARGIN.top - MARGIN.bottom;

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const yTicks = 5;

  const barPad = 0.25;
  const totalBars = data.length;
  const slotW = innerW / totalBars;
  const barW = slotW * (1 - barPad);

  const xPos = (i) => i * slotW + slotW * barPad * 0.5;
  const yPos = (v) => innerH - (v / maxCount) * innerH;
  const barH = (v) => (v / maxCount) * innerH;

  const labelStep = Math.ceil(totalBars / 10);

  const fmtDate = (iso) => {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div ref={containerRef} style={{ width: "100%", position: "relative" }}>
      <svg width={width} height={height} style={{ overflow: "visible", display: "block" }}>
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6c63ff" stopOpacity="1" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="barGradHover" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="1" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.9" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          {Array.from({ length: yTicks + 1 }, (_, i) => {
            const val = Math.round((maxCount / yTicks) * i);
            const y = yPos(val);
            return (
              <g key={i}>
                <line x1={0} y1={y} x2={innerW} y2={y}
                  stroke="var(--border-color, #2a2a3a)" strokeWidth={1}
                  strokeDasharray={i === 0 ? "none" : "4,4"} />
                <text x={-8} y={y + 4} textAnchor="end" fontSize={11}
                  fill="var(--text-muted, #888)" fontFamily="Inter, sans-serif">{val}</text>
              </g>
            );
          })}

          {data.map((d, i) => {
            const bx = xPos(i);
            const bh = Math.max(barH(d.count), d.count > 0 ? 2 : 0);
            const by = yPos(d.count);
            const isHovered = tooltip && tooltip.index === i;
            return (
              <g key={d.date}
                onMouseEnter={() => setTooltip({ index: i, x: bx + barW / 2, y: by, date: d.date, count: d.count })}
                onMouseLeave={() => setTooltip(null)}
                style={{ cursor: "pointer" }}
              >
                <rect x={bx} y={0} width={barW} height={innerH}
                  fill={isHovered ? "rgba(108,99,255,0.06)" : "transparent"} rx={4} />
                <rect x={bx} y={by} width={barW} height={bh} rx={4}
                  fill={isHovered ? "url(#barGradHover)" : "url(#barGrad)"}
                  filter={isHovered ? "url(#glow)" : "none"}
                  style={{ transition: "all 0.15s ease" }} />
              </g>
            );
          })}

          {data.map((d, i) => {
            if (i % labelStep !== 0 && i !== data.length - 1) return null;
            return (
              <text key={d.date} x={xPos(i) + barW / 2} y={innerH + 20}
                textAnchor="middle" fontSize={10}
                fill="var(--text-muted, #888)" fontFamily="Inter, sans-serif"
                transform={`rotate(-35, ${xPos(i) + barW / 2}, ${innerH + 20})`}
              >{fmtDate(d.date)}</text>
            );
          })}

          <line x1={0} y1={0} x2={0} y2={innerH} stroke="var(--border-color, #2a2a3a)" strokeWidth={1} />
          <line x1={0} y1={innerH} x2={innerW} y2={innerH} stroke="var(--border-color, #2a2a3a)" strokeWidth={1} />

          <text x={-38} y={innerH / 2} textAnchor="middle" fontSize={11}
            fill="var(--text-muted, #888)" fontFamily="Inter, sans-serif"
            transform={`rotate(-90, -38, ${innerH / 2})`}>No. of Requests</text>

          {tooltip && (() => {
            const ttW = 140;
            const ttH = 54;
            const ttX = Math.min(Math.max(tooltip.x - ttW / 2, 0), innerW - ttW);
            const ttY = Math.max(tooltip.y - ttH - 10, 0);
            return (
              <g>
                <rect x={ttX} y={ttY} width={ttW} height={ttH} rx={8}
                  fill="var(--surface-color, #1e1e2e)" stroke="#6c63ff" strokeWidth={1.5}
                  filter="url(#glow)" />
                <text x={ttX + ttW / 2} y={ttY + 18} textAnchor="middle" fontSize={11}
                  fill="#a0a0b8" fontFamily="Inter, sans-serif">
                  {fmtDate(tooltip.date)} · {new Date(tooltip.date + "T00:00:00").getFullYear()}
                </text>
                <text x={ttX + ttW / 2} y={ttY + 38} textAnchor="middle" fontSize={15}
                  fontWeight="700" fill="#6c63ff" fontFamily="Inter, sans-serif">
                  {tooltip.count} {tooltip.count === 1 ? "request" : "requests"}
                </text>
              </g>
            );
          })()}
        </g>
      </svg>
    </div>
  );
}

function Analytics() {
  const [activity, setActivity] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/analytics`, { headers: { Accept: "application/json" } })
      .then(res => {
        setActivity(res.data.activity || []);
        setTotal(res.data.total || 0);
      })
      .catch(err => {
        if (err.response && [401, 403].includes(err.response.status)) navigate("/login");
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

  const fmtDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const peak = activity.reduce((a, b) => (b.count > a.count ? b : a), { count: 0, date: "" });
  const activeDays = activity.filter(d => d.count > 0).length;
  const avg = total > 0 ? (total / (activeDays || 1)).toFixed(1) : "0";

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border-color)" }}>
        <h2 style={{ margin: 0, fontSize: "1.4rem", color: "var(--text-main)", fontWeight: 700 }}>
          Organization Usage
        </h2>
        <p style={{ margin: "0.3rem 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
          View your request activity over the last 30 days &middot;{" "}
          <span style={{ fontStyle: "italic" }}>Data may be delayed up to a few minutes</span>
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", marginBottom: "1.5rem", borderBottom: "2px solid var(--border-color)" }}>
        <button style={{
          background: "none", border: "none", padding: "0.6rem 1.2rem", cursor: "pointer",
          fontSize: "0.9rem", fontWeight: 700, color: "#6c63ff",
          borderBottom: "2px solid #6c63ff", marginBottom: "-2px",
          fontFamily: "Inter, sans-serif",
        }}>Activity</button>
      </div>

      {/* Summary stat cards */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {[
          { label: "Total Requests (30d)", value: total, accent: "#6c63ff" },
          { label: "Peak Day", value: peak.count ? `${peak.count} on ${fmtDate(peak.date)}` : "—", accent: "#3b82f6" },
          { label: "Avg per Active Day", value: avg, accent: "#10b981" },
        ].map((card, i) => (
          <div key={i} style={{
            flex: "1 1 160px", padding: "1rem 1.25rem",
            background: "var(--surface-color)", border: "1px solid var(--border-color)",
            borderRadius: "10px", position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, width: "3px", height: "100%",
              background: card.accent, borderRadius: "10px 0 0 10px",
            }} />
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {card.label}
            </div>
            <div style={{ fontSize: "1.35rem", fontWeight: 800, color: card.accent, fontFamily: "Inter, sans-serif" }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Chart card */}
      <div className="admin-card" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--text-main)" }}>
              Daily Request Activity
            </h3>
            <p style={{ margin: "0.2rem 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Last 30 days &middot; X axis = Date &middot; Y axis = No. of Requests
            </p>
          </div>
          <span style={{
            padding: "0.3rem 0.75rem", background: "rgba(108,99,255,0.12)",
            color: "#6c63ff", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 600,
          }}>Activity</span>
        </div>

        {total === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "4rem 2rem", color: "var(--text-muted)", textAlign: "center",
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.4, marginBottom: "1rem" }}>
              <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
            </svg>
            <p style={{ margin: 0 }}>No requests recorded in the last 30 days.</p>
          </div>
        ) : (
          <BarChart data={activity} />
        )}
      </div>
    </div>
  );
}

export default Analytics;
