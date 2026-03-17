// components/TeamForm.tsx
"use client";
import React, { useState } from "react";
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

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function validate() {
    if (!form.name.trim()) return "Name is required.";
    if (!form.role.trim()) return "Role is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Enter a valid email.";
    if (form.image && !/^https?:\/\/.+\..+/.test(form.image)) return "Enter a valid image URL (starts with http/https).";
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
        name: form.name.trim(),
        role: form.role.trim(),
        bio: form.bio.trim(),
        email: form.email.trim(),
        image: form.image.trim() || null,
        createdAt: serverTimestamp(),
        status: "pending",
      });
      setMessage("Team member submitted. Thank you!");
      setMessageType("success");
      setForm({ name: "", role: "", bio: "", email: "", image: "" });
    } catch (error) {
      console.error(error);
      setMessage("Submission failed. Try again later.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto p-6 rounded-lg shadow-lg"
      style={{ background: "linear-gradient(180deg,#071028 0%, #0b1220 100%)", color: "white" }}
    >
      <h2 className="text-2xl font-semibold mb-4 text-white">Add Team Member</h2>

      <label className="block mb-3">
        <span className="text-sm font-medium text-white/90">Name</span>
        <input
          value={form.name}
          onChange={e => update("name", e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Full name"
        />
      </label>

      <label className="block mb-3">
        <span className="text-sm font-medium text-white/90">Role</span>
        <input
          value={form.role}
          onChange={e => update("role", e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Designer, Engineer, etc."
        />
      </label>

      <label className="block mb-3">
        <span className="text-sm font-medium text-white/90">Bio</span>
        <textarea
          value={form.bio}
          onChange={e => update("bio", e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Short bio or role summary"
        />
      </label>

      <label className="block mb-3">
        <span className="text-sm font-medium text-white/90">Email</span>
        <input
          value={form.email}
          onChange={e => update("email", e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="name@example.com"
          inputMode="email"
        />
      </label>

      <label className="block mb-4">
        <span className="text-sm font-medium text-white/90">Image URL</span>
        <input
          value={form.image}
          onChange={e => update("image", e.target.value)}
          placeholder="https://..."
          className="mt-1 block w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <p className="text-xs text-white/60 mt-1">
          Paste an image link (Imgur, Cloudinary, or your own hosting). Optional.
        </p>
      </label>

      {message && (
        <div
          className={`mb-3 text-sm ${messageType === "error" ? "text-red-300" : "text-green-300"}`}
          role="status"
          aria-live="polite"
        >
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-md px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-medium"
      >
        {loading ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
  }
