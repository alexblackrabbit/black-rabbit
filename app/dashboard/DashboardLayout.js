/**
 * Dashboard layout wrapper
 * Handles dark theme, spacing, and header
 */

export default function DashboardLayout({ children }) {
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <strong style={styles.logo}>Black Rabbit</strong>

        <button style={styles.button}>
          Generate Now
        </button>
      </header>

      <main style={styles.main}>{children}</main>
    </div>
  );
}

/**
 * Global styles
 */
const styles = {
  page: {
    background: "#0B0B0B",
    color: "#FFFFFF",
    minHeight: "100vh",
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 32px",
    borderBottom: "1px solid #1E1E1E",
  },

  logo: {
    fontSize: "16px",
    fontWeight: 600,
    letterSpacing: "0.3px",
  },

  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "32px",
    display: "grid",
    gap: "24px",
  },

  button: {
    background: "#4C6FFF",
    border: "none",
    color: "#FFFFFF",
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
  },
};

/**
 * 🔲 Premium card style
 * Import and reuse this everywhere:
 *
 * <section style={cardStyle}>...</section>
 */
export const cardStyle = {
  background: "#121212",
  border: "1px solid #1E1E1E",
  borderRadius: "12px",
  padding: "24px",
};
