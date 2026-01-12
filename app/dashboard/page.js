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
  // 🌌 PAGE BACKGROUND - Pure Black
  page: {
    backgroundColor: "#000000", // PURE BLACK
    color: "#e2e8f0",
    minHeight: "100vh",
    width: "100%", // Fixed: Changed from 100vw to 100% to stop scrollbar overlap
    margin: 0,
    padding: 0,
    fontFamily: "'Inter', sans-serif",
    boxSizing: "border-box", // Fixed: Ensures padding doesn't expand width
    overflowX: "hidden", // Fixed: Prevents horizontal scroll
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

  // 🛰️ HEADER - Pure Black with subtle border
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 40px",
    width: "100%",
    borderBottom: "1px solid #1a1a1a", // Subtle dark grey border
    background: "#000000", // Pure Black
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxSizing: "border-box", // Critical for layout
  },
  branding: { display: "flex", alignItems: "center", gap: "16px" },
  signalDot: { width: "8px", height: "8px", background: "#2ed47a", borderRadius: "50%", boxShadow: "0 0 10px #2ed47a" },
  logo: { margin: 0, fontSize: "20px", fontWeight: "800", letterSpacing: "0.15em", color: "#fff" },
  badge: { 
    fontSize: "10px", 
    background: "#111", 
    color: "#7c82ff",
