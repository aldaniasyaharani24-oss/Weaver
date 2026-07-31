import { z } from "zod";

export const createTaskSchema = z.object({
  board_id: z.string().uuid(),
  title: z.string().min(1, "Judul task harus diisi"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["todo", "in_progress", "done"]),
  due_date: z.string().optional(),
});

export const updateTaskSchema = z.object({
  id: z.string().uuid(),
  board_id: z.string().uuid(),
  title: z.string().min(1, "Judul task harus diisi"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["todo", "in_progress", "done"]),
  due_date: z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
