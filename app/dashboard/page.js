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
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.page}>
      
      {/* ──────────────── GRID LAYOUT ──────────────── */}
      <main style={styles.grid}>
        
        {/* 1. HERO: EXECUTIVE SUMMARY (Spans 8 cols) */}
        <section style={{ ...styles.panel, gridColumn: "span 8" }}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>Situation Report</h2>
            <div style={styles.statusLive}>LIVE</div>
          </div>
          
          <div style={styles.heroContent}>
            <p style={styles.summaryText}>
              <span style={{color: '#FFFFFF', fontWeight: '600'}}>Blocker Detected:</span> 
              Pricing strategy debate ($29 vs $39) has stalled in <span style={styles.channelLink}>#exec</span> for 48 hours. 
              Engineering requires immediate decision to meet Friday ship target.
            </p>
            
            <div style={styles.tags}>
              <span style={styles.tag}>Pricing</span>
              <span style={styles.tag}>Launch Risk</span>
              <span style={styles.tag}>Urgent</span>
            </div>
          </div>
        </section>

        {/* 2. STATS (Spans 4 cols) */}
        <section style={{ ...styles.panel, gridColumn: "span 4" }}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>Signal Intelligence</h2>
          </div>
          <div style={styles.statRow}>
            <div style={styles.stat}>
              <span style={styles.statNum}>124</span>
              <span style={styles.statLabel}>Msgs</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statNum}>07</span>
              <span style={styles.statLabel}>Channels</span>
            </div>
            <div style={styles.stat}>
              <span style={{...styles.statNum, color: '#E5E7EB'}}>03</span>
              <span style={styles.statLabel}>Blocked</span>
            </div>
          </div>
        </section>

        {/* 3. ALERTS (Spans 4 cols) */}
        <section style={{ ...styles.panel, gridColumn: "span 4" }}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>Critical Risks</h2>
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
            <h2 style={styles.panelTitle}>System Status</h2>
          </div>
          <div style={styles.statusRow}>
            <span>Ingestion</span>
            <span style={styles.statusGood}>Active</span>
          </div>
          <div style={styles.statusRow}>
            <span>Analysis Engine</span>
            <span style={styles.statusGood}>Online</span>
          </div>
          <div style={styles.statusRow}>
            <span>Last Sync</span>
            <span style={styles.mono}>2m ago</span>
          </div>
        </section>

        {/* 5. ACTION DIRECTIVES (Spans 12 cols / Full Width) */}
        <section style={{ ...styles.panel, gridColumn: "span 12" }}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>Action Directives</h2>
            <button 
              style={styles.logoutBtn}
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/login");
              }}
            >
              Log out
            </button>
          </div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{textAlign: 'left', paddingLeft: '8px'}}>Directive</th>
                <th style={{textAlign: 'left'}}>Owner</th>
                <th style={{textAlign: 'left'}}>Source</th>
                <th style={{textAlign: 'left'}}>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style={styles.tr}>
                <td style={styles.td}>Finalize launch pricing model ($29 vs $39)</td>
                <td style={styles.td}>Alex M.</td>
                <td style={{...styles.td, ...styles.mono}}>#exec</td>
                <td style={styles.td}><span style={styles.badgeOpen}>Open</span></td>
              </tr>
              <tr style={styles.tr}>
                <td style={styles.td}>Approve final landing page copy</td>
                <td style={styles.td}>Becca K.</td>
                <td style={{...styles.td, ...styles.mono}}>#marketing</td>
                <td style={styles.td}><span style={styles.badgeCritical}>Overdue</span></td>
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
    // No background set here because globals.css handles the main #0B0B0B
    color: "#E5E7EB",
    minHeight: "100vh",
    width: "100%",
    padding: "20px", // Adds breathing room around the grid
  },
  loading: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#666",
  },

  // 📐 GRID
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(12, 1fr)",
    gridAutoRows: "minmax(min-content, max-content)",
    gap: "24px",
    width: "100%",
    maxWidth: "1600px", // Prevents it from getting absurdly wide on huge monitors
    margin: "0 auto",   // Centers the grid
  },

  // 🃏 PANELS - The "Dark Minimal" Look
  panel: {
    background: "#121212", // Slightly lighter than background
    border: "1px solid #1F1F1F", // Subtle border
    borderRadius: "6px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  panelTitle: {
    margin: 0,
    fontSize: "14px",
    letterSpacing: "0.02em",
    color: "#A1A1A1",
    fontWeight: "600",
  },
  statusLive: {
    fontSize: "10px",
    color: "#2ED47A",
    fontWeight: "bold",
    letterSpacing: "0.05em",
  },

  // 📝 CONTENT
  heroContent: { display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" },
  summaryText: { fontSize: "20px", lineHeight: "1.5", fontWeight: "400", color: "#A1A1A1" },
  tags: { display: "flex", gap: "10px", marginTop: "20px" },
  tag: { 
    fontSize: "11px", 
    padding: "4px 10px", 
    background: "#1F1F1F",
    border: "1px solid #333", 
    color: "#E5E7EB", 
    borderRadius: "4px", 
    fontWeight: "500",
  },
  channelLink: { fontFamily: "monospace", color: "#E5E7EB", background: "#1F1F1F", padding: "2px 6px", borderRadius: "4px" },

  // 📊 STATS
  statRow: { display: "flex", justifyContent: "space-between", height: "100%", alignItems: "center", padding: "0 10px" },
  stat: { display: "flex", flexDirection: "column", alignItems: "center" },
  statNum: { fontSize: "32px", fontWeight: "600", color: "#FFFFFF", lineHeight: "1" },
  statLabel: { fontSize: "11px", color: "#666", marginTop: "6px", fontWeight: "500" },

  // ⚠️ LISTS
  list: { listStyle: "none", padding: 0, margin: 0 },
  listItem: { display: "flex", gap: "12px", padding: "12px 0", borderBottom: "1px solid #1F1F1F" },
  alertIcon: { fontSize: "16px" },
  itemTitle: { fontSize: "13px", fontWeight: "500", color: "#E5E7EB" },
  itemMeta: { fontSize: "11px", color: "#666", marginTop: "2px" },

  // 🏥 STATUS
  statusRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", fontSize: "12px", color: "#A1A1A1" },
  statusGood: { color: "#2ED47A", fontWeight: "500" },
  mono: { fontFamily: "monospace", color: "#666" },

  // 📋 TABLE
  table: { width: "100%", borderCollapse: "collapse", fontSize: "13px" },
  tr: { borderBottom: "1px solid #1F1F1F" },
  td: { padding: "16px 8px", color: "#A1A1A1" },
  logoutBtn: {
    background: "transparent",
    border: "1px solid #333",
    color: "#666",
    padding: "6px 12px",
    borderRadius: "4px",
    fontWeight: "500",
    fontSize: "11px",
    cursor: "pointer",
  },
  badgeOpen: { background: "#262626", color: "#E5E7EB", padding: "4px 8px", fontSize: "11px", borderRadius: "4px" },
  badgeCritical: { background: "#262626", color: "#FF5A5F", padding: "4px 8px", fontSize: "11px", borderRadius: "4px" },
};
