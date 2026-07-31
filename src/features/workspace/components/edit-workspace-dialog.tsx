"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateWorkspaceSchema, type UpdateWorkspaceInput } from "../validation/workspace.schema";
import { updateWorkspaceAction } from "../actions/workspace.actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Workspace } from "../types/workspace";

const PRESET_COLORS = [
  "#6366f1","#8b5cf6","#ec4899","#ef4444",
  "#f97316","#eab308","#22c55e","#14b8a6","#3b82f6",
];

interface EditWorkspaceDialogProps {
  workspace: Workspace;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}

export function EditWorkspaceDialog({ workspace, open, onOpenChange }: EditWorkspaceDialogProps) {
  const [selectedColor, setSelectedColor] = useState(workspace.color ?? PRESET_COLORS[0]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UpdateWorkspaceInput>({
    resolver: zodResolver(updateWorkspaceSchema),
    values: {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description ?? "",
      icon: workspace.icon ?? "",
      color: workspace.color ?? PRESET_COLORS[0],
    },
  });

  async function onSubmit(data: UpdateWorkspaceInput) {
    const result = await updateWorkspaceAction({ ...data, color: selectedColor });
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    onOpenChange(false);
    toast.success("Workspace berhasil diupdate!");
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
            Edit Workspace
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="ws-name" className="text-gray-700">Nama Workspace</Label>
            <Input id="ws-name" placeholder="Nama workspace" {...register("name")} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ws-desc" className="text-gray-700">
              Deskripsi <span className="text-gray-400 font-normal">(opsional)</span>
            </Label>
            <Input id="ws-desc" placeholder="Deskripsi singkat..." {...register("description")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ws-icon" className="text-gray-700">
              Ikon Emoji <span className="text-gray-400 font-normal">(opsional)</span>
            </Label>
            <Input id="ws-icon" placeholder="🚀" maxLength={4} {...register("icon")} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-gray-700">Warna</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="size-7 rounded-full transition-all"
                  style={{
                    backgroundColor: color,
                    boxShadow: selectedColor === color
                      ? `0 0 0 2px white, 0 0 0 4px ${color}`
                      : "none",
                  }}
                  onClick={() => { setSelectedColor(color); setValue("color", color); }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
