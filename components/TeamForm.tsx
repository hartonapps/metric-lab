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
  const [showNotice, setShowNotice] = useState(true);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function validate() {
    if (!form.name.trim()) return "Name is required.";
    if (!form.role.trim()) return "Role is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Enter a valid email.";
    if (form.image && !/^https?:\/\/.+\..+/.test(form.image))
      return "Enter a valid image URL.";
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

      setMessage("Team member submitted successfully 🚀");
      setMessageType("success");
      setForm({ name: "", role: "", bio: "", email: "", image: "" });
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong. Try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      
      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl p-8 rounded-2xl shadow-2xl backdrop-blur-md border border-white/10"
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #020617 100%)",
          color: "white",
        }}
      >
        <h2 className="text-3xl font-semibold mb-6 text-center">
          Add Team Member
        </h2>

        {/* INPUTS */}
        {[
          { label: "Name", key: "name", placeholder: "Full name" },
          { label: "Role", key: "role", placeholder: "Designer, Engineer..." },
        ].map((field) => (
          <label key={field.key} className="block mb-4">
            <span className="text-sm text-white/80">{field.label}</span>
            <input
              value={form[field.key as keyof FormState] as string}
              onChange={(e) =>
                update(field.key as keyof FormState, e.target.value)
              }
              placeholder={field.placeholder}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-green-400 focus:ring-2 focus:ring-green-500 outline-none transition"
            />
          </label>
        ))}

        {/* BIO */}
        <label className="block mb-4">
          <span className="text-sm text-white/80">Bio</span>
          <textarea
            value={form.bio}
            onChange={(e) => update("bio", e.target.value)}
            rows={4}
            placeholder="Short bio..."
            className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-green-400 focus:ring-2 focus:ring-green-500 outline-none transition"
          />
        </label>

        {/* EMAIL */}
        <label className="block mb-4">
          <span className="text-sm text-white/80">Email</span>
          <input
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="name@example.com"
            className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-green-400 focus:ring-2 focus:ring-green-500 outline-none transition"
          />
        </label>

        {/* IMAGE */}
        <label className="block mb-5">
          <span className="text-sm text-white/80">Image URL</span>
          <input
            value={form.image}
            onChange={(e) => update("image", e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-green-400 focus:ring-2 focus:ring-green-500 outline-none transition"
          />
          <p className="text-xs text-white/50 mt-1">
            Optional — use Imgur, Cloudinary, etc.
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
          className="w-full py-2 rounded-lg bg-green-500 hover:bg-green-400 transition font-medium text-black"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>

        {/* WHATSAPP LINK */}
        <a
          href="https://whatsapp.com/channel/0029Vb7qb8Z5kg6zV4uG8E0z"
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-4 text-center text-sm text-green-400 hover:text-green-300 underline"
        >
          Have a complaint? Reach us on WhatsApp
        </a>
      </form>

      {/* FLOATING NOTICE */}
      {showNotice && (
        <div className="fixed bottom-5 right-5 max-w-sm bg-white/10 backdrop-blur-lg border border-white/10 text-white p-4 rounded-xl shadow-xl">
          <p className="text-sm leading-relaxed">
            Heads up 👋 — Starting next week Monday (21st), adding team members
            may require a small payment.
          </p>

          <button
            onClick={() => setShowNotice(false)}
            className="mt-3 text-xs text-green-300 hover:text-green-200 underline"
          >
            Got it
          </button>
        </div>
      )}
    </div>
  );
        }
