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
    return <div style={styles.loading}>INITIALIZING COMMAND CENTER...</div>;
  }

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.branding}>
          <h1 style={styles.logo}>BLACK RABBIT</h1>
          <div style={styles.badge}>CLASSIFIED // EYES ONLY</div>
        </div>

        <div style={styles.headerActions}>
          <button style={styles.primaryButton}>
            <span style={styles.btnIcon}>⚡</span> GENERATE BRIEF
          </button>
          <button
            style={styles.secondaryButton}
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/login");
            }}
          >
            LOG OUT
          </button>
        </div>
      </header>

      {/* MISSION CONTROL GRID */}
      <main style={styles.grid}>
        
        {/* 1. DAILY INTELLIGENCE (Large Hero) */}
        <section style={{ ...styles.card, ...styles.heroCard }}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>DAILY INTELLIGENCE SUMMARY</h2>
            <div style={styles.liveIndicator}>• LIVE</div>
          </div>
          <p style={styles.summaryText}>
            <span style={styles.highlight}>CRITICAL UPDATE:</span> Pricing strategy ($29 vs $39) is the primary blocker for launch. Marketing assets are delayed by 48 hours. Two unresolved decisions remain in #exec channel requiring immediate leadership intervention.
          </p>
          <div style={styles.tagRow}>
            <span style={styles.tag}>PRICING STRATEGY</span>
            <span style={styles.tag}>LAUNCH READINESS</span>
            <span style={styles.tag}>RISK: HIGH</span>
          </div>
        </section>

        {/* 2. LIVE METRICS (Right Side Stats) */}
        <section style={{ ...styles.card, ...styles.statsCard }}>
          <h2 style={styles.cardTitle}>SIGNAL TRAFFIC</h2>
          <div style={styles.statGrid}>
            <div style={styles.statItem}>
              <span style={styles.statValue}>124</span>
              <span style={styles.statLabel}>MESSAGES</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statValue}>07</span>
              <span style={styles.statLabel}>CHANNELS</span>
            </div>
            <div style={styles.statItem}>
              <span style={{...styles.statValue, color: '#FFD166'}}>12</span>
              <span style={styles.statLabel}>PENDING</span>
            </div>
          </div>
        </section>

        {/* 3. NEEDS ATTENTION (Alerts) */}
        <section style={{ ...styles.card, ...styles.alertCard }}>
          <h2 style={styles.cardTitle}>PRIORITY ALERTS</h2>
          <ul style={styles.alertList}>
            <li style={styles.alertItem}>
              <span style={styles.alertIcon}>⚠️</span>
              <span style={styles.alertText}>Unresolved pricing decision (#exec)</span>
            </li>
            <li style={styles.alertItem}>
              <span style={styles.alertIcon}>🛑</span>
              <span style={styles.alertText}>Launch blocked by missing assets</span>
            </li>
            <li style={styles.alertItem}>
              <span style={styles.alertIcon}>❓</span>
              <span style={styles.alertText}>Ownership unclear on onboarding flow</span>
            </li>
          </ul>
        </section>

        {/* 4. SYSTEM HEALTH */}
        <section style={{ ...styles.card, ...styles.healthCard }}>
          <h2 style={styles.cardTitle}>SYSTEM STATUS</h2>
          <div style={styles.healthContainer}>
            <div style={styles.healthRow}>
              <span>INGESTION NODE</span>
              <span style={styles.statusGood}>OPERATIONAL</span>
            </div>
            <div style={styles.healthRow}>
              <span>AI REASONING</span>
              <span style={styles.statusGood}>ONLINE</span>
            </div>
            <div style={styles.healthRow}>
              <span>LAST SYNC</span>
              <span style={styles.monoText}>T-MINUS 5 MIN</span>
            </div>
          </div>
        </section>

        {/* 5. ACTION ITEMS (Full Width) */}
        <section style={{ ...styles.card, ...styles.fullWidthCard }}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>ACTION DIRECTIVES</h2>
            <div style={styles.tabGroup}>
              <span style={styles.activeTab}>ALL</span>
              <span style={styles.inactiveTab}>ASSIGNED TO ME</span>
            </div>
          </div>
          
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{width: '40%'}}>DIRECTIVE</th>
                <th>OWNER</th>
                <th>SOURCE CHANNEL</th>
                <th>PRIORITY</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.taskCell}>Finalize launch pricing model</td>
                <td><span style={styles.avatar}>AM</span> Alex M.</td>
                <td style={styles.monoText}>#exec-strategy</td>
                <td style={{color: '#FF5A5F'}}>CRITICAL</td>
                <td><span style={styles.statusBadgeOpen}>OPEN</span></td>
              </tr>
              <tr>
                <td style={styles.taskCell}>Deliver creative assets for landing page</td>
                <td><span style={styles.avatar}>BK</span> Becca K.</td>
                <td style={styles.monoText}>#marketing</td>
                <td style={{color: '#FFD166'}}>HIGH</td>
                <td><span style={styles.statusBadgeOverdue}>OVERDUE</span></td>
              </tr>
              <tr>
                <td style={styles.taskCell}>Review Q3 burn rate report</td>
                <td><span style={styles.avatar}>SG</span> Sarah G.</td>
                <td style={styles.monoText}>#finance</td>
                <td style={{color: '#2ED47A'}}>NORMAL</td>
                <td><span style={styles.statusBadgeOpen}>IN PROGRESS</span></td>
              </tr>
            </tbody>
          </table>
        </section>

      </main>
    </div>
  );
}

/* =======================
   STYLES (THE "CIA" THEME)
   ======================= */

const styles = {
  // 🌌 GLOBAL PAGE
  page: {
    background: "radial-gradient(circle at 50% 0%, #161b2e, #05060a 80%)", // Deep void blue-black
    color: "#e2e8f0",
    minHeight: "100vh",
    fontFamily: "'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    overflowX: "hidden",
  },

  loading: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#05060a",
    color: "#7c82ff",
    fontFamily: "monospace",
    letterSpacing: "0.2em",
  },

  // 🛰️ HEADER
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 40px",
    borderBottom: "1px solid rgba(124, 130, 255, 0.1)",
    background: "rgba(5, 6, 10, 0.8)",
    backdropFilter: "blur(10px)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },

  branding: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },

  logo: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "800",
    letterSpacing: "0.15em",
    background: "linear-gradient(90deg, #fff, #94a3b8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  badge: {
    fontSize: "10px",
    background: "rgba(255, 90, 95, 0.15)",
    color: "#FF5A5F",
    border: "1px solid rgba(255, 90, 95, 0.3)",
    padding: "4px 8px",
    borderRadius: "4px",
    letterSpacing: "0.1em",
    fontWeight: "600",
  },

  headerActions: {
    display: "flex",
    gap: "16px",
  },

  primaryButton: {
    background: "#7C82FF",
    border: "none",
    color: "#05060a",
    padding: "10px 24px",
    borderRadius: "2px", // Sharp edges
    cursor: "pointer",
    fontWeight: "700",
    letterSpacing: "0.05em",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 0 15px rgba(124, 130, 255, 0.4)",
  },

  secondaryButton: {
    background: "transparent",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    color: "#94a3b8",
    padding: "10px 24px",
    borderRadius: "2px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "12px",
    letterSpacing: "0.05em",
  },

  // 📐 GRID LAYOUT (The "Mission Control" feel)
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(12, 1fr)",
    gridAutoRows: "minmax(min-content, max-content)",
    gap: "24px",
    padding: "40px",
    maxWidth: "1800px",
    margin: "0 auto",
  },

  // 🃏 CARDS (Glass panels)
  card: {
    background: "rgba(13, 15, 28, 0.6)",
    border: "1px solid rgba(124, 130, 255, 0.15)",
    borderRadius: "6px",
    padding: "32px",
    backdropFilter: "blur(5px)",
    position: "relative",
    display: "flex",
    flexDirection: "column",
  },

  // Specific Card Spans (Responsive logic implied for grid)
  heroCard: { gridColumn: "span 8" }, // Takes up left 2/3
  statsCard: { gridColumn: "span 4" }, // Takes up right 1/3
  alertCard: { gridColumn: "span 4" },
  healthCard: { gridColumn: "span 4" }, // Middle/Right
  fullWidthCard: { gridColumn: "span 12" }, // Bottom full width

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "11px",
    letterSpacing: "0.2em",
    color: "#7C82FF",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  liveIndicator: {
    fontSize: "10px",
    color: "#2ED47A",
    fontWeight: "bold",
    letterSpacing: "0.1em",
    animation: "pulse 2s infinite",
  },

  // 📝 CONTENT STYLES
  summaryText: {
    fontSize: "24px", // Big bold text
    lineHeight: "1.4",
    fontWeight: "300",
    color: "#fff",
    marginBottom: "32px",
  },

  highlight: {
    color: "#FF5A5F",
    fontWeight: "600",
  },

  tagRow: {
    display: "flex",
    gap: "12px",
    marginTop: "auto",
  },

  tag: {
    fontSize: "10px",
    padding: "6px 12px",
    border: "1px solid rgba(124, 130, 255, 0.3)",
    background: "rgba(124, 130, 255, 0.05)",
    color: "#aeb3ff",
    borderRadius: "2px",
    letterSpacing: "0.1em",
    fontWeight: "600",
  },

  // 📊 STATS
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
  },
  statValue: {
    fontSize: "42px",
    fontWeight: "700",
    color: "#fff",
    lineHeight: "1",
    marginBottom: "8px",
  },
  statLabel: {
    fontSize: "10px",
    color: "#64748b",
    letterSpacing: "0.1em",
    fontWeight: "600",
  },

  // ⚠️ ALERTS
  alertList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  alertItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px 0",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
  },
  alertIcon: { fontSize: "16px" },
  alertText: { fontSize: "14px", fontWeight: "500" },

  // 🏥 HEALTH
  healthContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  healthRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "13px",
  },
  statusGood: {
    color: "#2ED47A",
    fontWeight: "600",
    letterSpacing: "0.05em",
    fontSize: "11px",
    border: "1px solid rgba(46, 212, 122, 0.3)",
    padding: "2px 6px",
    borderRadius: "2px",
  },
  monoText: {
    fontFamily: "monospace",
    color: "#64748b",
  },

  // 📋 TABLE
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  tabGroup: {
    display: "flex",
    gap: "24px",
    fontSize: "12px",
    fontWeight: "600",
    letterSpacing: "0.05em",
  },
  activeTab: { color: "#fff", borderBottom: "2px solid #7C82FF", paddingBottom: "4px" },
  inactiveTab: { color: "#475569", cursor: "pointer" },

  taskCell: {
    padding: "20px 0",
    color: "#fff",
    fontWeight: "500",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  avatar: {
    display: "inline-block",
    width: "24px",
    height: "24px",
    background: "#1e293b",
    color: "#94a3b8",
    fontSize: "10px",
    textAlign: "center",
    lineHeight: "24px",
    borderRadius: "50%",
    marginRight: "8px",
  },
  statusBadgeOpen: {
    background: "rgba(255, 209, 102, 0.1)",
    color: "#FFD166",
    padding: "4px 8px",
    fontSize: "10px",
    fontWeight: "700",
    borderRadius: "2px",
  },
  statusBadgeOverdue: {
    background: "rgba(255, 90, 95, 0.1)",
    color: "#FF5A5F",
    padding: "4px 8px",
    fontSize: "10px",
    fontWeight: "700",
    borderRadius: "2px",
  },
};
