"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteBoard } from "../actions/board.actions";
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
import type { Board } from "../types/board";

interface DeleteBoardAlertProps {
  board: Board;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Legacy: children diabaikan */
  children?: React.ReactNode;
}

export function DeleteBoardAlert({ board, open, onOpenChange }: DeleteBoardAlertProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    const result = await deleteBoard(board.id);
    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
      return;
    }
    setLoading(false);
    onOpenChange(false);
    toast.success("Board berhasil dihapus!");
    router.refresh();
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Board</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus board{" "}
            <span className="font-semibold text-gray-900">&ldquo;{board.title}&rdquo;</span>?
            Semua task di dalamnya akan ikut terhapus.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? "Menghapus..." : "Hapus Board"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
