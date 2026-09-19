import { createFileRoute } from "@tanstack/react-router";
import { BIBLE_BOOKS } from "@/lib/bible-books";
import { DEVOTIONALS, STUDIES, STUDY_CATEGORIES, PRAYERS } from "@/lib/content";
import { BIBLE_TOPICS } from "@/lib/topics";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const urls: { loc: string; priority: string; changefreq?: string }[] = [
          { loc: "/", priority: "1.0", changefreq: "daily" },
          { loc: "/biblia", priority: "0.9", changefreq: "weekly" },
          { loc: "/biblia/antigo-testamento", priority: "0.8", changefreq: "monthly" },
          { loc: "/biblia/novo-testamento", priority: "0.8", changefreq: "monthly" },
          { loc: "/versiculo-do-dia", priority: "0.9", changefreq: "daily" },
          { loc: "/versiculos", priority: "0.9", changefreq: "weekly" },
          { loc: "/estudos", priority: "0.8", changefreq: "weekly" },
          { loc: "/devocionais", priority: "0.8", changefreq: "daily" },
          { loc: "/oracoes", priority: "0.8", changefreq: "weekly" },
          { loc: "/pergunte-a-biblia", priority: "0.7", changefreq: "weekly" },
          { loc: "/pergunte", priority: "0.6", changefreq: "monthly" },
          { loc: "/privacidade", priority: "0.3", changefreq: "yearly" },
          { loc: "/termos", priority: "0.3", changefreq: "yearly" },
          { loc: "/cookies", priority: "0.3", changefreq: "yearly" },
          { loc: "/sobre", priority: "0.5", changefreq: "monthly" },
          { loc: "/contato", priority: "0.4", changefreq: "monthly" },
        ];

        // Temas de versículos
        for (const t of BIBLE_TOPICS) {
          urls.push({ loc: `/versiculos/${t.slug}`, priority: "0.8", changefreq: "weekly" });
        }

        // Orações individuais
        for (const p of PRAYERS) {
          urls.push({ loc: `/oracoes/${p.slug}`, priority: "0.8", changefreq: "weekly" });
        }

        // Categorias de estudos
        for (const c of STUDY_CATEGORIES) {
          urls.push({ loc: `/estudos/categoria/${c.slug}`, priority: "0.6", changefreq: "weekly" });
        }

        // Estudos bíblicos
        for (const s of STUDIES) {
          urls.push({ loc: `/estudos/${s.slug}`, priority: "0.7", changefreq: "monthly" });
        }

        // Devocionais
        for (const d of DEVOTIONALS) {
          urls.push({ loc: `/devocionais/${d.slug}`, priority: "0.7", changefreq: "weekly" });
        }

        // Livros e capítulos bíblicos
        for (const b of BIBLE_BOOKS) {
          urls.push({ loc: `/biblia/${b.slug}`, priority: "0.7", changefreq: "monthly" });
          for (let c = 1; c <= b.chapters; c++) {
            urls.push({ loc: `/biblia/${b.slug}/${c}`, priority: "0.6", changefreq: "monthly" });
          }
        }

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${SITE_URL}${u.loc}</loc><changefreq>${u.changefreq || "weekly"}</changefreq><priority>${u.priority}</priority></url>`,
  )
  .join("\n")}
</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
