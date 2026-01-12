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
      
      {/* ──────────────── NEW TOP NAVIGATION (CONTROL ROOM STYLE) ──────────────── */}
      <nav style={styles.topNav}>
        {/* Left: Brand */}
        <div style={styles.navLeft}>
          <div style={styles.logo}>BLACK RABBIT</div>
        </div>

        {/* Right: Controls */}
        <div style={styles.navRight}>
          
          {/* Source Filter */}
          <div style={styles.navControl}>
            <span style={styles.navLabel}>SOURCES:</span>
            <select style={styles.navSelect}>
              <option>All Sources</option>
              <option>Slack Only</option>
              <option>Teams Only</option>
            </select>
          </div>

          {/* Time Range */}
          <div style={styles.navControl}>
            <span style={styles.navLabel}>RANGE:</span>
            <select style={styles.navSelect}>
              <option>Last 24h</option>
              <option>Today</option>
              <option>Yesterday</option>
              <option>Last 7 Days</option>
            </select>
          </div>

          {/* Action Button */}
          <button style={styles.generateBtn}>GENERATE NOW</button>

          {/* User/Notifs */}
          <div style={styles.divider}></div>
          <span style={styles.icon}>🔔</span>
          <div style={styles.avatar}>AM</div>
        </div>
      </nav>

      {/* ──────────────── DASHBOARD GRID ──────────────── */}
      <main style={styles.grid}>
        
        {/* 🔹 BLOCK 1: ACTIVITY SNAPSHOT (Row of Stats) */}
        <section style={{ ...styles.panel, gridColumn: "span 12", flexDirection: "row", justifyContent: "space-around", alignItems: "center", padding: "20px 0" }}>
          <div style={styles.statItem}>
            <span style={styles.statValue}>124</span>
            <span style={styles.statLabel}>Messages</span>
          </div>
          <div style={styles.statSeparator}></div>
          <div style={styles.statItem}>
            <span style={styles.statValue}>8</span>
            <span style={styles.statLabel}>Active Threads</span>
          </div>
          <div style={styles.statSeparator}></div>
          <div style={styles.statItem}>
            <span style={styles.statValue}>12</span>
            <span style={styles.statLabel}>Participants</span>
          </div>
          <div style={styles.statSeparator}></div>
          <div style={styles.statItem}>
            <span style={styles.statValue}>Slack + Teams</span>
            <span style={styles.statLabel}>Connected</span>
          </div>
        </section>

        {/* 🔹 BLOCK 2: NEEDS ATTENTION (The Heart) */}
        <section style={{ ...styles.panel, gridColumn: "span 6", borderColor: "#333" }}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>Needs Attention</h2>
            <div style={styles.liveDot}></div>
          </div>
          <ul style={styles.alertList}>
            {/* Urgent Item */}
            <li style={{...styles.alertItem, borderLeft: "3px solid #FF5A5F"}}>
              <div style={styles.alertHeader}>
                <span style={{color: "#FF5A5F", fontWeight: "700"}}>CRITICAL</span>
                <span style={styles.meta}>#exec • 12h ago</span>
              </div>
              <div style={styles.alertBody}>Pricing decision unresolved. Raised 3x without answer.</div>
            </li>
            {/* Warning Item */}
            <li style={{...styles.alertItem, borderLeft: "3px solid #FFD166"}}>
              <div style={styles.alertHeader}>
                <span style={{color: "#FFD166", fontWeight: "700"}}>BLOCKED</span>
                <span style={styles.meta}>#marketing • 4h ago</span>
              </div>
              <div style={styles.alertBody}>Launch assets waiting on final approval from Becca.</div>
            </li>
            {/* Info Item */}
            <li style={{...styles.alertItem, borderLeft: "3px solid #4C6FFF"}}>
              <div style={styles.alertHeader}>
                <span style={{color: "#4C6FFF", fontWeight: "700"}}>RISK</span>
                <span style={styles.meta}>#product • 2h ago</span>
              </div>
              <div style={styles.alertBody}>Ownership unclear on "New User Onboarding" flow.</div>
            </li>
          </ul>
        </section>

        {/* 🔹 BLOCK 3: ACTION ITEMS (The Justification) */}
        <section style={{ ...styles.panel, gridColumn: "span 6" }}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>Action Items</h2>
            <button style={styles.textBtn}>View All</button>
          </div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Task</th>
                <th style={styles.th}>Owner</th>
                <th style={styles.th}>Age</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style={styles.tr}>
                <td style={styles.td}>Decide launch pricing</td>
                <td style={styles.td}>Alex</td>
                <td style={styles.td}>18h</td>
                <td style={styles.td}><span style={styles.statusOpen}>OPEN</span></td>
              </tr>
              <tr style={styles.tr}>
                <td style={styles.td}>Approve landing page copy</td>
                <td style={styles.td}>Becca</td>
                <td style={styles.td}>2d</td>
                <td style={styles.td}><span style={styles.statusOverdue}>OVERDUE</span></td>
              </tr>
              <tr style={styles.tr}>
                <td style={styles.td}>Schedule team sync</td>
                <td style={styles.td}>Sarah</td>
                <td style={styles.td}>4h</td>
                <td style={styles.td}><span style={styles.statusDone}>DONE</span></td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 🔹 BLOCK 5: DAILY SUMMARY (Full Width, Fathom Style) */}
        <section style={{ ...styles.panel, gridColumn: "span 12", minHeight: "400px" }}>
          <div style={{...styles.panelHeader, borderBottom: "1px solid #222", paddingBottom: "16px"}}>
            <div>
              <h2 style={{...styles.panelTitle, fontSize: "16px", color: "#FFF"}}>Daily Summary — Jan 12</h2>
              <span style={styles.meta}>Generated at 6:00 PM • Slack + Teams</span>
            </div>
            <button style={styles.outlineBtn}>Export PDF</button>
          </div>

          <div style={styles.summaryContent}>
            {/* Section 1: Day Focus */}
            <div style={styles.summarySection}>
              <h3 style={styles.summaryHeading}>DAY FOCUS</h3>
              <p style={styles.summaryText}>
                High intensity around <strong>Go-To-Market</strong> strategy today. The team is aligned on the product, but blocked on commercial terms. Operational velocity is high, but decision latency in #exec is creating downstream drag.
              </p>
            </div>

            {/* Section 2: Key Takeaways */}
            <div style={styles.summarySection}>
              <h3 style={styles.summaryHeading}>KEY TAKEAWAYS</h3>
              <ul style={styles.summaryList}>
                <li>Pricing model ($29 vs $39) is the single biggest blocker to launch.</li>
                <li>Marketing assets are delayed, pushing the campaign start date.</li>
                <li>Engineering successfully deployed the new auth flow (no issues).</li>
              </ul>
            </div>

            {/* Section 3: Topics (Accordion style placeholder) */}
            <div style={styles.summarySection}>
              <h3 style={styles.summaryHeading}>DEEP DIVES</h3>
              <div style={styles.topicRow}>
                <span style={{color: "#FFF"}}>▶ Pricing Strategy</span>
                <span style={styles.meta}>14 msgs • #exec</span>
              </div>
              <div style={styles.topicRow}>
                <span style={{color: "#FFF"}}>▶ Marketing Launch</span>
                <span style={styles.meta}>28 msgs • #marketing</span>
              </div>
            </div>
          </div>
        </section>

        {/* 🔹 BLOCK 4: SYSTEM HEALTH (Bottom, Diagnostics) */}
        <section style={{ ...styles.panel, gridColumn: "span 12", flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", background: "#0D0D0D" }}>
          <div style={{display: "flex", gap: "24px"}}>
            <div style={styles.healthItem}>
              <span style={styles.meta}>STATUS</span>
              <span style={{color: "#2ED47A", fontWeight: "700", fontSize: "12px"}}>● SYSTEM HEALTHY</span>
            </div>
            <div style={styles.healthItem}>
              <span style={styles.meta}>LAST SYNC</span>
              <span style={{color: "#CCC", fontSize: "12px"}}>Today, 6:00 PM</span>
            </div>
            <div style={styles.healthItem}>
              <span style={styles.meta}>INGESTED</span>
              <span style={{color: "#CCC", fontSize: "12px"}}>124 Messages</span>
            </div>
          </div>
          <span style={styles.meta}>v1.0.4</span>
        </section>

      </main>
    </div>
  );
}

/* ──────────────── STYLES ──────────────── */

const styles = {
  // 🌌 PAGE STRUCTURE
  page: {
    backgroundColor: "#0B0B0B", // The requested Premium Off-Black
    color: "#E5E7EB",
    minHeight: "100vh",
    width: "100%",
    fontFamily: "'Inter', sans-serif",
    paddingBottom: "40px",
  },
  loading: {
    height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    background: "#0B0B0B", color: "#666", letterSpacing: "0.1em", fontSize: "12px"
  },

  // 🧭 TOP NAVIGATION
  topNav: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "0 32px", height: "64px",
    background: "rgba(11, 11, 11, 0.95)", borderBottom: "1px solid #1F1F1F",
    position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(10px)"
  },
  logo: { fontSize: "14px", fontWeight: "800", letterSpacing: "0.1em", color: "#FFF" },
  navRight: { display: "flex", alignItems: "center", gap: "24px" },
  navControl: { display: "flex", alignItems: "center", gap: "8px" },
  navLabel: { fontSize: "10px", color: "#666", fontWeight: "600", letterSpacing: "0.05em" },
  navSelect: {
    background: "transparent", border: "none", color: "#FFF", fontSize: "12px",
    fontWeight: "500", cursor: "pointer", outline: "none", fontFamily: "inherit"
  },
  generateBtn: {
    background: "#FFF", color: "#000", border: "none", padding: "6px 12px",
    fontSize: "11px", fontWeight: "700", borderRadius: "2px", cursor: "pointer",
    letterSpacing: "0.05em"
  },
  divider: { width: "1px", height: "16px", background: "#333" },
  icon: { fontSize: "14px", cursor: "pointer", opacity: 0.7 },
  avatar: {
    width: "24px", height: "24px", borderRadius: "50%", background: "#222",
    color: "#AAA", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: "600"
  },

  // 📐 MAIN GRID
  grid: {
    display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "24px",
    padding: "32px", maxWidth: "1600px", margin: "0 auto"
  },

  // 🃏 GENERIC PANEL STYLE
  panel: {
    background: "#121212", border: "1px solid #1F1F1F", borderRadius: "6px",
    display: "flex", flexDirection: "column", padding: "24px"
  },
  panelHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  panelTitle: { fontSize: "12px", fontWeight: "700", color: "#888", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 },
  liveDot: { width: "6px", height: "6px", background: "#2ED47A", borderRadius: "50%", boxShadow: "0 0 8px #2ED47A" },

  // 📊 BLOCK 1: STATS
  statItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" },
  statValue: { fontSize: "24px", fontWeight: "600", color: "#FFF" },
  statLabel: { fontSize: "11px", color: "#666", fontWeight: "500" },
  statSeparator: { width: "1px", height: "32px", background: "#222" },

  // ⚠️ BLOCK 2: ALERTS
  alertList: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" },
  alertItem: { background: "#181818", padding: "12px 16px", borderRadius: "4px" },
  alertHeader: { display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "10px" },
  alertBody: { fontSize: "13px", color: "#E5E7EB", lineHeight: "1.4" },

  // 📋 BLOCK 3: ACTION TABLE
  table: { width: "100%", borderCollapse: "collapse", fontSize: "13px" },
  th: { textAlign: "left", color: "#666", paddingBottom: "12px", fontSize: "11px", fontWeight: "600" },
  tr: { borderBottom: "1px solid #1F1F1F" },
  td: { padding: "12px 0", color: "#CCC" },
  textBtn: { background: "none", border: "none", color: "#666", fontSize: "11px", cursor: "pointer" },
  statusOpen: { background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "2px", fontSize: "10px", fontWeight: "600", color: "#FFF" },
  statusOverdue: { background: "rgba(255, 90, 95, 0.2)", padding: "2px 6px", borderRadius: "2px", fontSize: "10px", fontWeight: "600", color: "#FF5A5F" },
  statusDone: { color: "#444", fontSize: "10px", fontWeight: "600", textDecoration: "line-through" },

  // 📝 BLOCK 5: SUMMARY
  summaryContent: { display: "flex", flexDirection: "column", gap: "32px", marginTop: "16px" },
  summarySection: {},
  summaryHeading: { fontSize: "11px", color: "#4C6FFF", fontWeight: "700", marginBottom: "12px", letterSpacing: "0.05em" },
  summaryText: { fontSize: "14px", lineHeight: "1.6", color: "#CCC", maxWidth: "800px" },
  summaryList: { paddingLeft: "16px", margin: 0, fontSize: "14px", color: "#CCC", lineHeight: "1.8" },
  topicRow: { display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #1F1F1F", fontSize: "13px" },
  outlineBtn: { background: "transparent", border: "1px solid #333", color: "#888", padding: "4px 10px", fontSize: "11px", borderRadius: "2px", cursor: "pointer" },

  // 🏥 BLOCK 4: HEALTH
  healthItem: { display: "flex", flexDirection: "column", gap: "2px" },
  meta: { fontSize: "10px", color: "#666", fontWeight: "500" },
};
