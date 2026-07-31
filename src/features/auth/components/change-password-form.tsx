"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    // Eye open
    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ) : (
    // Eye slash
    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  placeholder = "••••••••",
  required = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-1">
      <label className="text-xs" style={{ color: "rgba(233,207,232,0.5)" }}>{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          required={required}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(249,102,171,0.15)",
            borderRadius: "0.625rem",
            padding: "0.5rem 2.5rem 0.5rem 0.75rem",
            fontSize: "0.875rem",
            color: "#E9CFE8",
            outline: "none",
          }}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-80"
          style={{ color: "rgba(233,207,232,0.4)" }}
          tabIndex={-1}
          aria-label={show ? "Sembunyikan sandi" : "Tampilkan sandi"}
        >
          <EyeIcon open={show} />
        </button>
      </div>
    </div>
  );
}

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

    // Verifikasi sandi lama via re-sign-in
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

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-3" style={{ borderTop: "1px solid rgba(249,102,171,0.08)" }}>
      <p className="text-sm font-semibold" style={{ color: "#E9CFE8" }}>Perbarui Sandi</p>

      <PasswordField
        label="Sandi saat ini"
        value={currentPassword}
        onChange={setCurrentPassword}
      />
      <PasswordField
        label="Sandi baru"
        value={newPassword}
        onChange={setNewPassword}
      />
      <PasswordField
        label="Konfirmasi sandi baru"
        value={confirm}
        onChange={setConfirm}
      />

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
