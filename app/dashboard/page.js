"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

/**
 * Simple dashboard layout wrapper
 */
function DashboardLayout({ children }) {
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <strong>Black Rabbit</strong>
        <button style={styles.button}>Generate Now</button>
      </header>

      <main style={styles.main}>{children}</main>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // 🔒 Auth protection (KEEP THIS)
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/login");
      } else {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  if (loading) {
    return <p style={{ padding: 32 }}>Loading…</p>;
  }

  return (
    <DashboardLayout>
      {/* BLOCK 1 — ACTIVITY SNAPSHOT */}
      <section style={styles.card}>
        <h2 style={styles.heading}>Activity Snapshot</h2>
        <div style={styles.stats}>
          <div>
            <strong>124</strong>
            <span>Messages Today</span>
          </div>
          <div>
            <strong>7</strong>
            <span>Active Conversations</span>
          </div>
          <div>
            <strong>12</strong>
            <span>Participants</span>
          </div>
        </div>
      </section>

      {/* BLOCK 2 — NEEDS ATTENTION */}
      <section style={{ ...styles.card, borderLeft: "4px solid #FFB020" }}>
        <h2 style={styles.heading}>Needs Attention</h2>
        <ul>
          <li>Pricing decision unresolved in #exec</li>
          <li>Marketing assets blocking launch</li>
          <li>Onboarding ownership unclear</li>
        </ul>
      </section>

      {/* BLOCK 3 — ACTION ITEMS */}
      <section style={styles.card}>
        <h2 style={styles.heading}>Action Items</h2>
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
              <td>Decide launch pricing</td>
              <td>Alex</td>
              <td>Slack</td>
              <td>Open</td>
            </tr>
            <tr>
              <td>Deliver creative assets</td>
              <td>Becca</td>
              <td>Teams</td>
              <td style={{ color: "#FF5A5F" }}>Overdue</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* BLOCK 4 — SYSTEM HEALTH */}
      <section style={{ ...styles.card, opacity: 0.85 }}>
        <h2 style={styles.heading}>System Health</h2>
        <p>Last sync: 5 minutes ago</p>
        <p>Status: Healthy</p>
      </section>

      {/* BLOCK 5 — DAILY SUMMARY */}
      <section style={styles.card}>
        <h2 style={styles.heading}>Daily Summary — Jan 12</h2>
        <p>
          Today focused on pricing strategy and marketing alignment ahead of
          launch.
        </p>

        <h3 style={{ marginTop: 16 }}>Key Takeaways</h3>
        <ul>
          <li>Pricing debate centered on $29 vs $39</li>
          <li>Launch timeline blocked on assets</li>
          <li>No critical risks detected</li>
        </ul>
      </section>

      {/* LOG OUT (KEEP) */}
      <button
        style={{ ...styles.button, marginTop: 32 }}
        onClick={async () => {
          await supabase.auth.signOut();
          router.push("/login");
        }}
      >
        Log out
      </button>
    </DashboardLayout>
  );
}

/**
 * 🎨 Styles (dark, upscale)
 */
const styles = {
  page: {
    background: "#0B0B0B",
    color: "#FFFFFF",
    minHeight: "100vh",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    padding: "24px 32px",
    borderBottom: "1px solid #1E1E1E",
  },
  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "32px",
    display: "grid",
    gap: "24px",
  },
  card: {
    background: "#121212",
    border: "1px solid #1E1E1E",
    borderRadius: "12px",
    padding: "24px",
  },
  heading: {
    marginBottom: 12,
    color: "#4C6FFF",
  },
  stats: {
    display: "flex",
    gap: "32px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  button: {
    background: "#4C6FFF",
    border: "none",
    color: "#FFF",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
