import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Início do gerador estático de sitemap
async function generate() {
  const root = path.resolve(__dirname, "..");
  const SITE_URL = "https://bibliaonlineoficial.com.br";

  // Carrega os dados do projeto
  const { BIBLE_BOOKS } = await import("../src/lib/bible-books");
  const { DEVOTIONALS, STUDIES, STUDY_CATEGORIES, PRAYERS } = await import("../src/lib/content");
  const { BIBLE_TOPICS } = await import("../src/lib/topics");
  const { INITIAL_MATERIALS } = await import("../src/lib/studies-seed");

  const urlMap = new Map<string, { priority: string; changefreq: string }>();

  const addUrl = (loc: string, priority: string, changefreq: string) => {
    if (!urlMap.has(loc)) {
      urlMap.set(loc, { priority, changefreq });
    }
  };

  // 1. Páginas Principais e Hubs de Conteúdo
  addUrl("/", "1.0", "daily");
  addUrl("/biblia", "0.9", "weekly");
  addUrl("/biblia/antigo-testamento", "0.8", "monthly");
  addUrl("/biblia/novo-testamento", "0.8", "monthly");
  addUrl("/versiculo-do-dia", "0.9", "daily");
  addUrl("/versiculos", "0.9", "weekly");
  addUrl("/temas", "0.8", "weekly");
  addUrl("/estudos", "0.9", "weekly");
  addUrl("/estudos/escola-dominical", "0.8", "weekly");
  addUrl("/estudos/apostilas", "0.8", "weekly");
  addUrl("/estudos/prova-biblica", "0.8", "weekly");
  addUrl("/devocionais", "0.8", "daily");
  addUrl("/oracoes", "0.8", "weekly");
  addUrl("/comunidade", "0.8", "daily");
  addUrl("/comunidade/pedidos-de-oracao", "0.9", "daily");
  addUrl("/igrejas", "0.8", "weekly");
  addUrl("/pergunte-a-biblia", "0.7", "weekly");
  addUrl("/sobre", "0.5", "monthly");
  addUrl("/contato", "0.4", "monthly");
  addUrl("/privacidade", "0.3", "yearly");
  addUrl("/termos", "0.3", "yearly");
  addUrl("/cookies", "0.3", "yearly");

  // 2. Temas de Versículos
  for (const t of BIBLE_TOPICS) {
    addUrl(`/versiculos/${t.slug}`, "0.8", "weekly");
    addUrl(`/temas/${t.slug}`, "0.7", "weekly");
  }

  // 3. Orações Individuais
  for (const p of PRAYERS) {
    addUrl(`/oracoes/${p.slug}`, "0.8", "weekly");
  }

  // 4. Categorias de Estudos
  for (const c of STUDY_CATEGORIES) {
    addUrl(`/estudos/categoria/${c.slug}`, "0.7", "weekly");
  }

  // 5. Estudos Bíblicos Gerais
  for (const s of STUDIES) {
    addUrl(`/estudos/${s.slug}`, "0.8", "monthly");
  }

  // 6. Materiais Estruturados: Estudos, Escola Dominical e Apostilas
  for (const m of INITIAL_MATERIALS) {
    if (m.type === "estudo") {
      addUrl(`/estudos/${m.slug}`, "0.8", "monthly");
    } else if (m.type === "escola-dominical") {
      addUrl(`/estudos/escola-dominical/${m.slug}`, "0.8", "monthly");
    } else if (m.type === "apostila") {
      addUrl(`/estudos/apostilas/${m.slug}`, "0.8", "monthly");
    }
  }

  // 7. Devocionais Diários
  for (const d of DEVOTIONALS) {
    addUrl(`/devocionais/${d.slug}`, "0.7", "weekly");
  }

  // 8. Todos os 66 Livros e Capítulos da Bíblia Sagrada
  for (const b of BIBLE_BOOKS) {
    addUrl(`/biblia/${b.slug}`, "0.8", "monthly");
    for (let c = 1; c <= b.chapters; c++) {
      addUrl(`/biblia/${b.slug}/${c}`, "0.7", "monthly");
    }
  }

  // 9. Versículos Bíblicos Populares com URL própria
  const popularVerses = [
    "/biblia/joao/3/16",
    "/biblia/salmos/23/1",
    "/biblia/filipenses/4/13",
    "/biblia/romanos/8/28",
    "/biblia/isaias/41/10",
    "/biblia/mateus/11/28",
    "/biblia/proverbios/3/5",
    "/biblia/salmos/91/1",
    "/biblia/jeremias/29/11",
    "/biblia/1-corintios/13/4",
    "/biblia/galatas/5/22",
    "/biblia/efesios/6/10",
  ];

  for (const vUrl of popularVerses) {
    addUrl(vUrl, "0.8", "weekly");
  }

  // Montagem do XML Válido
  const entries = Array.from(urlMap.entries()).map(([loc, data]) => {
    return `  <url>\n    <loc>${SITE_URL}${loc}</loc>\n    <changefreq>${data.changefreq}</changefreq>\n    <priority>${data.priority}</priority>\n  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join(
    "\n"
  )}\n</urlset>\n`;

  const outputPath = path.join(root, "public", "sitemap.xml");
  fs.writeFileSync(outputPath, xml, "utf-8");
  console.log(`Sucesso: sitemap.xml gerado em ${outputPath} com ${entries.length} URLs canônicas.`);
}

generate().catch(console.error);
