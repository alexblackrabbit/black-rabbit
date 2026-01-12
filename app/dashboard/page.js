"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function MissionControl() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) router.push("/login");
      else setLoading(false);
    };
    checkUser();
  }, [router]);

  if (loading) {
    return <div style={styles.loading}>INITIALIZING UPLINK…</div>;
  }

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.branding}>
          <div style={styles.signalDot} />
          <h1 style={styles.logo}>BLACK RABBIT</h1>
          <span style={styles.badge}>SECURE · LEVEL 5</span>
        </div>

        <div style={styles.headerActions}>
          <button style={styles.actionBtn}>⚡ RUN ANALYSIS</button>
          <button
            style={styles.logoutBtn}
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/login");
            }}
          >
            DISCONNECT
          </button>
        </div>
      </header>

      {/* GRID */}
      <main style={styles.grid}>
        {/* SITUATION REPORT */}
        <section style={{ ...styles.panel, gridColumn: "span 8" }}>
          <h2 style={styles.panelTitle}>SITUATION REPORT</h2>
          <p style={styles.summaryText}>
            <span style={styles.alertRed}>BLOCKER:</span> Pricing decision
            ($29 vs $39) unresolved in <span style={styles.mono}>#exec</span>.
            Engineering blocked pending approval.
          </p>
          <div style={styles.tags}>
            <span style={styles.tag}>PRICING</span>
            <span style={styles.tag}>LAUNCH RISK</span>
            <span style={styles.tag}>URGENT</span>
          </div>
        </section>

        {/* SIGNAL INTEL */}
        <section style={{ ...styles.panel, gridColumn: "span 4" }}>
          <h2 style={styles.panelTitle}>SIGNAL INTEL</h2>
          <div style={styles.statGrid}>
            <div><strong>124</strong><span>MSGS</span></div>
            <div><strong>7</strong><span>CHANNELS</span></div>
            <div><strong style={{ color: "#FFD166" }}>3</strong><span>BLOCKED</span></div>
          </div>
        </section>

        {/* CRITICAL RISKS */}
        <section style={{ ...styles.panel, gridColumn: "span 4" }}>
          <h2 style={styles.panelTitle}>CRITICAL RISKS</h2>
          <ul style={styles.list}>
            <li>Pricing unresolved · 48h stale</li>
            <li>Assets missing · launch blocked</li>
          </ul>
        </section>

        {/* SYSTEM STATUS */}
        <section style={{ ...styles.panel, gridColumn: "span 4" }}>
          <h2 style={styles.panelTitle}>SYSTEM STATUS</h2>
          <div style={styles.statusRow}><span>INGESTION</span><span style={styles.good}>OK</span></div>
          <div style={styles.statusRow}><span>AI ENGINE</span><span style={styles.good}>ONLINE</span></div>
          <div style={styles.statusRow}><span>LAST SYNC</span><span style={styles.mono}>2m ago</span></div>
        </section>

        {/* ACTION DIRECTIVES */}
        <section style={{ ...styles.panel, gridColumn: "span 12" }}>
          <h2 style={styles.panelTitle}>ACTION DIRECTIVES</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>DIRECTIVE</th><th>OWNER</th><th>SOURCE</th><th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Finalize pricing</td>
                <td>Alex</td>
                <td>#exec</td>
                <td><span style={styles.badgeOpen}>OPEN</span></td>
              </tr>
              <tr>
                <td>Approve landing copy</td>
                <td>Becca</td>
                <td>#marketing</td>
                <td><span style={styles.badgeCritical}>OVERDUE</span></td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

/* STYLES */
const styles = {
  page: {
    background: "radial-gradient(circle at top, #111425, #05060a 60%)",
    minHeight: "100vh",
    color: "#E5E7EB",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  loading: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#4f5bff",
    fontFamily: "monospace",
    letterSpacing: "0.2em",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    padding: "20px 40px",
    borderBottom: "1px solid rgba(79,91,255,.2)",
    backdropFilter: "blur(10px)",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  branding: { display: "flex", alignItems: "center", gap: 14 },
  signalDot: { width: 8, height: 8, background: "#2ed47a", borderRadius: "50%" },
  logo: { margin: 0, letterSpacing: "0.15em", fontWeight: 800 },
  badge: { fontSize: 10, color: "#7c82ff" },
  headerActions: { display: "flex", gap: 12 },
  actionBtn: { background: "#4f5bff", color: "#fff", border: "none", padding: "10px 18px", cursor: "pointer" },
  logoutBtn: { background: "#111", color: "#fff", border: "1px solid #222", padding: "10px 18px", cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 20, padding: 32 },
  panel: { background: "#0b0d17", border: "1px solid #1e2233", padding: 24 },
  panelTitle: { marginBottom: 12, color: "#4f5bff" },
  summaryText: { lineHeight: 1.6 },
  alertRed: { color: "#ff5a5f", fontWeight: 700 },
  mono: { fontFamily: "monospace" },
  tags: { display: "flex", gap: 8, marginTop: 12 },
  tag: { background: "#111827", border: "1px solid #1e2233", padding: "4px 8px" },
  statGrid: { display: "flex", justifyContent: "space-between" },
  list: { paddingLeft: 18, lineHeight: 1.6 },
  statusRow: { display: "flex", justifyContent: "space-between", marginBottom: 8 },
  good: { color: "#2ed47a" },
  table: { width: "100%", borderCollapse: "collapse" },
  badgeOpen: { color: "#ffd166" },
  badgeCritical: { color: "#ff5a5f" },
};
