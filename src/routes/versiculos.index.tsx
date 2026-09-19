import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Search, ArrowRight, HeartHandshake } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { AdBanner, AdDesktop } from "@/components/Ads";
import { Input } from "@/components/ui/input";
import { BIBLE_TOPICS } from "@/lib/topics";
import { url } from "@/lib/site";

export const Route = createFileRoute("/versiculos/")({
  head: () => {
    const title = "Versículos Bíblicos por Tema — Amor, Fé, Proteção, Paz e Esperança | Bíblia Online";
    const description =
      "Biblioteca completa de versículos bíblicos organizados por temas: amor, fé, esperança, proteção, ansiedade, paz, família, sabedoria, força, coragem e mais de 30 assuntos com explicações e reflexões.";
    const canonical = url("/versiculos");

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonical },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Versículos Bíblicos por Tema",
            description,
            url: canonical,
          }),
        },
      ],
    };
  },
  component: VersiculosIndexPage,
});

function VersiculosIndexPage() {
  const [query, setQuery] = useState("");

  const filteredTopics = BIBLE_TOPICS.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase()) ||
    t.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <nav aria-label="Navegação estrutural" className="text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Início</Link>
          <span className="mx-1">/</span>
          <span className="text-foreground">Versículos</span>
        </nav>

        <header className="mt-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold mb-2">
            <BookOpen className="size-3.5" /> Biblioteca Temática
          </div>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">
            Versículos Bíblicos por Tema
          </h1>
          <p className="mt-2 max-w-3xl text-muted-foreground leading-relaxed">
            Encontre a passagem certa para cada momento da vida. Selecione um dos {BIBLE_TOPICS.length} temas
            bíblicos abaixo para ler versículos selecionados, reflexões contextuais e aplicações práticas.
          </p>

          <div className="relative mt-6 max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar tema (ex: ansiedade, amor, força)..."
              className="pl-9 h-11"
              aria-label="Filtrar temas de versículos"
            />
          </div>
        </header>

        <div className="mt-6">
          <AdBanner />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
          <div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTopics.map((item) => (
                <Link
                  key={item.slug}
                  to="/versiculos/$slug"
                  params={{ slug: item.slug }}
                  className="surface group flex flex-col justify-between p-4 transition-all hover:border-gold/50 hover:shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h2 className="font-display font-medium text-base text-foreground group-hover:text-gold transition-colors">
                        {item.name}
                      </h2>
                      <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-muted-foreground">
                        {item.verses.length} versículos
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/40 text-xs text-gold font-medium">
                    <span>Explorar versículos</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>

            {filteredTopics.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                <p>Nenhum tema encontrado com o termo "{query}".</p>
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="mt-3 text-sm text-gold hover:underline"
                >
                  Limpar busca e ver todos os temas
                </button>
              </div>
            )}

            <section className="mt-12 rounded-xl border border-border/60 bg-muted/20 p-6">
              <h3 className="font-display text-xl font-semibold">Precisa de fortalecimento espiritual?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Além dos versículos por tema, você pode ler nossos estudos bíblicos aprofundados ou fazer uma prece em nossa seção de orações.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to="/estudos"
                  className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
                >
                  Ver Estudos Bíblicos
                </Link>
                <Link
                  to="/oracoes"
                  className="inline-flex items-center rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:opacity-90"
                >
                  <HeartHandshake className="mr-1.5 size-4" /> Ir para Orações
                </Link>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <AdDesktop />
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}
