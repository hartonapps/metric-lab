"use client";

import React, { useState } from "react";
import { User } from "firebase/auth";
import { authedFetch } from "@/lib/clientAuth";

type FormState = {
  name: string;
  role: string;
  bio: string;
  email: string;
  image: string;
};

type TeamFormProps = {
  user: User;
  slots: number;
  onTeamSubmitted: (nextSlots: number) => void;
};

export default function TeamForm({ user, slots, onTeamSubmitted }: TeamFormProps) {
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

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate() {
    if (!form.name.trim()) return "Name is required.";
    if (!form.role.trim()) return "Role is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Enter a valid email.";
    if (!form.image) return "Upload an image first.";
    return null;
  }

  async function handleImageUpload(file: File) {
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_KEY;

    if (!apiKey) {
      setMessage("ImgBB key is missing. Add NEXT_PUBLIC_IMGBB_KEY.");
      setMessageType("error");
      return;
    }

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

      if (!data?.success || !data?.data?.url) {
        throw new Error("Upload failed");
      }

      update("image", data.data.url);
      setMessage("Image uploaded successfully.");
      setMessageType("success");
    } catch {
      setMessage("Image upload failed. Try a smaller image.");
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

    if (slots < 1) {
      setMessage("You have no slots left. Buy slots first.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const res = await authedFetch("/api/team-submit", {
        method: "POST",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        setMessage(data?.message || "Submission failed");
        setMessageType("error");
        return;
      }

      onTeamSubmitted(data.newSlots);

      setMessage("Team member submitted successfully.");
      setMessageType("success");
      setForm({
        name: "",
        role: "",
        bio: "",
        email: "",
        image: "",
      });
    } catch {
      setMessage("Submission failed. Try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-sm text-gray-500 break-all">Logged in as: {user.email}</p>
      <h2 className="mt-1 text-2xl font-bold text-gray-900">Create Team Entry</h2>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6 text-gray-900">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-green-500"
          />

          <input
            placeholder="Role"
            value={form.role}
            onChange={(e) => update("role", e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-green-500"
          />

          <textarea
            placeholder="Bio"
            value={form.bio}
            onChange={(e) => update("bio", e.target.value)}
            rows={4}
            className="rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-green-500 sm:col-span-2"
          />

          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-green-500 sm:col-span-2"
          />
        </div>

        <div>
          <input
            type="file"
            accept="image/*"
            className="text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }}
          />

          {form.image && (
            <img
              src={form.image}
              alt="preview"
              className="mt-3 h-20 w-20 rounded-full border object-cover"
            />
          )}
        </div>

        {message && (
          <p className={`text-sm ${messageType === "error" ? "text-red-600" : "text-green-600"}`}>
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || uploading || slots < 1}
          className="w-full rounded-lg bg-green-600 py-3 font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Team"}
        </button>
      </form>

      <a
        href="https://wa.me/2348100000000?text=Hi%20Metric%20Lab%2C%20I%20have%20a%20complaint%20or%20suggestion%20about%20Add%20Team."
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-block text-sm font-medium text-green-700 underline"
      >
        Complaint or suggestion on WhatsApp
      </a>
    </div>
  );
}