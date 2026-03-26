"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebaseClient";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        router.replace("/add-team");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const submit = async () => {
    setMessage("");

    if (!email.trim() || !password.trim()) {
      setMessage("Email and password are required.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
        setMessage("Account created. Redirecting...");
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        setMessage("Login successful. Redirecting...");
      }
    } catch (err: any) {
      setMessage(err?.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4 text-white">
      <div className="w-full max-w-md rounded-xl bg-gray-800 p-6 shadow-xl">
        <h2 className="mb-1 text-2xl font-bold">{isSignup ? "Create account" : "Sign in"}</h2>
        <p className="mb-5 text-sm text-gray-300">Use your account to manage wallet, slots, and team submissions.</p>

        {message && <p className="mb-3 text-sm text-green-300">{message}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3 w-full rounded bg-gray-700 px-3 py-2 text-white outline-none ring-1 ring-transparent focus:ring-blue-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded bg-gray-700 px-3 py-2 text-white outline-none ring-1 ring-transparent focus:ring-blue-500"
        />

        <button
          onClick={() => void submit()}
          disabled={loading}
          className="w-full rounded bg-blue-600 px-4 py-2 font-medium transition hover:bg-blue-500 disabled:opacity-60"
        >
          {loading ? "Please wait..." : isSignup ? "Create account" : "Sign in"}
        </button>

        <button
          onClick={() => setIsSignup((v) => !v)}
          className="mt-3 w-full text-sm text-blue-300 underline"
        >
          {isSignup ? "Already have an account? Sign in" : "Need an account? Create one"}
        </button>
      </div>
    </div>
  );
}