import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Send, HelpCircle } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { AdBanner } from "@/components/Ads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askBible } from "@/lib/ai.functions";
import { url } from "@/lib/site";

export const Route = createFileRoute("/pergunte-a-biblia")({
  validateSearch: (search: Record<string, unknown> = {}): { q?: string } => ({
    q: typeof search?.["q"] === "string" ? search["q"] : "",
  }),
  head: () => ({
    meta: [
      { title: "Pergunte à Bíblia — Tire dúvidas sobre passagens e temas | Bíblia Online" },
      {
        name: "description",
        content:
          "Faça perguntas sobre passagens, contextos e temas bíblicos e receba explicações com referências fiéis às Escrituras Sagradas.",
      },
      { property: "og:title", content: "Pergunte à Bíblia — Bíblia Online" },
      { property: "og:description", content: "Tire dúvidas sobre fé, ansiedade, perdão e temas bíblicos." },
      { property: "og:url", content: url("/pergunte-a-biblia") },
    ],
    links: [{ rel: "canonical", href: url("/pergunte-a-biblia") }],
  }),
  component: AskBiblePage,
});

const CANONICAL_QUESTIONS = [
  "O que a Bíblia diz sobre ansiedade?",
  "Como vencer o medo segundo a Bíblia?",
  "O que a Bíblia ensina sobre perdão?",
  "Quais versículos falam sobre esperança?",
];

const ADDITIONAL_EXAMPLES = [
  "Como fortalecer minha fé no cotidiano?",
  "Explique o Salmo 23 versículo por versículo",
  "O que significa a armadura de Deus em Efésios 6?",
  "Como orar segundo o Pai Nosso?",
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

function AskBiblePage() {
  const search = Route.useSearch();
  const q = search?.q || "";
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const sentInitial = useRef(false);

  const mutation = useMutation({
    mutationFn: (msgs: Message[]) => askBible({ data: { messages: msgs } }),
    onSuccess: (res) => setMessages((m) => [...m, { role: "assistant", content: res.answer }]),
    onError: () =>
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Não foi possível consultar agora. Por favor, tente novamente em instantes." },
      ]),
  });

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || mutation.isPending) return;
    const next: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    mutation.mutate(next);
  };

  useEffect(() => {
    if (q && !sentInitial.current) {
      sentInitial.current = true;
      send(q);
    }
  }, [q]);

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <header>
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold mb-2">
            <HelpCircle className="size-3.5" /> Estudo Bíblico Interativo
          </div>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">Pergunte à Bíblia</h1>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            Tire suas dúvidas sobre passagens, personagens, contexto histórico e ensinamentos da Palavra de Deus.
          </p>
          <div className="mt-3 rounded-lg border border-border/50 bg-muted/30 p-3 text-xs text-muted-foreground">
            <strong>Nota de orientação:</strong> As respostas são geradas com apoio de inteligência artificial
            fundamentada nas Escrituras. Sempre leia o texto bíblico completo e consulte sua comunidade de fé para
            aprofundamento espiritual.
          </div>
        </header>

        <div className="mt-4">
          <AdBanner />
        </div>

        {messages.length === 0 && (
          <div className="mt-6 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gold">Perguntas Frequentes Sugeridas:</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {CANONICAL_QUESTIONS.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => send(ex)}
                    className="surface p-3 text-left text-sm font-medium hover:border-gold/50 transition-colors cursor-pointer"
                  >
                    💬 {ex}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Outros Tópicos:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ADDITIONAL_EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => send(ex)}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`rounded-xl p-4 text-sm leading-relaxed ${
                m.role === "user"
                  ? "ml-auto max-w-[85%] bg-gold/15 text-foreground font-medium"
                  : "surface max-w-[95%] space-y-2"
              }`}
            >
              <div className="text-xs font-medium text-muted-foreground mb-1">
                {m.role === "user" ? "Sua pergunta:" : "Resposta fundamentada na Bíblia:"}
              </div>
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          ))}

          {mutation.isPending && (
            <div className="surface flex items-center gap-2 max-w-[95%] rounded-xl p-4 text-sm text-muted-foreground">
              <div className="size-3 animate-spin rounded-full border-2 border-gold border-t-transparent" />
              <span>Consultando Escrituras e elaborando explicação com referências...</span>
            </div>
          )}
        </div>

        <form
          className="sticky bottom-20 mt-8 flex gap-2 rounded-xl bg-background/90 backdrop-blur lg:bottom-4 pt-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua pergunta sobre a Bíblia..."
            className="h-12 bg-background shadow-xs"
            aria-label="Sua pergunta sobre a Bíblia"
          />
          <Button type="submit" className="h-12 px-5" disabled={mutation.isPending || !input.trim()}>
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </SiteLayout>
  );
}
