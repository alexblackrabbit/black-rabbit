"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function MissionControl() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);

  // ───────── REAL DATA STATE ─────────
  const [stats, setStats] = useState({
    messages: 0,
    newMessages: 0,
    channels: 0,
    participants: 0,
    lastSync: "Pending...",
    status: "CONNECTING"
  });

  const [needsAttention, setNeedsAttention] = useState([]);

  // ───────── AUTH + DATA INIT ─────────
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();

      if (!user || !session) {
        router.push("/login");
        return;
      }

      try {
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Fetch dashboard stats
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

        // Fetch Needs Attention
        const naRes = await fetch("/api/dashboard/needs-attention");
        const naData = await naRes.json();

        if (Array.isArray(naData.items)) {
          setNeedsAttention(naData.items);
        }
      } catch (e) {
        console.error("Dashboard init failed", e);
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
      {/* ───────── HEADER ───────── */}
      <nav style={styles.topNav}>
        <div style={styles.logo}>BLACK RABBIT</div>
        <div style={styles.navRight}>
          <button style={styles.generateBtn}>GENERATE NOW</button>
          <span style={styles.icon}>🔔</span>
          <div style={styles.avatar}>AM</div>
        </div>
      </nav>

      {/* ───────── DASHBOARD GRID ───────── */}
      <main style={styles.grid}>
        {/* ACTIVITY SNAPSHOT */}
        <section style={{ ...styles.panel, gridColumn: "span 12", flexDirection: "row", justifyContent: "space-around" }}>
          <div style={styles.statItem}>
            <span style={styles.statValue}>{stats.messages}</span>
            <span style={styles.statLabel}>Messages</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statValue}>{stats.channels}</span>
            <span style={styles.statLabel}>Channels</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statValue}>{stats.participants}</span>
            <span style={styles.statLabel}>Participants</span>
          </div>
        </section>

        {/* ───────── NEEDS ATTENTION (LIVE) ───────── */}
        <section style={{ ...styles.panel, gridColumn: "span 6" }}>
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

        {/* ACTION ITEMS (PLACEHOLDER) */}
        <section style={{ ...styles.panel, gridColumn: "span 6" }}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>Action Items</h2>
          </div>
          <div style={{ opacity: 0.6 }}>Coming next.</div>
        </section>
      </main>
    </div>
  );
}

/* ───────── STYLES ───────── */
const styles = {
  page: { backgroundColor: "#0B0B0B", color: "#E5E7EB", minHeight: "100vh" },
  loading: { height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#666" },
  topNav: { display: "flex", justifyContent: "space-between", padding: "16px 32px", borderBottom: "1px solid #222" },
  logo: { fontWeight: "800", letterSpacing: "0.1em" },
  navRight: { display: "flex", gap: "16px", alignItems: "center" },
  generateBtn: { background: "#FFF", color: "#000", border: "none", padding: "6px 12px", fontWeight: "700" },
  icon: { cursor: "pointer" },
  avatar: { width: 24, height: 24, borderRadius: "50%", background: "#222", display: "flex", alignItems: "center", justifyContent: "center" },
  grid: { display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "24px", padding: "32px" },
  panel: { background: "#121212", border: "1px solid #1F1F1F", borderRadius: 6, padding: 24 },
  panelHeader: { display: "flex", justifyContent: "space-between", marginBottom: 16 },
  panelTitle: { fontSize: 12, letterSpacing: "0.1em", color: "#888" },
  liveDot: { width: 6, height: 6, background: "#2ED47A", borderRadius: "50%" },
  statItem: { display: "flex", flexDirection: "column", alignItems: "center" },
  statValue: { fontSize: 24, fontWeight: "600" },
  statLabel: { fontSize: 11, color: "#666" },
  alertList: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 },
  alertItem: { background: "#181818", padding: "12px 16px", borderRadius: 4 },
  alertHeader: { display: "flex", justifyContent: "space-between", fontSize: 10 },
  alertBody: { fontSize: 13, lineHeight: 1.4 },
  meta: { fontSize: 10, color: "#666" }
};
