import { createFileRoute, redirect } from "@tanstack/react-router";
import { url } from "@/lib/site";

export const Route = createFileRoute("/pergunte")({
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/pergunte-a-biblia",
      search: search?.q ? { q: search.q } : undefined,
      statusCode: 301,
    });
  },
  validateSearch: (search: Record<string, unknown> = {}): { q?: string } => ({
    q: typeof search?.["q"] === "string" ? search["q"] : "",
  }),
  head: () => ({
    meta: [
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: url("/pergunte-a-biblia") }],
  }),
  component: () => null,
});

const EXAMPLES = [
  "Como fortalecer minha fé?",
  "O que a Bíblia ensina sobre perdão?",
  "Como lidar com momentos difíceis?",
  "Quais versículos falam sobre esperança?",
  "Explique o Salmo 23 versículo por versículo",
  "O que significa a armadura de Deus em Efésios 6?",
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

function AskPage() {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Pergunte à Bíblia</h1>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          Tire dúvidas sobre passagens, temas teológicos, contexto histórico e referências bíblicas.
        </p>

        {/* Nota pedagógica e aviso de transparência */}
        <div className="mt-5 rounded-lg border border-gold/40 bg-gold-soft/50 p-4 text-xs text-foreground/80 leading-relaxed">
          <p className="font-semibold text-foreground">Aviso sobre o uso de inteligência pedagógica:</p>
          <p className="mt-1">
            As respostas apresentadas nesta ferramenta têm finalidade exclusivamente educativa e reflexiva, baseadas
            em contextos bíblicos. O conteúdo sintetizado reflete explicações e interpretações históricas e nunca deve
            ser confundido com citações literais das Sagradas Escrituras. Recomendamos sempre a verificação direta
            nos capítulos completos da Bíblia.
          </p>
        </div>

        <AdBanner className="mt-6" />

        <div className="mt-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Perguntas frequentes sugeridas:</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {EXAMPLES.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => send(e)}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-gold hover:text-foreground"
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {messages.length === 0 && (
            <div className="surface rounded-xl p-8 text-center text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Nenhuma conversa iniciada ainda.</p>
              <p className="mt-1">Clique em um dos exemplos sugeridos acima ou digite sua pergunta abaixo.</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "user"
                  ? "ml-auto max-w-[85%] rounded-2xl bg-primary px-4 py-3 text-sm text-primary-foreground shadow-xs"
                  : "surface max-w-[95%] rounded-xl border border-border/70 p-5 text-sm leading-relaxed whitespace-pre-wrap"
              }
            >
              {m.role === "assistant" && (
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gold">
                  <span>Explicação Bíblica</span>
                </div>
              )}
              {m.content}
            </div>
          ))}

          {mutation.isPending && (
            <div className="surface flex items-center gap-2 max-w-[95%] rounded-xl p-4 text-sm text-muted-foreground">
              <div className="size-3 animate-spin rounded-full border-2 border-gold border-t-transparent" />
              <span>Consultando Escrituras e elaborando explicação...</span>
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

