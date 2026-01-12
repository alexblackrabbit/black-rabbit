"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

/* =======================
   DASHBOARD PAGE
   ======================= */

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // 🔒 Auth protection
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) router.push("/login");
      else setLoading(false);
    };
    checkUser();
  }, [router]);

  if (loading) {
    return <div style={styles.loading}>Loading command center…</div>;
  }

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.logo}>BLACK RABBIT</h1>
          <span style={styles.subtitle}>Intelligence Dashboard</span>
        </div>

        <div style={styles.headerActions}>
          <button style={styles.primaryButton}>Generate Brief</button>
          <button
            style={styles.secondaryButton}
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/login");
            }}
          >
            Log out
          </button>
        </div>
      </header>

      {/* GRID */}
      <main style={styles.grid}>
        {/* DAILY SUMMARY (HERO) */}
        <section style={{ ...styles.card, gridColumn: "span 8" }}>
          <h2 style={styles.cardTitle}>Daily Intelligence Summary</h2>
          <p style={styles.summaryText}>
            Focus today centered on pricing strategy ($29 vs $39), launch
            readiness, and marketing asset delays. Two unresolved decisions
            remain in leadership channels. No critical operational risks
            detected.
          </p>

          <div style={styles.tagRow}>
            <span style={styles.tag}>Pricing</span>
            <span style={styles.tag}>Launch</span>
            <span style={styles.tag}>Marketing</span>
          </div>
        </section>

        {/* NEEDS ATTENTION */}
        <section style={{ ...styles.card, gridColumn: "span 4" }}>
          <h2 style={styles.cardTitle}>Needs Attention</h2>
          <ul style={styles.alertList}>
            <li>Unresolved pricing decision (#exec)</li>
            <li>Launch blocked by missing assets</li>
            <li>Ownership unclear on onboarding</li>
          </ul>
        </section>

        {/* ACTIVITY SNAPSHOT */}
        <section style={{ ...styles.card, gridColumn: "span 4" }}>
          <h2 style={styles.cardTitle}>Activity</h2>

          <div style={styles.metric}>
            <span style={styles.metricValue}>124</span>
            <span style={styles.metricLabel}>Messages Today</span>
          </div>

          <div style={styles.metric}>
            <span style={styles.metricValue}>7</span>
            <span style={styles.metricLabel}>Active Channels</span>
          </div>

          <div style={styles.metric}>
            <span style={styles.metricValue}>12</span>
            <span style={styles.metricLabel}>Participants</span>
          </div>
        </section>

        {/* ACTION ITEMS */}
        <section style={{ ...styles.card, gridColumn: "span 8" }}>
          <h2 style={styles.cardTitle}>Action Items</h2>

          <table style={styles.table}>
            <thead>
              <tr>
                <th>Task</th>
                <th>Owner</th>
                <th>Source</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Finalize launch pricing</td>
                <td>Alex</td>
                <td>Slack</td>
                <td style={styles.statusOpen}>Open</td>
              </tr>
              <tr>
                <td>Deliver creative assets</td>
                <td>Becca</td>
                <td>Teams</td>
                <td style={styles.statusOverdue}>Overdue</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* SYSTEM HEALTH */}
        <section style={{ ...styles.card, gridColumn: "span 4" }}>
          <h2 style={styles.cardTitle}>System Health</h2>

          <div style={styles.healthRow}>
            <span>Status</span>
            <span style={styles.healthGood}>Healthy</span>
          </div>

          <div style={styles.healthRow}>
            <span>Last Sync</span>
            <span>5 min ago</span>
          </div>

          <div style={styles.healthRow}>
            <span>Messages Ingested</span>
            <span>124</span>
          </div>
        </section>
      </main>
    </div>
  );
}

/* =======================
   STYLES (MISSION CONTROL)
   ======================= */

const styles = {
  page: {
    background: "radial-gradient(circle at top, #0F1320, #05060A)",
    color: "#EDEDED",
    minHeight: "100vh",
    fontFamily: "Inter, system-ui, sans-serif",
  },

  loading: {
    padding: 40,
    fontSize: 18,
    color: "#AAA",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "28px 40px",
    borderBottom: "1px solid #1B1F36",
  },

  logo: {
    margin: 0,
    fontSize: 20,
    letterSpacing: "0.12em",
  },

  subtitle: {
    fontSize: 12,
    color: "#7C82FF",
    letterSpacing: "0.15em",
  },

  headerActions: {
    display: "flex",
    gap: 12,
  },

  primaryButton: {
    background: "linear-gradient(135deg, #4C6FFF, #7C82FF)",
    border: "none",
    color: "#FFF",
    padding: "10px 18px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },

  secondaryButton: {
    background: "#15172A",
    border: "1px solid #262A4A",
    color: "#FFF",
    padding: "10px 16px",
    borderRadius: 8,
    cursor: "pointer",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(12, 1fr)",
    gap: 24,
    padding: 32,
  },

  card: {
    background: "rgba(20, 24, 52, 0.85)",
    border: "1px solid #1F2455",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 0 0 1px rgba(124,130,255,0.05)",
  },

  cardTitle: {
    marginBottom: 16,
    fontSize: 14,
    letterSpacing: "0.12em",
    color: "#7C82FF",
    textTransform: "uppercase",
  },

  summaryText: {
    fontSize: 16,
    lineHeight: 1.6,
    marginBottom: 16,
  },

  tagRow: {
    display: "flex",
    gap: 10,
  },

  tag: {
    fontSize: 11,
    padding: "4px 10px",
    borderRadius: 20,
    background: "#1C2148",
    color: "#AAB0FF",
  },

  alertList: {
    paddingLeft: 18,
    lineHeight: 1.7,
  },

  metric: {
    marginBottom: 16,
  },

  metricValue: {
    fontSize: 28,
    fontWeight: 700,
  },

  metricLabel: {
    fontSize: 12,
    color: "#9AA0FF",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14,
  },

  statusOpen: {
    color: "#FFD166",
  },

  statusOverdue: {
    color: "#FF5A5F",
  },

  healthRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  healthGood: {
    color: "#2ED47A",
    fontWeight: 600,
  },
};
