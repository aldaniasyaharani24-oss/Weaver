"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createWorkspaceSchema, type CreateWorkspaceInput } from "../validation/workspace.schema";
import { createWorkspaceAction } from "../actions/workspace.actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PRESET_COLORS = ["#6366f1","#8b5cf6","#ec4899","#ef4444","#f97316","#eab308","#22c55e","#14b8a6","#3b82f6"];

interface CreateWorkspaceDialogProps {
  children: React.ReactNode;
}

export function CreateWorkspaceDialog({ children }: CreateWorkspaceDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const router = useRouter();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: { color: PRESET_COLORS[0] },
  });

  async function onSubmit(data: CreateWorkspaceInput) {
    setLoading(true);
    const result = await createWorkspaceAction({ ...data, color: selectedColor });
    if (result?.error) { toast.error(result.error); setLoading(false); return; }
    reset();
    setSelectedColor(PRESET_COLORS[0]);
    setOpen(false);
    setLoading(false);
    toast.success("Workspace berhasil dibuat!");
    router.refresh();
  }

  return (
    <>
      <span onClick={() => setOpen(true)} className="contents cursor-pointer">
        {children}
      </span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <span className="size-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </span>
              Buat Workspace Baru
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="ws-name" className="text-gray-700">Nama Workspace</Label>
              <Input id="ws-name" placeholder="Contoh: Proyek Website 2025" {...register("name")} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ws-desc" className="text-gray-700">
                Deskripsi <span className="text-gray-400 font-normal">(opsional)</span>
              </Label>
              <Input id="ws-desc" placeholder="Deskripsi singkat workspace" {...register("description")} />
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
                  <button key={color} type="button"
                    className="size-7 rounded-full transition-all"
                    style={{ backgroundColor: color, boxShadow: selectedColor === color ? `0 0 0 2px white, 0 0 0 4px ${color}` : "none" }}
                    onClick={() => { setSelectedColor(color); setValue("color", color); }}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {loading ? "Menyimpan..." : "Buat Workspace"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
