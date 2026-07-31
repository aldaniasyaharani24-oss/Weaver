"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="size-8" />;

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Ganti ke Mode Siang" : "Ganti ke Mode Malam"}
      className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-105 active:scale-95 select-none"
      style={{
        background: isDark
          ? "rgba(249,102,171,0.12)"
          : "rgba(226,28,112,0.1)",
        border: isDark
          ? "1px solid rgba(249,102,171,0.25)"
          : "1px solid rgba(226,28,112,0.25)",
        color: isDark ? "#F966AB" : "#E21C70",
        boxShadow: isDark
          ? "0 0 12px rgba(249,102,171,0.15)"
          : "0 2px 8px rgba(226,28,112,0.1)",
      }}
    >
      {/* Track */}
      <div
        className="relative w-9 h-5 rounded-full transition-all duration-300"
        style={{
          background: isDark
            ? "linear-gradient(135deg, #191B37, #2a2d5a)"
            : "linear-gradient(135deg, #fbcfe8, #fce7f3)",
          border: isDark
            ? "1px solid rgba(249,102,171,0.3)"
            : "1px solid rgba(226,28,112,0.2)",
        }}
      >
        {/* Thumb */}
        <div
          className="absolute top-0.5 size-4 rounded-full flex items-center justify-center transition-all duration-300"
          style={{
            left: isDark ? "calc(100% - 1.125rem)" : "2px",
            background: isDark
              ? "linear-gradient(135deg, #AE0849, #E21C70)"
              : "linear-gradient(135deg, #fbbf24, #f59e0b)",
            boxShadow: isDark
              ? "0 0 8px rgba(226,28,112,0.5)"
              : "0 0 8px rgba(245,158,11,0.5)",
          }}
        >
          {isDark ? (
            /* Moon icon */
            <svg className="size-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ) : (
            /* Sun icon */
            <svg className="size-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        {/* Stars (dark) or clouds (light) decoration */}
        {isDark ? (
          <>
            <span className="absolute top-0.5 left-1 text-[6px] opacity-60">✦</span>
            <span className="absolute bottom-0.5 left-1.5 text-[5px] opacity-40">·</span>
          </>
        ) : (
          <span className="absolute top-0.5 right-1 text-[6px] opacity-50">☀</span>
        )}
      </div>

      {/* Label */}
      <span className="hidden sm:block text-[11px] font-semibold w-12 text-center">
        {isDark ? "🌙 Malam" : "☀️ Siang"}
      </span>
    </button>
  );
}
