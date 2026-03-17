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

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function validate() {
    if (!form.name.trim()) return "Name is required.";
    if (!form.role.trim()) return "Role is required.";
    if (!form.email.trim()) return "Email is required.";
    // basic email check
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Enter a valid email.";
    // image is optional but if provided, check URL-ish
    if (form.image && !/^https?:\/\/.+\..+/.test(form.image)) return "Enter a valid image URL (starts with http/https).";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const err = validate();
    if (err) {
      setMessage(err);
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
        status: "pending" // optional: mark pending for admin review
      });
      setMessage("Team member submitted. Thank you!");
      setForm({ name: "", role: "", bio: "", email: "", image: "" });
    } catch (error) {
      console.error(error);
      setMessage("Submission failed. Try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Add Team Member</h2>

      <label className="block mb-2">
        <span className="text-sm font-medium">Name</span>
        <input value={form.name} onChange={e => update("name", e.target.value)} className="mt-1 block w-full border rounded p-2" />
      </label>

      <label className="block mb-2">
        <span className="text-sm font-medium">Role</span>
        <input value={form.role} onChange={e => update("role", e.target.value)} className="mt-1 block w-full border rounded p-2" />
      </label>

      <label className="block mb-2">
        <span className="text-sm font-medium">Bio</span>
        <textarea value={form.bio} onChange={e => update("bio", e.target.value)} rows={4} className="mt-1 block w-full border rounded p-2" />
      </label>

      <label className="block mb-2">
        <span className="text-sm font-medium">Email</span>
        <input value={form.email} onChange={e => update("email", e.target.value)} className="mt-1 block w-full border rounded p-2" />
      </label>

      <label className="block mb-4">
        <span className="text-sm font-medium">Image URL</span>
        <input value={form.image} onChange={e => update("image", e.target.value)} placeholder="https://..." className="mt-1 block w-full border rounded p-2" />
        <p className="text-xs text-gray-500 mt-1">Paste an image link (host it on Imgur, Cloudinary, or your own hosting). Optional.</p>
      </label>

      {message && <div className="mb-3 text-sm text-red-600">{message}</div>}

      <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
        {loading ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}
