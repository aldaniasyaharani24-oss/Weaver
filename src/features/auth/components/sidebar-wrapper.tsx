"use client";

import { usePathname } from "next/navigation";
import { DashboardSidebar } from "./dashboard-sidebar";

interface SidebarWrapperProps {
  workspaces: { id: string; name: string; color: string; icon: string | null }[];
  displayName: string;
  initials: string;
}

export function SidebarWrapper({ workspaces, displayName, initials }: SidebarWrapperProps) {
  const pathname = usePathname();

  // Tampilkan sidebar hanya di dalam workspace
  const showSidebar = pathname.startsWith("/workspaces") || pathname.startsWith("/board");

  if (!showSidebar) return null;

  return (
    <DashboardSidebar
      workspaces={workspaces}
      displayName={displayName}
      initials={initials}
    />
  );
}
