export default function DashboardLayout({ children }) {
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
  button: {
    background: "#4C6FFF",
    border: "none",
    color: "#FFF",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

