"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirm, setConfirm]                 = useState("");
  const [loading, setLoading]                 = useState(false);
  const [message, setMessage]                 = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Sandi baru minimal 6 karakter." });
      return;
    }
    if (newPassword !== confirm) {
      setMessage({ type: "error", text: "Konfirmasi sandi tidak cocok." });
      return;
    }

    setLoading(true);
    const supabase = createClient();

    // Verifikasi sandi lama dengan re-sign-in
    const { data: userData } = await supabase.auth.getUser();
    const email = userData.user?.email ?? "";

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (signInError) {
      setLoading(false);
      setMessage({ type: "error", text: "Sandi saat ini tidak benar." });
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

    setLoading(false);

    if (updateError) {
      setMessage({ type: "error", text: updateError.message });
    } else {
      setMessage({ type: "success", text: "Sandi berhasil diperbarui." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    }
  }

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(249,102,171,0.15)",
    borderRadius: "0.625rem",
    padding: "0.5rem 0.75rem",
    fontSize: "0.875rem",
    color: "#E9CFE8",
    outline: "none",
  } as React.CSSProperties;

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-3" style={{ borderTop: "1px solid rgba(249,102,171,0.08)" }}>
      <p className="text-sm font-semibold" style={{ color: "#E9CFE8" }}>Perbarui Sandi</p>

      {/* Sandi saat ini */}
      <div className="space-y-1">
        <label className="text-xs" style={{ color: "rgba(233,207,232,0.5)" }}>Sandi saat ini</label>
        <input
          type="password"
          placeholder="••••••••"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
          required
          style={inputStyle}
        />
      </div>

      {/* Sandi baru */}
      <div className="space-y-1">
        <label className="text-xs" style={{ color: "rgba(233,207,232,0.5)" }}>Sandi baru</label>
        <input
          type="password"
          placeholder="••••••••"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
          style={inputStyle}
        />
      </div>

      {/* Konfirmasi sandi baru */}
      <div className="space-y-1">
        <label className="text-xs" style={{ color: "rgba(233,207,232,0.5)" }}>Konfirmasi sandi baru</label>
        <input
          type="password"
          placeholder="••••••••"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          style={inputStyle}
        />
      </div>

      {/* Feedback */}
      {message && (
        <p className="text-xs px-3 py-2 rounded-lg"
          style={{
            background: message.type === "success" ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
            border: `1px solid ${message.type === "success" ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}`,
            color: message.type === "success" ? "#34d399" : "#f87171",
          }}>
          {message.text}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
        style={{ background: "linear-gradient(135deg, #AE0849, #E21C70)" }}>
        {loading ? "Memperbarui..." : "Perbarui Sandi"}
      </button>
    </form>
  );
}
