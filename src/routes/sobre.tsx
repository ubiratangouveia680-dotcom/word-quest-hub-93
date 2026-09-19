import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { url } from "@/lib/site";

export const Route = createFileRoute("/sobre")({
  head: () => ({ meta: [
    { title: "Sobre a Bíblia Online — propósito e compromisso editorial" },
    { name: "description", content: "Conheça o propósito da Bíblia Online, sua fonte de texto bíblico e seus compromissos com clareza, acesso e responsabilidade." },
    { property: "og:title", content: "Sobre a Bíblia Online" },
    { property: "og:description", content: "Um portal para leitura, estudo e aplicação responsável da Bíblia." },
    { property: "og:type", content: "website" }, { property: "og:url", content: url("/sobre") },
    { name: "twitter:card", content: "summary" },
  ], links: [{ rel: "canonical", href: url("/sobre") }] }),
  component: AboutPage,
});

function AboutPage() {
  return <SiteLayout><main className="mx-auto w-full max-w-3xl px-4 py-10"><h1 className="font-display text-3xl font-semibold sm:text-4xl">Sobre a Bíblia Online</h1><div className="gold-rule my-6" /><div className="space-y-6 text-muted-foreground [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-foreground [&_p]:leading-relaxed"><section><h2>Nosso propósito</h2><p className="mt-2">A Bíblia Online foi criada para facilitar a leitura diária das Escrituras, a pesquisa de passagens e o acesso a reflexões, estudos, devocionais e orações em português.</p></section><section><h2>Compromisso editorial</h2><p className="mt-2">Buscamos produzir conteúdo original, claro e útil. Nossos materiais oferecem apoio à leitura, mas não substituem o texto bíblico, o convívio em uma comunidade de fé ou orientação pastoral e profissional.</p></section><section><h2>Fonte do texto bíblico</h2><p className="mt-2">O texto exibido é fornecido pela API pública bible-api.com como tradução “João Ferreira de Almeida”, classificada pelo próprio serviço como de domínio público. O provedor não identifica de forma conclusiva a edição e o ano exatos do arquivo-fonte; por isso, não atribuímos o texto a uma revisão moderna específica.</p></section><section><h2>Tecnologia responsável</h2><p className="mt-2">Favoritos, anotações, tema e progresso podem ser guardados no seu dispositivo. A ferramenta Pergunte à Bíblia usa inteligência artificial e pode apresentar interpretações ou erros; suas respostas devem ser conferidas nas Escrituras.</p></section></div><div className="mt-8 flex flex-wrap gap-2"><Button asChild><Link to="/biblia">Ler a Bíblia</Link></Button><Button asChild variant="outline"><Link to="/contato">Entrar em contato</Link></Button></div></main></SiteLayout>;
}