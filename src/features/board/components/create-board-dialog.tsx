"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createBoardSchema, type CreateBoardInput } from "../validation/board.schema";
import { createBoard } from "../actions/board.actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateBoardDialogProps {
  children: React.ReactNode;
  workspaceId?: string;
}

export function CreateBoardDialog({ children, workspaceId }: CreateBoardDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateBoardInput>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: { workspace_id: workspaceId },
  });

  async function onSubmit(data: CreateBoardInput) {
    setLoading(true);
    const result = await createBoard({ ...data, workspace_id: workspaceId });

    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
      return;
    }

    reset();
    setOpen(false);
    setLoading(false);
    toast.success("Board berhasil dibuat!");
    router.refresh();
  }

  return (
    <>
      {/* Trigger — klik langsung buka dialog tanpa DialogTrigger */}
      <span onClick={() => setOpen(true)} className="contents cursor-pointer">
        {children}
      </span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <span className="size-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" />
              </svg>
            </span>
            Tambah Board Baru
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="board-title" className="text-gray-700">Judul Board</Label>
            <Input
              id="board-title"
              placeholder="Contoh: Sprint 1, Development, Design..."
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loading ? "Menyimpan..." : "Buat Board"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
