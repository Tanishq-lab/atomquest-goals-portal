import { NextResponse } from "next/server";
import { requireSession } from "@/lib/rbac";
import { z } from "zod";

const aiRequestSchema = z.object({
  department: z.string().min(1).max(120),
  intent: z.string().min(1).max(240)
});

function buildPrompt(department: string, intent: string) {
  return `Generate concise corporate HR performance content for ${department}. Intent: ${intent}. Return 3 SMART goals or a quarterly summary.`;
}

export async function POST(request: Request) {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = aiRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing or invalid 'department'/'intent'" }, { status: 400 });
  }

  const { department, intent } = parsed.data;
  const prompt = buildPrompt(department, intent);

  // Deterministic timeout to avoid hanging requests.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    if (process.env.GROQ_API_KEY) {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2
        })
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        return NextResponse.json(
          { error: "AI provider error", status: response.status, details: text.slice(0, 500) },
          { status: 502 }
        );
      }

      const json: unknown = await response.json();
      const content = (json as any)?.choices?.[0]?.message?.content;

      return NextResponse.json({ text: typeof content === "string" ? content : "" });
    }

    // Demo fallback (no external calls)
    return NextResponse.json({
      text: [
        `Improve ${department} delivery predictability to 95% by Q4 through monthly planning reviews.`,
        `Reduce rework by 20% through quality gates and quarterly retrospectives.`,
        `Publish measurable KPI updates every quarter with evidence and manager comments.`
      ].join("\n")
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "AI request failed", details: message }, { status: 500 });
  } finally {
    clearTimeout(timeout);
  }
}

