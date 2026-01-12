"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // 🔒 Auth guard
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) router.push("/login");
      else setLoading(false);
    };
    checkUser();
  }, [router]);

  if (loading) {
    return <div style={styles.loading}>INITIALIZING SIGNALS…</div>;
  }

  return (
    <div style={styles.page}>

      {/* ───────── TOP NAV ───────── */}
      <header style={styles.topNav}>
        <div style={styles.brand}>BLACK RABBIT</div>

        <div style={styles.navRight}>
          {/* Sources */}
          <div style={styles.dropdown}>Slack ▾</div>

          {/* Time Range */}
          <div style={styles.dropdown}>Last 24h ▾</div>

          {/* Actions */}
          <button style={styles.outlineBtn}>Generate Now</button>
          <div style={styles.icon}>🔔</div>
          <div style={styles.avatar}>AM</div>
        </div>
      </header>

      {/* ───────── GRID ───────── */}
      <main style={styles.grid}>

        {/* BLOCK 1 — ACTIVITY SNAPSHOT */}
        <section style={{ ...styles.panel, gridColumn: "span 12" }}>
          <h3 style={styles.panelTitle}>Activity Snapshot</h3>
          <div style={styles.statsRow}>
            <Stat value="124" label="Messages" />
            <Stat value="7" label="Active Conversations" />
            <Stat value="12" label="Participants" />
            <Stat value="1" label="Source Connected" />
          </div>
        </section>

        {/* BLOCK 2 — NEEDS ATTENTION */}
        <section style={{ ...styles.panel, gridColumn: "span 6", borderLeft: "4px solid #FFB020" }}>
          <h3 style={styles.panelTitle}>Needs Attention</h3>

          <Attention
            icon="⚠️"
            title="Pricing decision unresolved"
            meta="#exec • raised 3x • 12h ago"
          />
          <Attention
            icon="🛑"
            title="Launch assets missing"
            meta="#marketing • blocking release"
          />
        </section>

        {/* BLOCK 3 — ACTION ITEMS */}
        <section style={{ ...styles.panel, gridColumn: "span 6" }}>
          <h3 style={styles.panelTitle}>Action Items</h3>

          <table style={styles.table}>
            <thead>
              <tr>
                <th>Task</th>
                <th>Owner</th>
                <th>Source</th>
                <th>Age</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Decide launch pricing</td>
                <td>Alex</td>
                <td>Slack</td>
                <td>18h</td>
                <td><span style={styles.badgeOpen}>OPEN</span></td>
              </tr>
              <tr>
                <td>Approve landing copy</td>
                <td>Becca</td>
                <td>Teams</td>
                <td>2d</td>
                <td><span style={styles.badgeOverdue}>OVERDUE</span></td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* BLOCK 4 — SYSTEM HEALTH */}
        <section style={{ ...styles.panel, gridColumn: "span 12", opacity: 0.9 }}>
          <h3 style={styles.panelTitle}>System Health</h3>
          <div style={styles.healthRow}>
            <span>Last Sync</span>
            <span>5 minutes ago</span>
          </div>
          <div style={styles.healthRow}>
            <span>Messages Ingested Today</span>
            <span>312</span>
          </div>
          <div style={styles.healthRow}>
            <span>Status</span>
            <span style={{ color: "#2ED47A" }}>Healthy</span>
          </div>
        </section>

        {/* BLOCK 5 — DAILY SUMMARY */}
        <section style={{ ...styles.panel, gridColumn: "span 12" }}>
          <h3 style={styles.panelTitle}>
            Daily Summary — Jan 12
            <span style={styles.subtle}> • Generated 6:00 PM • Slack</span>
          </h3>

          <p style={styles.summaryText}>
            Today focused on launch pricing and marketing alignment ahead of the release.
          </p>

          <h4 style={styles.subheading}>Key Takeaways</h4>
          <ul style={styles.list}>
            <li>Pricing debate centered on $29 vs $39</li>
            <li>Launch timeline blocked on assets</li>
            <li>No critical incidents detected</li>
          </ul>
        </section>

      </main>
    </div>
  );
}

/* ───────── COMPONENTS ───────── */

function Stat({ value, label }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

function Attention({ icon, title, meta }) {
  return (
    <div style={styles.attentionRow}>
      <span>{icon}</span>
      <div>
        <div style={styles.attentionTitle}>{title}</div>
        <div style={styles.attentionMeta}>{meta}</div>
      </div>
    </div>
  );
}

/* ───────── STYLES ───────── */

const styles = {
  page: {
    background: "#0B0B0B",
    color: "#FFFFFF",
    minHeight: "100vh",
  },
  loading: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "monospace",
    letterSpacing: "0.15em",
  },

  topNav: {
    height: 64,
    padding: "0 32px",
    borderBottom: "1px solid #1F1F1F",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: {
    fontWeight: 600,
    letterSpacing: "0.12em",
    fontSize: 13,
  },
  navRight: {
    display: "flex",
    gap: 16,
    alignItems: "center",
  },
  dropdown: {
    fontSize: 12,
    color: "#A1A1A1",
    cursor: "pointer",
  },
  outlineBtn: {
    background: "transparent",
    border: "1px solid #2A2A2A",
    color: "#FFFFFF",
    padding: "6px 12px",
    borderRadius: 4,
    fontSize: 12,
  },
  icon: { opacity: 0.7 },
  avatar: {
    background: "#1F1F1F",
    borderRadius: "50%",
    width: 28,
    height: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(12, 1fr)",
    gap: 24,
    padding: 32,
  },

  panel: {
    background: "#121212",
    border: "1px solid #1F1F1F",
    borderRadius: 6,
    padding: 24,
  },
  panelTitle: {
    fontSize: 13,
    color: "#A1A1A1",
    marginBottom: 16,
    fontWeight: 600,
  },

  statsRow: {
    display: "flex",
    gap: 32,
  },
  statCard: {
    display: "flex",
    flexDirection: "column",
  },
  statValue: {
    fontSize: 28,
    fontWeight: 600,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },

  attentionRow: {
    display: "flex",
    gap: 12,
    padding: "12px 0",
    borderBottom: "1px solid #1F1F1F",
  },
  attentionTitle: {
    fontSize: 13,
    fontWeight: 500,
  },
  attentionMeta: {
    fontSize: 11,
    color: "#666",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
  },
  badgeOpen: {
    background: "#1F1F1F",
    padding: "4px 8px",
    borderRadius: 4,
    fontSize: 11,
  },
  badgeOverdue: {
    background: "#1F1F1F",
    color: "#FF5A5F",
    padding: "4px 8px",
    borderRadius: 4,
    fontSize: 11,
  },

  healthRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12,
    color: "#A1A1A1",
    marginBottom: 8,
  },

  summaryText: {
    fontSize: 16,
    lineHeight: 1.6,
    color: "#E5E7EB",
    marginBottom: 16,
  },
  subheading: {
    fontSize: 13,
    marginBottom: 8,
  },
  list: {
    paddingLeft: 18,
    lineHeight: 1.6,
    color: "#A1A1A1",
  },
  subtle: {
    fontSize: 11,
    color: "#666",
    marginLeft: 8,
  },
};
