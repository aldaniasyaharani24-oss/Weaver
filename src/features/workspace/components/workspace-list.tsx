"use client";

import { WorkspaceCard } from "./workspace-card";
import { CreateWorkspaceDialog } from "./create-workspace-dialog";
import { Button } from "@/components/ui/button";
import type { WorkspaceWithStats } from "../types/workspace";

interface WorkspaceListProps {
  workspaces: WorkspaceWithStats[];
}

export function WorkspaceList({ workspaces }: WorkspaceListProps) {
  if (workspaces.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed p-16 text-center"
        style={{ borderColor: "rgba(249,102,171,0.2)", background: "rgba(30,32,72,0.4)" }}
      >
        <div className="text-5xl mb-4">🗂️</div>
        <h3 className="font-semibold mb-2" style={{ color: "#E9CFE8" }}>Belum ada proyek</h3>
        <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: "rgba(233,207,232,0.5)" }}>
          Workspace adalah rumah bagi semua board, task, dan anggota tim Anda.
        </p>
        <CreateWorkspaceDialog>
          <Button className="animate-web-pulse" style={{ background: "linear-gradient(135deg, #AE0849, #E21C70)", color: "#fff", border: "none" }}>
            Buat Workspace Pertama
          </Button>
        </CreateWorkspaceDialog>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm" style={{ color: "rgba(233,207,232,0.5)" }}>{workspaces.length} proyek</p>
        <CreateWorkspaceDialog>
          <Button size="sm" style={{ background: "linear-gradient(135deg, #AE0849, #E21C70)", color: "#fff", border: "none" }}>
            + Proyek Baru
          </Button>
        </CreateWorkspaceDialog>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {workspaces.map((ws) => (
          <WorkspaceCard key={ws.id} workspace={ws} />
        ))}
      </div>
    </div>
  );
}
