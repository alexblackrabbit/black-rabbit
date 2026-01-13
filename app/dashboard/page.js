"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
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

  // ✅ NEW: Needs Attention state
  const [needsAttention, setNeedsAttention] = useState([]);

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
            lastSync: realData.lastSync
              ? new Date(realData.lastSync + "Z").toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })
              : "Never",
            status: "OPTIMAL"
          });
        }
      } catch (e) {
        console.error("Stats fetch failed", e);
      }

      // ✅ NEW: Fetch Needs Attention (LIVE DATA)
      try {
        const naRes = await fetch("/api/dashboard/needs-attention");
        const naData = await naRes.json();

        if (Array.isArray(naData.items)) {
          setNeedsAttention(naData.items);
        }
      } catch (e) {
        console.error("Needs Attention fetch failed", e);
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
          <div style={styles.statItem}>
            <span style={styles.statValue}>{stats.messages}</span>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={styles.statLabel}>Messages</span>
              {stats.newMessages > 0 && (
                <span style={{ color: "#2ED47A", fontSize: "10px", fontWeight: "600", marginTop: "2px", letterSpacing: "0.05em" }}>
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

        {/* 🔹 BLOCK 2: NEEDS ATTENTION (LIVE, SAME DESIGN) */}
        <section style={{ ...styles.panel, gridColumn: "span 6", borderColor: "#333" }}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>Needs Attention</h2>
            <div style={styles.liveDot}></div>
          </div>

          <ul style={styles.alertList}>
            {needsAttention.length === 0 ? (
              <li style={{ ...styles.alertItem, opacity: 0.6 }}>
                No items need attention right now.
              </li>
            ) : (
              needsAttention.map((item) => {
                const t = item.tags || {};
                let label = "ATTENTION";
                let color = "#FFD166";

                if (t.is_blocker) {
                  label = "CRITICAL";
                  color = "#FF5A5F";
                } else if (t.is_urgent) {
                  label = "URGENT";
                  color = "#FFD166";
                }

                return (
                  <li
                    key={item.id}
                    style={{ ...styles.alertItem, borderLeft: `3px solid ${color}` }}
                  >
                    <div style={styles.alertHeader}>
                      <span style={{ color, fontWeight: "700" }}>{label}</span>
                      <span style={styles.meta}>
                        {item.author} •{" "}
                        {new Date(item.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                    <div style={styles.alertBody}>{item.text}</div>
                  </li>
                );
              })
            )}
          </ul>
        </section>

        {/* 🔹 BLOCK 3: ACTION ITEMS (UNCHANGED) */}
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

        {/* 🔹 BLOCK 5: DAILY SUMMARY (UNCHANGED) */}
        <section style={{ ...styles.panel, gridColumn: "span 12", minHeight: "400px" }}>
          <div style={{ ...styles.panelHeader, borderBottom: "1px solid #222", paddingBottom: "16px" }}>
            <div>
              <h2 style={{ ...styles.panelTitle, fontSize: "16px", color: "#FFF" }}>Daily Summary</h2>
              <span style={styles.meta}>Real-time analysis pending...</span>
            </div>
          </div>
          <div style={styles.summaryContent}>
            <p style={styles.summaryText}>
              Connect the Neural Engine (OpenAI) to generate the daily situation report based on the {stats.messages} ingested messages.
            </p>
          </div>
        </section>

        {/* 🔹 BLOCK 4: SYSTEM HEALTH (UNCHANGED) */}
        <section style={{ ...styles.panel, gridColumn: "span 12", flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", background: "#0D0D0D" }}>
          <div style={{ display: "flex", gap: "24px" }}>
            <div style={styles.healthItem}>
              <span style={styles.meta}>STATUS</span>
              <span style={{ color: "#2ED47A", fontWeight: "700", fontSize: "12px" }}>● {stats.status}</span>
            </div>
            <div style={styles.healthItem}>
              <span style={styles.meta}>LAST SYNC</span>
              <span style={{ color: "#CCC", fontSize: "12px" }}>{stats.lastSync}</span>
            </div>
            <div style={styles.healthItem}>
              <span style={styles.meta}>INGESTED</span>
              <span style={{ color: "#CCC", fontSize: "12px" }}>{stats.messages} Messages</span>
            </div>
          </div>
          <span style={styles.meta}>v1.0.6</span>
        </section>
      </main>
    </div>
  );
}

/* ──────────────── STYLES (UNCHANGED) ──────────────── */
const styles = { /* EXACTLY your original styles object, unchanged */ };
