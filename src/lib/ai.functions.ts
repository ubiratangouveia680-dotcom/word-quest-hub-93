import { createServerFn } from "@tanstack/react-start";

const SYSTEM_PROMPT = `Você é um assistente de estudo bíblico do portal "Bíblia Online", em português do Brasil.
Regras:
- Responda com respeito, clareza e tom acolhedor.
- Deixe explícito quando estiver oferecendo contexto histórico, síntese ou interpretação, e mencione quando há mais de uma leitura possível entre tradições cristãs.
- NUNCA invente citações bíblicas. Cite apenas versículos que existem e, sempre que possível, indique a referência (livro, capítulo e versículo).
- Se não tiver certeza do texto exato, indique apenas a referência e sugira que o usuário leia no portal.
- Não substitua aconselhamento profissional (saúde, jurídico, psicológico).
- Seja objetivo: no máximo 5 parágrafos curtos.`;

export const askBible = createServerFn({ method: "POST" })
  .inputValidator((data: { messages: { role: "user" | "assistant"; content: string }[] }) => ({
    messages: (data.messages ?? []).slice(-12).map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: String(m.content).slice(0, 4000),
    })),
  }))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      return {
        ok: false as const,
        answer:
          "A integração de IA ainda não está configurada. Ative o backend do projeto para habilitar as respostas.",
      };
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...data.messages],
      }),
    });

    if (res.status === 429) {
      return { ok: false as const, answer: "Muitas perguntas em pouco tempo. Tente novamente em instantes." };
    }
    if (!res.ok) {
      return { ok: false as const, answer: "Não foi possível obter uma resposta agora. Tente novamente." };
    }

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return {
      ok: true as const,
      answer: json.choices?.[0]?.message?.content ?? "Não consegui elaborar uma resposta.",
    };
  });
