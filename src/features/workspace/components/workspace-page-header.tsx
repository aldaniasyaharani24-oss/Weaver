import { WorkspaceTabNav } from "./workspace-tab-nav";
import type { WorkspaceWithStats } from "../types/workspace";

interface WorkspacePageHeaderProps {
  workspace: WorkspaceWithStats;
  workspaceId: string;
}

export function WorkspacePageHeader({ workspace, workspaceId }: WorkspacePageHeaderProps) {
  const accentColor = workspace.color ?? "#E21C70";

  return (
    <div
      className="px-6 pt-6 pb-0"
      style={{ borderBottom: "1px solid rgba(249,102,171,0.12)" }}
    >
      <div className="flex items-center gap-3 mb-4">
        {workspace.icon ? (
          <span className="text-3xl leading-none">{workspace.icon}</span>
        ) : (
          <div
            className="size-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
            style={{ backgroundColor: accentColor }}
          >
            {workspace.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1
            className="text-xl font-bold leading-tight"
            style={{ color: "#E9CFE8", fontFamily: "var(--font-heading)" }}
          >
            {workspace.name}
          </h1>
          {workspace.description && (
            <p className="text-sm mt-0.5" style={{ color: "rgba(233,207,232,0.5)" }}>
              {workspace.description}
            </p>
          )}
        </div>
      </div>
      <WorkspaceTabNav workspaceId={workspaceId} />
    </div>
  );
}
