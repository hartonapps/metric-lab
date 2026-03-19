"use client";
import React, { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { User } from "firebase/auth";

type FormState = {
  name: string;
  role: string;
  bio: string;
  email: string;
  image: string;
};

type TeamFormProps = {
  user: User;
  balance: number;
  setBalance: (b: number | ((prev: number) => number)) => void;
};

export default function TeamForm({ user, balance, setBalance }: TeamFormProps) {
  const [form, setForm] = useState<FormState>({
    name: "",
    role: "",
    bio: "",
    email: "",
    image: "",
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
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
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate() {
    if (!form.name.trim()) return "Name is required.";
    if (!form.role.trim()) return "Role is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Enter a valid email.";
    if (!form.image) return "Upload an image.";
    return null;
  }

  async function handleImageUpload(file: File) {
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_KEY;
    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    setMessage("Uploading image...");
    setMessageType(null);

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        update("image", data.data.url);
        setMessage("Image uploaded successfully ✅");
        setMessageType("success");
      } else {
        throw new Error();
      }
    } catch {
      setMessage("Image upload failed ❌");
      setMessageType("error");
    } finally {
      setUploading(false);
    }
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

    const SUBMISSION_FEE = 100;

    if (balance < SUBMISSION_FEE) {
      setMessage("Insufficient balance. Please fund your wallet.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/deduct-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          amount: SUBMISSION_FEE,
          type: "team_submission",
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setMessage(data.message || "Payment failed");
        setMessageType("error");
        setLoading(false);
        return;
      }

      await addDoc(collection(db, "teams"), {
        ...form,
        userId: user.uid,
        createdAt: serverTimestamp(),
        status: "pending",
      });

      setBalance(data.newBalance);

      setMessage("Submitted successfully ✅ (₦100 deducted)");
      setMessageType("success");

      setForm({
        name: "",
        role: "",
        bio: "",
        email: "",
        image: "",
      });
    } catch (err) {
      console.error(err);
      setMessage("Submission failed. Try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  function Notice() {
    if (!showNotice) return null;

    return (
      <div className="fixed top-0 left-0 w-full z-50 px-4 py-3 text-xs sm:text-sm flex justify-between items-center bg-green-500/10 backdrop-blur border-b border-green-400/20 text-green-300">
        <p className="pr-2">
          Submissions are free for now. Starting {nextMonday}, a fee may apply.
        </p>
        <button onClick={() => setShowNotice(false)}>✕</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-start sm:items-center px-3 py-16 sm:py-10 bg-[#020617]">

      <Notice />

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md sm:max-w-xl p-5 sm:p-8 rounded-2xl border border-white/10 shadow-xl backdrop-blur-md"
        style={{
          background: "linear-gradient(135deg, #020617 0%, #0f172a 100%)",
          color: "white",
        }}
      >
        {/* HEADER */}
        <div className="mb-5 text-center">
          <p className="text-xs sm:text-sm text-gray-400 break-all">
            {user.email}
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold mt-2">
            Add Team Member
          </h2>
        </div>

        {/* INPUTS */}
        <div className="space-y-3">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="w-full px-3 py-3 rounded-lg bg-white/5 text-sm outline-none focus:ring-2 focus:ring-green-500"
          />

          <input
            placeholder="Role"
            value={form.role}
            onChange={(e) => update("role", e.target.value)}
            className="w-full px-3 py-3 rounded-lg bg-white/5 text-sm outline-none focus:ring-2 focus:ring-green-500"
          />

          <textarea
            placeholder="Bio"
            value={form.bio}
            onChange={(e) => update("bio", e.target.value)}
            rows={3}
            className="w-full px-3 py-3 rounded-lg bg-white/5 text-sm outline-none focus:ring-2 focus:ring-green-500"
          />

          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="w-full px-3 py-3 rounded-lg bg-white/5 text-sm outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* IMAGE */}
        <div className="mt-4">
          <input
            type="file"
            accept="image/*"
            className="text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }}
          />

          {uploading && (
            <p className="text-yellow-400 text-xs mt-2">Uploading image...</p>
          )}

          {form.image && (
            <img
              src={form.image}
              alt="preview"
              className="mt-3 w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border"
            />
          )}
        </div>

        {/* MESSAGE */}
        {message && (
          <p
            className={`mt-3 text-sm ${
              messageType === "error" ? "text-red-400" : "text-green-400"
            }`}
          >
            {message}
          </p>
        )}

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading || uploading || balance < 100}
          className="w-full mt-5 py-3 rounded-lg bg-green-500 text-black font-medium disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>

        {/* FOOTER */}
        <a
          href="https://whatsapp.com/channel/0029Vb7qb8Z5kg6zV4uG8E0z"
          target="_blank"
          className="block text-center mt-4 text-green-400 text-sm underline"
        >
          Need help? Contact us
        </a>
      </form>
    </div>
  );
}