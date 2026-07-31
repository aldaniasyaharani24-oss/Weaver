"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteWorkspaceAction } from "../actions/workspace.actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Workspace } from "../types/workspace";

interface DeleteWorkspaceAlertProps {
  workspace: Workspace;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}

export function DeleteWorkspaceAlert({ workspace, open, onOpenChange }: DeleteWorkspaceAlertProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    const result = await deleteWorkspaceAction(workspace.id);
    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
      return;
    }
    setLoading(false);
    onOpenChange(false);
    toast.success("Workspace berhasil dihapus!");
    router.refresh();
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Workspace</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus workspace{" "}
            <span className="font-semibold text-gray-900">&ldquo;{workspace.name}&rdquo;</span>?
            Semua board dan task di dalamnya akan ikut terhapus.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? "Menghapus..." : "Hapus Workspace"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
