"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function MissionControl() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // 🔒 Auth Check
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) router.push("/login");
      else setLoading(false);
    };
    checkUser();
  }, [router]);

  if (loading) {
    return <div style={styles.loading}>INITIALIZING UPLINK...</div>;
  }

  return (
    <div style={styles.page}>
      {/* ──────────────── HEADER ──────────────── */}
      <header style={styles.header}>
        <div style={styles.branding}>
          <div style={styles.signalDot}></div>
          <h1 style={styles.logo}>BLACK RABBIT</h1>
          <span style={styles.badge}>SECURE // LEVEL 5</span>
        </div>

        <div style={styles.headerActions}>
          <button style={styles.actionBtn}>
            <span style={styles.icon}>⚡</span> RUN ANALYSIS
          </button>
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

      {/* ──────────────── GRID LAYOUT ──────────────── */}
      <main style={styles.grid}>
        
        {/* 1. HERO: EXECUTIVE SUMMARY (Spans 8 cols) */}
        <section style={{ ...styles.panel, gridColumn: "span 8" }}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>SITUATION REPORT</h2>
            <div style={styles.statusLive}>LIVE FEED</div>
          </div>
          
          <div style={styles.heroContent}>
            <p style={styles.summaryText}>
              <span style={{color: '#FF5A5F', fontWeight: 'bold'}}>BLOCKER DETECTED:</span> 
              Pricing strategy debate ($29 vs $39) has stalled in <span style={styles.channelLink}>#exec</span> for 48 hours. 
              Engineering requires immediate decision to meet Friday ship target.
            </p>
            
            <div style={styles.tags}>
              <span style={styles.tag}>PRICING</span>
              <span style={styles.tag}>LAUNCH RISK</span>
              <span style={styles.tag}>URGENT</span>
            </div>
          </div>
        </section>

        {/* 2. STATS: SIGNAL INTELLIGENCE (Spans 4 cols) */}
        <section style={{ ...styles.panel, gridColumn: "span 4" }}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>SIGNAL INTELLIGENCE</h2>
          </div>
          <div style={styles.statRow}>
            <div style={styles.stat}>
              <span style={styles.statNum}>124</span>
              <span style={styles.statLabel}>MSGS</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statNum}>07</span>
              <span style={styles.statLabel}>CHANNELS</span>
            </div>
            <div style={styles.stat}>
              <span style={{...styles.statNum, color: '#FFD166'}}>03</span>
              <span style={styles.statLabel}>BLOCKED</span>
            </div>
          </div>
        </section>

        {/* 3. ALERTS: CRITICAL RISKS (Spans 4 cols) */}
        <section style={{ ...styles.panel, gridColumn: "span 4" }}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>CRITICAL RISKS</h2>
          </div>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              <span style={styles.alertIcon}>⚠️</span>
              <div>
                <div style={styles.itemTitle}>Pricing Undecided</div>
                <div style={styles.itemMeta}>#exec • 2 days stale</div>
              </div>
            </li>
            <li style={styles.listItem}>
              <span style={styles.alertIcon}>🛑</span>
              <div>
                <div style={styles.itemTitle}>Assets Missing</div>
                <div style={styles.itemMeta}>#marketing • blocking launch</div>
              </div>
            </li>
          </ul>
        </section>

        {/* 4. SYSTEM STATUS (Spans 4 cols) */}
        <section style={{ ...styles.panel, gridColumn: "span 4" }}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>SYSTEM STATUS</h2>
          </div>
          <div style={styles.statusRow}>
            <span>INGESTION</span>
            <span style={styles.statusGood}>OPTIMAL</span>
          </div>
          <div style={styles.statusRow}>
            <span>NEURAL ENGINE</span>
            <span style={styles.statusGood}>ONLINE</span>
          </div>
          <div style={styles.statusRow}>
            <span>LAST SYNC</span>
            <span style={styles.mono}>T-MINUS 2m</span>
          </div>
        </section>

        {/* 5. ACTION DIRECTIVES (Spans 12 cols / Full Width) */}
        <section style={{ ...styles.panel, gridColumn: "span 12" }}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>ACTION DIRECTIVES</h2>
          </div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{textAlign: 'left'}}>DIRECTIVE</th>
                <th style={{textAlign: 'left'}}>OWNER</th>
                <th style={{textAlign: 'left'}}>SOURCE</th>
                <th style={{textAlign: 'left'}}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr style={styles.tr}>
                <td style={styles.td}>Finalize launch pricing model ($29 vs $39)</td>
                <td style={styles.td}><span style={styles.avatar}>AM</span> Alex M.</td>
                <td style={{...styles.td, ...styles.mono}}>#exec</td>
                <td style={styles.td}><span style={styles.badgeOpen}>OPEN</span></td>
              </tr>
              <tr style={styles.tr}>
                <td style={styles.td}>Approve final landing page copy</td>
                <td style={styles.td}><span style={styles.avatar}>BK</span> Becca K.</td>
                <td style={{...styles.td, ...styles.mono}}>#marketing</td>
                <td style={styles.td}><span style={styles.badgeCritical}>OVERDUE</span></td>
              </tr>
            </tbody>
          </table>
        </section>

      </main>
    </div>
  );
}

/* ──────────────── STYLES ──────────────── */

const styles = {
  // 🌌 PAGE
  page: {
    backgroundColor: "#05060a",
    backgroundImage: "radial-gradient(circle at 50% 0%, #111425, #05060a 60%)",
    color: "#e2e8f0",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
    overflowX: "hidden",
  },
  loading: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#000",
    color: "#4f5bff",
    fontFamily: "monospace",
    letterSpacing: "0.2em",
  },

  // 🛰️ HEADER
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 40px",
    borderBottom: "1px solid rgba(79, 91, 255, 0.15)",
    background: "rgba(5, 6, 10, 0.8)",
    backdropFilter: "blur(12px)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  branding: { display: "flex", alignItems: "center", gap: "16px" },
  signalDot: { width: "8px", height: "8px", background: "#2ed47a", borderRadius: "50%", boxShadow: "0 0 10px #2ed47a" },
  logo: { margin: 0, fontSize: "20px", fontWeight: "800", letterSpacing: "0.15em", color: "#fff" },
  badge: { 
    fontSize: "10px", 
    background: "rgba(79, 91, 255, 0.1)", 
    color: "#7c82ff", 
    border: "1px solid rgba(79, 91, 255, 0.3)", 
    padding: "4px 8px", 
    borderRadius: "2px", 
    letterSpacing: "0.1em",
    fontWeight: "600"
  },
  headerActions: { display: "flex", gap: "16px" },
  actionBtn: {
    background: "#4f5bff",
    border: "none",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "2px",
    fontWeight: "700",
    letterSpacing: "0.05em",
    cursor: "pointer",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 0 20px rgba(79, 91, 255, 0.3)",
  },
  logoutBtn: {
    background: "transparent",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    color: "#94a3b8",
    padding: "10px 20px",
    borderRadius: "2px",
    fontWeight: "600",
    fontSize: "12px",
    cursor: "pointer",
  },

  // 📐 GRID
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(12, 1fr)",
    gridAutoRows: "minmax(min-content, max-content)",
    gap: "24px",
    padding: "32px 40px",
    maxWidth: "1600px",
    margin: "0 auto",
  },

  // 🃏 PANELS
  panel: {
    background: "rgba(12, 14, 28, 0.7)",
    border: "1px solid rgba(79, 91, 255, 0.15)",
    borderRadius: "4px",
    padding: "24px",
    backdropFilter: "blur(5px)",
    display: "flex",
    flexDirection: "column",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    paddingBottom: "12px",
  },
  panelTitle: {
    margin: 0,
    fontSize: "11px",
    letterSpacing: "0.2em",
    color: "#7c82ff",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  statusLive: {
    fontSize: "10px",
    color: "#2ed47a",
    fontWeight: "bold",
    letterSpacing: "0.1em",
    animation: "pulse 2s infinite",
  },

  // 📝 CONTENT
  heroContent: { display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" },
  summaryText: { fontSize: "20px", lineHeight: "1.5", fontWeight: "300", color: "#fff" },
  tags: { display: "flex", gap: "10px", marginTop: "20px" },
  tag: { 
    fontSize: "10px", 
    padding: "4px 8px", 
    border: "1px solid rgba(79, 91, 255, 0.4)", 
    color: "#aeb3ff", 
    borderRadius: "2px", 
    letterSpacing: "0.1em", 
    fontWeight: "600",
    textTransform: "uppercase" 
  },
  channelLink: { fontFamily: "monospace", color: "#7c82ff", background: "rgba(79, 91, 255, 0.1)", padding: "2px 4px" },

  // 📊 STATS
  statRow: { display: "flex", justifyContent: "space-between", height: "100%", alignItems: "center" },
  stat: { display: "flex", flexDirection: "column", alignItems: "center" },
  statNum: { fontSize: "36px", fontWeight: "700", color: "#fff", lineHeight: "1" },
  statLabel: { fontSize: "10px", color: "#64748b", letterSpacing: "0.1em", fontWeight: "600", marginTop: "4px" },

  // ⚠️ LISTS
  list: { listStyle: "none", padding: 0, margin: 0 },
  listItem: { display: "flex", gap: "12px", padding: "12px 0", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" },
  alertIcon: { fontSize: "16px" },
  itemTitle: { fontSize: "13px", fontWeight: "600", color: "#fff" },
  itemMeta: { fontSize: "11px", color: "#64748b", marginTop: "2px", fontFamily: "monospace" },

  // 🏥 STATUS
  statusRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", fontSize: "12px", color: "#94a3b8", letterSpacing: "0.05em" },
  statusGood: { color: "#2ed47a", fontWeight: "700", border: "1px solid rgba(46, 212, 122, 0.3)", padding: "2px 6px", borderRadius: "2px", fontSize: "10px" },
  mono: { fontFamily: "monospace", color: "#64748b" },

  // 📋 TABLE
  table: { width: "100%", borderCollapse: "collapse", fontSize: "13px" },
  tr: { borderBottom: "1px solid rgba(255, 255, 255, 0.05)" },
  td: { padding: "16px 8px", color: "#cbd5e1" },
  avatar: { display: "inline-block", width: "20px", height: "20px", background: "#1e293b", textAlign: "center", lineHeight: "20px", borderRadius: "50%", marginRight: "8px", fontSize: "9px", color: "#94a3b8" },
  badgeOpen: { background: "rgba(255, 209, 102, 0.1)", color: "#FFD166", padding: "4px 8px", fontSize: "10px", fontWeight: "700", borderRadius: "2px" },
  badgeCritical: { background: "rgba(255, 90, 95, 0.15)", color: "#FF5A5F", padding: "4px 8px", fontSize: "10px", fontWeight: "700", borderRadius: "2px" },
};
