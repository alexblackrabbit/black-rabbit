"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); // login | register
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        if (!data.session) {
          setMessage("CHECK YOUR EMAIL TO CONFIRM YOUR ACCOUNT");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      setError(err.message.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>BLACK RABBIT</div>

        <h1 style={styles.heading}>
          {mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
        </h1>

        <input
          style={styles.input}
          placeholder="EMAIL"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="PASSWORD"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <div style={styles.error}>{error}</div>}
        {message && <div style={styles.message}>{message}</div>}

        <button
          style={styles.button}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading
            ? "PLEASE WAIT…"
            : mode === "login"
            ? "SIGN IN"
            : "REGISTER"}
        </button>

        <div style={styles.switch}>
          {mode === "login" ? (
            <>
              NEW HERE?{" "}
              <span onClick={() => setMode("register")} style={styles.link}>
                CREATE AN ACCOUNT
              </span>
            </>
          ) : (
            <>
              ALREADY HAVE AN ACCOUNT?{" "}
              <span onClick={() => setMode("login")} style={styles.link}>
                SIGN IN
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────── STYLES ───────────── */

const styles = {
  page: {
    height: "100vh",
    background: "radial-gradient(circle at top, #111 0%, #000 65%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter', sans-serif",
    color: "#fff",
  },

  card: {
    width: "420px",
    background: "#0B0B0B",
    border: "1px solid #1F1F1F",
    borderRadius: "14px",
    padding: "52px",
    boxShadow: "0 40px 140px rgba(0,0,0,0.7)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  /* BRAND — LUXURY LIGHT GREY */
  logo: {
    fontWeight: "800",
    letterSpacing: "0.14em",
    fontSize: "26px",
    color: "#C9CDD3", // refined light grey (luxury, not flat)
    textAlign: "center",
    marginBottom: "6px",
  },

  heading: {
    fontSize: "22px",
    fontWeight: "800",
    textAlign: "center",
    marginBottom: "28px",
    color: "#FFD400",
    letterSpacing: "0.14em",
  },

  input: {
    background: "#111",
    border: "1px solid #222",
    borderRadius: "6px",
    padding: "14px",
    fontSize: "13px",
    color: "#fff",
    outline: "none",
    letterSpacing: "0.04em",
  },

  button: {
    marginTop: "14px",
    background: "#FFD400",
    color: "#000",
    border: "none",
    borderRadius: "6px",
    padding: "14px",
    fontWeight: "800",
    fontSize: "12px",
    letterSpacing: "0.18em",
    cursor: "pointer",
  },

  switch: {
    marginTop: "18px",
    textAlign: "center",
    fontSize: "11px",
    color: "#888",
    letterSpacing: "0.08em",
  },

  link: {
    color: "#FFD400",
    cursor: "pointer",
    fontWeight: "700",
  },

  error: {
    background: "rgba(255,90,95,0.15)",
    color: "#FF5A5F",
    padding: "10px",
    borderRadius: "6px",
    fontSize: "11px",
    letterSpacing: "0.08em",
  },

  message: {
    background: "rgba(255,212,0,0.15)",
    color: "#FFD400",
    padding: "10px",
    borderRadius: "6px",
    fontSize: "11px",
    letterSpacing: "0.08em",
  },
};
