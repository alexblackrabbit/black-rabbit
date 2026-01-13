"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"; // <--- The only change: New Auth Engine
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const supabase = createClientComponentClient(); // <--- Initialize the engine

  const handleLogin = async () => {
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      // Refresh the router so the new cookie is recognized
      router.refresh();
      router.push("/dashboard");
    }
  };

  return (
    <>
      <h1>Log in</h1>
      <p>Decision intelligence for serious teams.</p>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Continue</button>

      {error && <div className="error">{error}</div>}

      <p>
        No account? <a href="/signup">Sign up</a>
      </p>
    </>
  );
}
