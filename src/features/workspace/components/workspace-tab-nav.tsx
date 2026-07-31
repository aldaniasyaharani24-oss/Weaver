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
    <div className="ws-tab-wrapper">
      <nav className="ws-tab-nav">
        {tabs.map((tab) => {
          const isActive =
            tab.href === `/workspaces/${workspaceId}`
              ? pathname === tab.href
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`ws-tab-item ${isActive ? "ws-tab-active" : "ws-tab-inactive"}`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
