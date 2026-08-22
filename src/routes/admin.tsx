import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { adsConfig, analyticsConfig } from "@/lib/ads-config";
import { DEVOTIONALS, PRAYERS, STUDIES } from "@/lib/content";
import { BIBLE_BOOKS } from "@/lib/bible-books";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel administrativo — Bíblia Online" },
      { name: "description", content: "Área administrativa do portal Bíblia Online." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function AdminPage() {
  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <h1 className="font-display text-3xl font-semibold">Painel administrativo</h1>
        <p className="mt-2 text-muted-foreground">
          Esta área ainda não possui autenticação nem escrita de dados. Ative o backend do
          projeto para habilitar login de administrador, métricas reais e gestão de conteúdo.
        </p>

        <section className="surface mt-6 p-5">
          <h2 className="font-display text-xl font-semibold">Conteúdo publicado</h2>
          <div className="mt-3">
            <Row label="Livros da Bíblia" value={String(BIBLE_BOOKS.length)} />
            <Row label="Estudos" value={String(STUDIES.length)} />
            <Row label="Devocionais" value={String(DEVOTIONALS.length)} />
            <Row label="Orações" value={String(PRAYERS.length)} />
          </div>
        </section>

        <section className="surface mt-5 p-5">
          <h2 className="font-display text-xl font-semibold">Publicidade (AdSense)</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure através das variáveis de ambiente. Nenhum ID fictício é usado.
          </p>
          <div className="mt-3">
            <Row
              label="VITE_ADSENSE_PUBLISHER_ID"
              value={adsConfig.publisherId || "não configurado"}
            />
            {Object.entries(adsConfig.slots).map(([k, v]) => (
              <Row key={k} label={`Bloco: ${k}`} value={v || "não configurado"} />
            ))}
            <Row label="Anúncios habilitados" value={adsConfig.enabled ? "sim" : "não"} />
            <Row label="ads.txt" value="public/ads.txt" />
          </div>
        </section>

        <section className="surface mt-5 p-5">
          <h2 className="font-display text-xl font-semibold">Analytics</h2>
          <div className="mt-3">
            <Row
              label="VITE_GA_MEASUREMENT_ID"
              value={analyticsConfig.gaMeasurementId || "não configurado"}
            />
          </div>
        </section>

        <section className="surface mt-5 p-5">
          <h2 className="font-display text-xl font-semibold">SEO</h2>
          <div className="mt-3">
            <Row label="Sitemap" value="/sitemap.xml" />
            <Row label="Robots" value="/robots.txt" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Cada página define título, descrição, canonical e Open Graph próprios.
          </p>
        </section>

        <p className="mt-6 text-sm text-muted-foreground">
          Voltar para o <Link to="/" className="underline">início</Link>.
        </p>
      </div>
    </SiteLayout>
  );
}
