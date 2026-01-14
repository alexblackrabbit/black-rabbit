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

        // Email confirmation ON case
        if (!data.session) {
          setMessage("Check your email to confirm your account.");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>BLACK RABBIT</div>

        <h1 style={styles.heading}>
          {mode === "login" ? "Sign In" : "Create Account"}
        </h1>

        <input
          style={styles.input}
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Password"
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
              New here?{" "}
              <span onClick={() => setMode("register")} style={styles.link}>
                Create an account
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span onClick={() => setMode("login")} style={styles.link}>
                Sign in
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
    background: "radial-gradient(circle at top, #111 0%, #000 60%)",
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
    borderRadius: "12px",
    padding: "48px",
    boxShadow: "0 40px 120px rgba(0,0,0,0.6)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  logo: {
    fontWeight: "800",
    letterSpacing: "0.15em",
    fontSize: "12px",
    color: "#777",
    marginBottom: "8px",
    textAlign: "center",
  },
  heading: {
    fontSize: "26px",
    fontWeight: "800",
    textAlign: "center",
    marginBottom: "24px",
    color: "#FFD400", // bright yellow
  },
  input: {
    background: "#111",
    border: "1px solid #222",
    borderRadius: "6px",
    padding: "14px",
    fontSize: "14px",
    color: "#fff",
    outline: "none",
  },
  button: {
    marginTop: "12px",
    background: "#FFD400",
    color: "#000",
    border: "none",
    borderRadius: "6px",
    padding: "14px",
    fontWeight: "800",
    fontSize: "13px",
    letterSpacing: "0.1em",
    cursor: "pointer",
  },
  switch: {
    marginTop: "16px",
    textAlign: "center",
    fontSize: "12px",
    color: "#888",
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
    fontSize: "12px",
  },
  message: {
    background: "rgba(255,212,0,0.15)",
    color: "#FFD400",
    padding: "10px",
    borderRadius: "6px",
    fontSize: "12px",
  },
};
