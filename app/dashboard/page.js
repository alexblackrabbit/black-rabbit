"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import DashboardLayout, { cardStyle } from "./DashboardLayout";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // 🔒 Auth protection
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
      <section style={cardStyle}>
        <h2 style={headingStyle}>Activity Snapshot</h2>

        <div style={statsStyle}>
          <div>
            <strong style={statNumber}>124</strong>
            <div style={statLabel}>Messages Today</div>
          </div>

          <div>
            <strong style={statNumber}>7</strong>
            <div style={statLabel}>Active Conversations</div>
          </div>

          <div>
            <strong style={statNumber}>12</strong>
            <div style={statLabel}>Participants</div>
          </div>
        </div>
      </section>

      {/* BLOCK 2 — NEEDS ATTENTION */}
      <section style={{ ...cardStyle, borderLeft: "4px solid #FFB020" }}>
        <h2 style={headingStyle}>Needs Attention</h2>

        <ul style={listStyle}>
          <li>Pricing decision unresolved in #exec</li>
          <li>Marketing assets blocking launch</li>
          <li>Onboarding ownership unclear</li>
        </ul>
      </section>

      {/* BLOCK 3 — ACTION ITEMS */}
      <section style={cardStyle}>
        <h2 style={headingStyle}>Action Items</h2>

        <table style={tableStyle}>
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
      <section style={{ ...cardStyle, opacity: 0.85 }}>
        <h2 style={headingStyle}>System Health</h2>
        <p>Last sync: 5 minutes ago</p>
        <p>Status: Healthy</p>
      </section>

      {/* BLOCK 5 — DAILY SUMMARY */}
      <section style={cardStyle}>
        <h2 style={headingStyle}>Daily Summary — Jan 12</h2>

        <p style={{ marginBottom: 16 }}>
          Today focused on pricing strategy and marketing alignment ahead of
          launch.
        </p>

        <h3 style={subheadingStyle}>Key Takeaways</h3>

        <ul style={listStyle}>
          <li>Pricing debate centered on $29 vs $39</li>
          <li>Launch timeline blocked on assets</li>
          <li>No critical risks detected</li>
        </ul>
      </section>

      {/* LOG OUT */}
      <button
        style={logoutButton}
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

/* ---------------- STYLES ---------------- */

const headingStyle = {
  marginBottom: 12,
  color: "#4C6FFF",
};

const subheadingStyle = {
  marginTop: 16,
  marginBottom: 8,
  color: "#FFFFFF",
};

const statsStyle = {
  display: "flex",
  gap: "32px",
};

const statNumber = {
  fontSize: "24px",
  fontWeight: 600,
};

const statLabel = {
  fontSize: "13px",
  color: "#A1A1A1",
};

const listStyle = {
  paddingLeft: 18,
  lineHeight: 1.6,
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const logoutButton = {
  background: "#1E1E1E",
  border: "1px solid #2A2A2A",
  color: "#FFFFFF",
  padding: "10px 16px",
  borderRadius: "6px",
  cursor: "pointer",
  marginTop: 32,
};
