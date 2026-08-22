import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { AdBanner } from "@/components/Ads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askBible } from "@/lib/ai.functions";
import { url } from "@/lib/site";

export const Route = createFileRoute("/pergunte")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? search["q"] : "",
  }),
  head: () => ({
    meta: [
      { title: "Pergunte sobre a Bíblia — tire dúvidas sobre passagens | Bíblia Online" },
      {
        name: "description",
        content:
          "Faça perguntas sobre passagens, contextos e temas bíblicos e receba explicações com referências às Escrituras.",
      },
      { property: "og:title", content: "Pergunte sobre a Bíblia — Bíblia Online" },
      { property: "og:description", content: "Tire dúvidas sobre passagens e temas bíblicos." },
      { property: "og:url", content: url("/pergunte") },
    ],
    links: [{ rel: "canonical", href: url("/pergunte") }],
  }),
  component: AskPage,
});

const EXAMPLES = [
  "Explique João 3:16.",
  "Qual o contexto do Salmo 23?",
  "Quais versículos falam sobre esperança?",
  "Resuma o livro de Romanos.",
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

function AskPage() {
  const { q } = Route.useSearch();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const sentInitial = useRef(false);

  const mutation = useMutation({
    mutationFn: (msgs: Message[]) => askBible({ data: { messages: msgs } }),
    onSuccess: (res) => setMessages((m) => [...m, { role: "assistant", content: res.answer }]),
    onError: () =>
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Não foi possível responder agora. Tente novamente." },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <h1 className="font-display text-3xl font-semibold">Pergunte sobre a Bíblia</h1>
        <p className="mt-2 text-muted-foreground">
          Respostas geradas por inteligência artificial com base em contexto bíblico. Podem conter
          interpretações; confira sempre o texto nas Escrituras.
        </p>

        <AdBanner className="mt-6" />

        <div className="mt-6 flex flex-wrap gap-2">
          {EXAMPLES.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => send(e)}
              className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              {e}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "user"
                  ? "ml-auto max-w-[85%] rounded-2xl bg-primary px-4 py-3 text-sm text-primary-foreground"
                  : "surface max-w-[95%] whitespace-pre-wrap p-4 text-sm"
              }
            >
              {m.content}
            </div>
          ))}
          {mutation.isPending && (
            <div className="surface max-w-[95%] p-4 text-sm text-muted-foreground">
              Consultando…
            </div>
          )}
        </div>

        <form
          className="sticky bottom-20 mt-6 flex gap-2 lg:bottom-4"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escreva sua pergunta sobre a Bíblia..."
            className="h-12 bg-background"
            aria-label="Sua pergunta"
          />
          <Button type="submit" className="h-12" disabled={mutation.isPending}>
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </SiteLayout>
  );
}
