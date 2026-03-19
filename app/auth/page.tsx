"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebaseClient";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) router.push("/add-team"); // redirect if logged in
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setMessage("Signup successful ✅");
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage("Login successful ✅");
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setMessage("Logged out ✅");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
      <div className="p-6 rounded-lg bg-gray-800 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Login / Signup</h2>

        {message && <p className="mb-3 text-center text-green-400">{message}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded bg-gray-700 text-white"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded bg-gray-700 text-white"
        />

        <div className="flex justify-between">
          <button
            onClick={handleSignup}
            className="bg-green-500 px-4 py-2 rounded hover:bg-green-400"
          >
            Signup
          </button>
          <button
            onClick={handleLogin}
            className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-400"
          >
            Login
          </button>
          {user && (
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded hover:bg-red-400"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}