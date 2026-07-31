import { generateText } from "ai";
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
  const { tasks, workspace_name } = body;

  if (!tasks?.length) {
    return Response.json({ error: "Tidak ada task untuk dianalisis" }, { status: 400 });
  }

  const taskList = tasks
    .map(
      (t: { id: string; title: string; priority: string; status: string; due_date?: string }) =>
        `- ID: ${t.id} | "${t.title}" | Prioritas: ${t.priority} | Status: ${t.status} | Deadline: ${t.due_date ?? "tidak ada"}`,
    )
    .join("\n");

  try {
    const { text } = await generateText({
      model: groq(AI_MODEL),
      prompt: `Kamu adalah asisten manajemen proyek yang menganalisis risiko keterlambatan task.

Proyek: "${workspace_name}"
Tanggal hari ini: ${new Date().toLocaleDateString("id-ID", { dateStyle: "full" })}

Daftar task:
${taskList}

Kembalikan HANYA JSON valid tanpa penjelasan, format persis:
{
  "analyses": [
    {
      "task_id": "id-task",
      "task_title": "judul task",
      "risk_level": "high",
      "reason": "Alasan 1 kalimat",
      "recommendation": "Rekomendasi 1 kalimat"
    }
  ],
  "overall_assessment": "Penilaian keseluruhan 1-2 kalimat"
}

Aturan:
- risk_level hanya: "low", "medium", "high", atau "critical"
- Gunakan Bahasa Indonesia
- Jangan tambahkan teks lain selain JSON`,
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Response bukan JSON valid");

    const parsed = JSON.parse(jsonMatch[0]);

    // Sanitasi
    const analyses = (parsed.analyses ?? []).map((a: {
      task_id?: string;
      task_title?: string;
      risk_level?: string;
      reason?: string;
      recommendation?: string;
    }) => ({
      task_id: String(a.task_id ?? ""),
      task_title: String(a.task_title ?? ""),
      risk_level: ["low", "medium", "high", "critical"].includes(a.risk_level ?? "")
        ? a.risk_level
        : "medium",
      reason: String(a.reason ?? "").slice(0, 200),
      recommendation: String(a.recommendation ?? "").slice(0, 200),
    }));

    return Response.json({
      analyses,
      overall_assessment: String(parsed.overall_assessment ?? "").slice(0, 300),
    });
  } catch (err) {
    console.error("[priority] error:", err);
    return Response.json({ error: "Gagal menganalisis task" }, { status: 500 });
  }
}
