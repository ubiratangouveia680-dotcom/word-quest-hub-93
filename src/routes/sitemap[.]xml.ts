import { createFileRoute } from "@tanstack/react-router";
import { BIBLE_BOOKS } from "@/lib/bible-books";
import { DEVOTIONALS, STUDIES, STUDY_CATEGORIES } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const urls: { loc: string; priority: string }[] = [
          { loc: "/", priority: "1.0" },
          { loc: "/biblia", priority: "0.9" },
          { loc: "/versiculo-do-dia", priority: "0.9" },
          { loc: "/estudos", priority: "0.8" },
          { loc: "/devocionais", priority: "0.8" },
          { loc: "/oracoes", priority: "0.8" },
          { loc: "/pergunte", priority: "0.6" },
          { loc: "/privacidade", priority: "0.3" },
          { loc: "/termos", priority: "0.3" },
          { loc: "/cookies", priority: "0.3" },
          { loc: "/contato", priority: "0.3" },
        ];

        for (const c of STUDY_CATEGORIES) {
          urls.push({ loc: `/estudos/categoria/${c.slug}`, priority: "0.6" });
        }
        for (const s of STUDIES) urls.push({ loc: `/estudos/${s.slug}`, priority: "0.7" });
        for (const d of DEVOTIONALS) urls.push({ loc: `/devocionais/${d.slug}`, priority: "0.7" });

        for (const b of BIBLE_BOOKS) {
          urls.push({ loc: `/biblia/${b.slug}`, priority: "0.7" });
          for (let c = 1; c <= b.chapters; c++) {
            urls.push({ loc: `/biblia/${b.slug}/${c}`, priority: "0.6" });
          }
        }

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${SITE_URL}${u.loc}</loc><changefreq>weekly</changefreq><priority>${u.priority}</priority></url>`,
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
