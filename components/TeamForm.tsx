"use client";
import React, { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

type FormState = {
  name: string;
  role: string;
  bio: string;
  email: string;
  image: string;
};

export default function TeamForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    role: "",
    bio: "",
    email: "",
    image: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"error" | "success" | null>(null);
  const [showNotice, setShowNotice] = useState(true);
  const [nextMonday, setNextMonday] = useState("");

  useEffect(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = (8 - day) % 7 || 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);

    setNextMonday(
      monday.toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "short",
      })
    );
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function validate() {
    if (!form.name.trim()) return "Name is required.";
    if (!form.role.trim()) return "Role is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Enter a valid email.";
    if (!form.image.trim()) return "Image is required.";
    if (!/^https?:\/\/.+\..+/.test(form.image))
      return "Paste a valid image link.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setMessageType(null);

    const err = validate();
    if (err) {
      setMessage(err);
      setMessageType("error");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "teams"), {
        ...form,
        createdAt: serverTimestamp(),
        status: "pending",
      });

      setMessage("Submitted successfully ✅");
      setMessageType("success");
      setForm({ name: "", role: "", bio: "", email: "", image: "" });
    } catch (error) {
      setMessage("Submission failed. Try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">

      {/* TOP NOTICE */}
      {showNotice && (
        <div className="fixed top-0 left-0 w-full bg-green-500/10 backdrop-blur-md border-b border-green-400/20 text-green-300 text-sm px-4 py-3 flex justify-between z-50">
          <p>
            Submissions are free for now. Starting {nextMonday}, a small fee may apply.
          </p>
          <button onClick={() => setShowNotice(false)}>✕</button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl p-8 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md"
        style={{
          background: "linear-gradient(135deg, #020617 0%, #0f172a 100%)",
          color: "white",
        }}
      >
        <h2 className="text-3xl font-semibold mb-6 text-center">
          Add Team Member
        </h2>

        {/* NAME */}
        <label className="block mb-4">
          <span className="text-sm text-white/70">Name</span>
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Full name"
            className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-green-400 focus:ring-2 focus:ring-green-500"
          />
        </label>

        {/* ROLE */}
        <label className="block mb-4">
          <span className="text-sm text-white/70">Role</span>
          <input
            value={form.role}
            onChange={(e) => update("role", e.target.value)}
            placeholder="E.g, Shopify Consultant"
            className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-green-400 focus:ring-2 focus:ring-green-500"
          />
        </label>

        {/* BIO */}
        <label className="block mb-4">
          <span className="text-sm text-white/70">Bio</span>
          <textarea
            value={form.bio}
            onChange={(e) => update("bio", e.target.value)}
            rows={4}
            placeholder="Short intro... One Sentence. Use chatgpt"
            className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-green-400 focus:ring-2 focus:ring-green-500"
          />
        </label>

        {/* EMAIL */}
        <label className="block mb-4">
          <span className="text-sm text-white/70">Email</span>
          <input
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="name@example.com"
            className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-green-400 focus:ring-2 focus:ring-green-500"
          />
        </label>

        {/* IMAGE (FIXED 🔥) */}
        <label className="block mb-5">
          <span className="text-sm text-white/70">Profile Image (Required)</span>
          <input
            value={form.image}
            onChange={(e) => update("image", e.target.value)}
            placeholder="Paste image link here"
            className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-green-400 focus:ring-2 focus:ring-green-500"
          />

          <p className="text-xs text-white/60 mt-2 leading-relaxed">
            Upload your photo on{" "}
            <a
              href="https://postimage.org/"
              target="_blank"
              className="text-green-400 underline"
            >
              postimage.org
            </a>{" "}
            → upload → copy the **direct image link** → paste it here.
          </p>
        </label>

        {/* MESSAGE */}
        {message && (
          <div
            className={`mb-4 text-sm ${
              messageType === "error"
                ? "text-red-400"
                : "text-green-400"
            }`}
          >
            {message}
          </div>
        )}

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg bg-green-500 hover:bg-green-400 text-black font-medium"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>

        {/* WHATSAPP */}
        <a
          href="https://whatsapp.com/channel/0029Vb7qb8Z5kg6zV4uG8E0z"
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-4 text-center text-sm text-green-400 hover:text-green-300 underline"
        >
          Have a complaint or suggestion? Talk to us
        </a>
      </form>
    </div>
  );
  }
