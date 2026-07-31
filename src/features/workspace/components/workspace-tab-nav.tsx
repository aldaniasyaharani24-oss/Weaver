"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface WorkspaceTabNavProps {
  workspaceId: string;
}

export function WorkspaceTabNav({ workspaceId }: WorkspaceTabNavProps) {
  const pathname = usePathname();

  const tabs = [
    { label: "Overview",      href: `/workspaces/${workspaceId}` },
    { label: "Message Board", href: `/workspaces/${workspaceId}/messages` },
    { label: "Kanban",        href: `/workspaces/${workspaceId}/kanban` },
    { label: "Schedule",      href: `/workspaces/${workspaceId}/schedule` },
    { label: "Anggota",       href: `/workspaces/${workspaceId}/members` },
    { label: "Aktivitas",     href: `/workspaces/${workspaceId}/activity` },
    { label: "AI Assistant",  href: `/workspaces/${workspaceId}/ai` },
    { label: "Pengaturan",    href: `/workspaces/${workspaceId}/settings` },
  ];

  return (
    <nav className="flex items-center flex-wrap gap-1.5 pb-3">
      {tabs.map((tab) => {
        const isActive =
          tab.href === `/workspaces/${workspaceId}`
            ? pathname === tab.href
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="ws-tab px-4 py-1.5 rounded-full text-xs font-semibold transition-all select-none"
            data-active={isActive ? "true" : "false"}
            style={isActive ? {
              background: "var(--ws-tab-active-bg, #BF0413)",
              color: "#ffffff",
              boxShadow: "var(--ws-tab-active-shadow, 0 0 12px rgba(191,4,19,0.5))",
            } : {
              background: "var(--ws-tab-inactive-bg, rgba(191,4,19,0.08))",
              border: "1px solid var(--ws-tab-inactive-border, rgba(191,4,19,0.2))",
              color: "var(--ws-tab-inactive-color, rgba(242,242,242,0.7))",
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
