"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"; // <--- Only change: Secure Engine
import { useRouter } from "next/navigation";

export default function MissionControl() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
   
  // REAL DATA STATE
  const [stats, setStats] = useState({
    messages: 0,
    newMessages: 0,
    channels: 0,
    participants: 0,
    lastSync: "Pending...",
    status: "CONNECTING"
  });

  // 🔒 Auth Check & Data Fetch
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();

      if (!user || !session) {
        router.push("/login");
        return;
      }

      // Fetch Real Stats
      try {
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        const res = await fetch("/api/dashboard/stats", {
            headers: {
                "x-timezone": userTimezone,
                "Authorization": `Bearer ${session.access_token}`
            }
        });
        
        const realData = await res.json();
        
        if (realData.messages !== undefined) {
            setStats({
                messages: realData.messages,
                newMessages: realData.newMessages,
                channels: realData.channels,
                participants: realData.participants,
                lastSync: realData.lastSync ? new Date(realData.lastSync).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Never",
                status: "OPTIMAL"
            });
        }
      } catch (e) {
        console.error("Stats fetch failed", e);
      }

      setLoading(false);
    };
    init();
  }, [router, supabase]);

  if (loading) {
    return <div style={styles.loading}>INITIALIZING UPLINK...</div>;
  }

  return (
    <div style={styles.page}>
       
      {/* ──────────────── HEADER ──────────────── */}
      <nav style={styles.topNav}>
        <div style={styles.navLeft}>
          <div style={styles.logo}>BLACK RABBIT</div>
        </div>
        <div style={styles.navRight}>
          <div style={styles.navControl}>
            <span style={styles.navLabel}>SOURCES:</span>
            <select style={styles.navSelect}>
              <option>All Sources</option>
              <option>Slack Only</option>
            </select>
          </div>
          <button style={styles.generateBtn}>GENERATE NOW</button>
          <div style={styles.divider}></div>
          <span style={styles.icon}>🔔</span>
          <div style={styles.avatar}>AM</div>
        </div>
      </nav>

      {/* ──────────────── DASHBOARD GRID ──────────────── */}
      <main style={styles.grid}>
        
        {/* 🔹 BLOCK 1: ACTIVITY SNAPSHOT (WIRED) */}
        <section style={{ ...styles.panel, gridColumn: "span 12", flexDirection: "row", justifyContent: "space-around", alignItems: "center", padding: "20px 0" }}>
           
          {/* MESSAGES CARD (UPDATED) */}
          <div style={styles.statItem}>
            <span style={styles.statValue}>{stats.messages}</span>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <span style={styles.statLabel}>Messages</span>
                {/* Green badge if new messages exist */}
                {stats.newMessages > 0 && (
                    <span style={{color: '#2ED47A', fontSize: '10px', fontWeight: '600', marginTop: '2px', letterSpacing: '0.05em'}}>
                        +{stats.newMessages} today
                    </span>
                )}
            </div>
          </div>

          <div style={styles.statSeparator}></div>
           
          <div style={styles.statItem}>
            <span style={styles.statValue}>{stats.channels}</span>
            <span style={styles.statLabel}>Channels</span>
          </div>
           
          <div style={styles.statSeparator}></div>
           
          <div style={styles.statItem}>
            <span style={styles.statValue}>{stats.participants}</span>
            <span style={styles.statLabel}>Participants</span>
          </div>
           
          <div style={styles.statSeparator}></div>
           
          <div style={styles.statItem}>
            <span style={styles.statValue}>Slack</span>
            <span style={styles.statLabel}>Connected</span>
          </div>
        </section>

        {/* 🔹 BLOCK 2: NEEDS ATTENTION (Placeholder) */}
        <section style={{ ...styles.panel, gridColumn: "span 6", borderColor: "#333" }}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>Needs Attention</h2>
            <div style={styles.liveDot}></div>
          </div>
          <ul style={styles.alertList}>
            <li style={{...styles.alertItem, borderLeft: "3px solid #FF5A5F"}}>
              <div style={styles.alertHeader}>
                <span style={{color: "#FF5A5F", fontWeight: "700"}}>CRITICAL</span>
                <span style={styles.meta}>#exec • 12h ago</span>
              </div>
              <div style={styles.alertBody}>Pricing decision unresolved. Raised 3x without answer.</div>
            </li>
            <li style={{...styles.alertItem, borderLeft: "3px solid #FFD166"}}>
              <div style={styles.alertHeader}>
                <span style={{color: "#FFD166", fontWeight: "700"}}>BLOCKED</span>
                <span style={styles.meta}>#marketing • 4h ago</span>
              </div>
              <div style={styles.alertBody}>Launch assets waiting on final approval.</div>
            </li>
          </ul>
        </section>

        {/* 🔹 BLOCK 3: ACTION ITEMS (Placeholder) */}
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
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style={styles.tr}>
                <td style={styles.td}>Decide launch pricing</td>
                <td style={styles.td}>Alex</td>
                <td style={styles.td}><span style={styles.statusOpen}>OPEN</span></td>
              </tr>
              <tr style={styles.tr}>
                <td style={styles.td}>Approve landing page copy</td>
                <td style={styles.td}>Becca</td>
                <td style={styles.td}><span style={styles.statusOverdue}>OVERDUE</span></td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 🔹 BLOCK 5: DAILY SUMMARY (Placeholder) */}
        <section style={{ ...styles.panel, gridColumn: "span 12", minHeight: "400px" }}>
          <div style={{...styles.panelHeader, borderBottom: "1px solid #222", paddingBottom: "16px"}}>
            <div>
              <h2 style={{...styles.panelTitle, fontSize: "16px", color: "#FFF"}}>Daily Summary</h2>
              <span style={styles.meta}>Real-time analysis pending...</span>
            </div>
          </div>
          <div style={styles.summaryContent}>
            <p style={styles.summaryText}>
                Connect the Neural Engine (OpenAI) to generate the daily situation report based on the {stats.messages} ingested messages.
            </p>
          </div>
        </section>

        {/* 🔹 BLOCK 4: SYSTEM HEALTH (WIRED) */}
        <section style={{ ...styles.panel, gridColumn: "span 12", flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", background: "#0D0D0D" }}>
          <div style={{display: "flex", gap: "24px"}}>
            <div style={styles.healthItem}>
              <span style={styles.meta}>STATUS</span>
              <span style={{color: "#2ED47A", fontWeight: "700", fontSize: "12px"}}>● {stats.status}</span>
            </div>
            <div style={styles.healthItem}>
              <span style={styles.meta}>LAST SYNC</span>
              <span style={{color: "#CCC", fontSize: "12px"}}>{stats.lastSync}</span>
            </div>
            <div style={styles.healthItem}>
              <span style={styles.meta}>INGESTED</span>
              <span style={{color: "#CCC", fontSize: "12px"}}>{stats.messages} Messages</span>
            </div>
          </div>
          <span style={styles.meta}>v1.0.6</span>
        </section>

      </main>
    </div>
  );
}

/* ──────────────── STYLES (UNCHANGED) ──────────────── */
const styles = {
  page: { backgroundColor: "#0B0B0B", color: "#E5E7EB", minHeight: "100vh", width: "100%", fontFamily: "'Inter', sans-serif", paddingBottom: "40px" },
  loading: { height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0B0B0B", color: "#666", letterSpacing: "0.1em", fontSize: "12px" },
  topNav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 32px", height: "64px", background: "rgba(11, 11, 11, 0.95)", borderBottom: "1px solid #1F1F1F", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(10px)" },
  logo: { fontSize: "14px", fontWeight: "800", letterSpacing: "0.1em", color: "#FFF" },
  navRight: { display: "flex", alignItems: "center", gap: "24px" },
  navControl: { display: "flex", alignItems: "center", gap: "8px" },
  navLabel: { fontSize: "10px", color: "#666", fontWeight: "600", letterSpacing: "0.05em" },
  navSelect: { background: "transparent", border: "none", color: "#FFF", fontSize: "12px", fontWeight: "500", cursor: "pointer", outline: "none", fontFamily: "inherit" },
  generateBtn: { background: "#FFF", color: "#000", border: "none", padding: "6px 12px", fontSize: "11px", fontWeight: "700", borderRadius: "2px", cursor: "pointer", letterSpacing: "0.05em" },
  divider: { width: "1px", height: "16px", background: "#333" },
  icon: { fontSize: "14px", cursor: "pointer", opacity: 0.7 },
  avatar: { width: "24px", height: "24px", borderRadius: "50%", background: "#222", color: "#AAA", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600" },
  grid: { display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "24px", padding: "32px", maxWidth: "1600px", margin: "0 auto" },
  panel: { background: "#121212", border: "1px solid #1F1F1F", borderRadius: "6px", display: "flex", flexDirection: "column", padding: "24px" },
  panelHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  panelTitle: { fontSize: "12px", fontWeight: "700", color: "#888", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 },
  liveDot: { width: "6px", height: "6px", background: "#2ED47A", borderRadius: "50%", boxShadow: "0 0 8px #2ED47A" },
  statItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" },
  statValue: { fontSize: "24px", fontWeight: "600", color: "#FFF" },
  statLabel: { fontSize: "11px", color: "#666", fontWeight: "500" },
  statSeparator: { width: "1px", height: "32px", background: "#222" },
  alertList: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" },
  alertItem: { background: "#181818", padding: "12px 16px", borderRadius: "4px" },
  alertHeader: { display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "10px" },
  alertBody: { fontSize: "13px", color: "#E5E7EB", lineHeight: "1.4" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "13px" },
  th: { textAlign: "left", color: "#666", paddingBottom: "12px", fontSize: "11px", fontWeight: "600" },
  tr: { borderBottom: "1px solid #1F1F1F" },
  td: { padding: "12px 0", color: "#CCC" },
  textBtn: { background: "none", border: "none", color: "#666", fontSize: "11px", cursor: "pointer" },
  statusOpen: { background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "2px", fontSize: "10px", fontWeight: "600", color: "#FFF" },
  statusOverdue: { background: "rgba(255, 90, 95, 0.2)", padding: "2px 6px", borderRadius: "2px", fontSize: "10px", fontWeight: "600", color: "#FF5A5F" },
  statusDone: { background: "rgba(46, 212, 122, 0.2)", padding: "2px 6px", borderRadius: "2px", fontSize: "10px", fontWeight: "600", color: "#2ED47A" },
  summaryContent: { display: "flex", flexDirection: "column", gap: "32px", marginTop: "16px" },
  summaryText: { fontSize: "14px", lineHeight: "1.6", color: "#CCC", maxWidth: "800px" },
  outlineBtn: { background: "transparent", border: "1px solid #333", color: "#888", padding: "4px 10px", fontSize: "11px", borderRadius: "2px", cursor: "pointer" },
  healthItem: { display: "flex", flexDirection: "column", gap: "2px" },
  meta: { fontSize: "10px", color: "#666", fontWeight: "500" },
};
