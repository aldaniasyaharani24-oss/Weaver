import { streamText } from "ai";
import { groq, AI_MODEL, isAIConfigured } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  if (!isAIConfigured()) {
    return Response.json({ error: "AI belum dikonfigurasi" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    workspace_name,
    total_tasks,
    done_tasks,
    overdue_tasks,
    in_progress_tasks,
    progress,
    board_count,
    member_count,
    upcoming_deadlines,
    overdue_list,
  } = body;

  const prompt = `Kamu adalah asisten manajemen proyek yang membantu tim memahami perkembangan proyek mereka.

Data proyek "${workspace_name}":
- Total task: ${total_tasks}
- Task selesai: ${done_tasks} (${progress}%)
- Task sedang dikerjakan: ${in_progress_tasks}
- Task terlambat: ${overdue_tasks}
- Jumlah board: ${board_count}
- Jumlah anggota: ${member_count}
- Deadline dalam 7 hari ke depan: ${upcoming_deadlines?.length ?? 0} task
- Task overdue: ${overdue_list?.slice(0, 3).map((t: { title: string }) => t.title).join(", ") || "tidak ada"}

Berikan ringkasan singkat perkembangan proyek ini dalam 2-3 kalimat menggunakan Bahasa Indonesia yang natural dan profesional. Fokus pada: progres keseluruhan, kondisi task yang terlambat (jika ada), dan rekomendasi singkat. Jangan gunakan bullet point, tulis dalam bentuk paragraf.`;

  const result = streamText({
    model: groq(AI_MODEL),
    prompt,
    maxOutputTokens: 250,
  });

  return result.toTextStreamResponse();
}
