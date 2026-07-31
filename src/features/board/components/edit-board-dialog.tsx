"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateBoardSchema, type UpdateBoardInput } from "../validation/board.schema";
import { updateBoard } from "../actions/board.actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Board } from "../types/board";

interface EditBoardDialogProps {
  board: Board;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Legacy: children diabaikan, hanya untuk kompatibilitas tempat yang masih pakai trigger */
  children?: React.ReactNode;
}

export function EditBoardDialog({ board, open, onOpenChange }: EditBoardDialogProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateBoardInput>({
    resolver: zodResolver(updateBoardSchema),
    values: {
      id: board.id,
      title: board.title,
      description: board.description ?? "",
    },
  });

  async function onSubmit(data: UpdateBoardInput) {
    const result = await updateBoard(data);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    onOpenChange(false);
    toast.success("Board berhasil diupdate!");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <span className="size-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
            </span>
            Edit Board
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="board-title" className="text-gray-700">Judul Board</Label>
            <Input
              id="board-title"
              placeholder="Masukkan judul board"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="board-desc" className="text-gray-700">
              Deskripsi <span className="text-gray-400 font-normal">(opsional)</span>
            </Label>
            <Input
              id="board-desc"
              placeholder="Jelaskan tujuan board ini..."
              {...register("description")}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
