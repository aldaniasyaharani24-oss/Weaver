"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createTaskSchema, type CreateTaskInput } from "../validation/task.schema";
import { createTask } from "../actions/task.actions";
import type { TaskStatus } from "../types/task";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CreateTaskDialogProps {
  boardId: string;
  defaultStatus?: TaskStatus;
  children: React.ReactNode;
}

export function CreateTaskDialog({ boardId, defaultStatus = "todo", children }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: { board_id: boardId, status: defaultStatus, priority: "medium" },
  });

  const priorityValue = useWatch({ control, name: "priority" });
  const statusValue   = useWatch({ control, name: "status" });

  async function onSubmit(data: CreateTaskInput) {
    setLoading(true);
    const result = await createTask(data);
    if (result?.error) { toast.error(result.error); setLoading(false); return; }
    reset();
    setOpen(false);
    setLoading(false);
    toast.success("Task berhasil dibuat!");
    router.refresh();
  }

  return (
    <>
      <span onClick={() => setOpen(true)} className="contents cursor-pointer">{children}</span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md weaver-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 weaver-dialog-title">
              <span className="size-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "var(--weaver-accent)", opacity: 0.9 }}>
                <svg className="size-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </span>
              Tambah Task Baru
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
            {/* Judul */}
            <div className="space-y-1.5">
              <Label htmlFor="task-title" className="weaver-label">Judul Task</Label>
              <Input id="task-title" placeholder="Apa yang perlu dikerjakan?" {...register("title")}
                className="weaver-input" />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            {/* Deskripsi */}
            <div className="space-y-1.5">
              <Label htmlFor="task-desc" className="weaver-label">
                Deskripsi <span className="weaver-label-opt">(opsional)</span>
              </Label>
              <Input id="task-desc" placeholder="Detail atau catatan tambahan..."
                {...register("description")} className="weaver-input" />
            </div>

            {/* Prioritas + Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="weaver-label">Prioritas</Label>
                <Select value={priorityValue} onValueChange={(v) => setValue("priority", v as "low" | "medium" | "high")}>
                  <SelectTrigger className="weaver-input"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🟢 Low</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="high">🔴 High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="weaver-label">Status</Label>
                <Select value={statusValue} onValueChange={(v) => setValue("status", v as TaskStatus)}>
                  <SelectTrigger className="weaver-input"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">📋 Todo</SelectItem>
                    <SelectItem value="in_progress">⚡ In Progress</SelectItem>
                    <SelectItem value="done">✅ Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <Label htmlFor="task-due" className="weaver-label">
                📅 Due Date <span className="weaver-label-opt">(opsional — untuk Schedule)</span>
              </Label>
              <Input id="task-due" type="date" {...register("due_date")} className="weaver-input" />
              <p className="text-[11px] weaver-hint">
                Task dengan due date akan muncul di halaman Schedule & Deadlines
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 weaver-form-divider">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}
                className="weaver-btn-outline">Batal</Button>
              <Button type="submit" disabled={loading} className="weaver-btn-primary">
                {loading ? "Menyimpan..." : "Buat Task"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
