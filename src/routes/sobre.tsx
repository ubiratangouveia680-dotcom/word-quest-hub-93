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
  return (
    <SiteLayout>
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Sobre a Bíblia Online</h1>
        <div className="gold-rule my-6" />

        <div className="space-y-6 text-muted-foreground [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-foreground [&_p]:leading-relaxed">
          <section>
            <h2>Nosso propósito e missão</h2>
            <p className="mt-2">
              A <strong>Bíblia Online</strong> nasceu com a missão de democratizar o acesso às Sagradas Escrituras em
              língua portuguesa, oferecendo um ambiente limpo, acessível, rápido e livre de distrações para leitura devocional,
              pesquisa teológica e edificação espiritual diária.
            </p>
          </section>

          <section>
            <h2>Compromisso editorial e diretrizes (E-E-A-T)</h2>
            <p className="mt-2">
              Todos os nossos estudos bíblicos, devocionais diários e orações são materiais autorais cuidadosamente
              elaborados à luz do texto bíblico. Nossos compromissos editoriais incluem:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1.5 pl-2 text-sm">
              <li><strong>Fidelidade bíblica:</strong> Interpretação contextualizada fundamentada nas línguas originais e tradições teológicas históricas.</li>
              <li><strong>Respeito e ecumenismo:</strong> Tratamento respeitoso das diferentes tradições cristãs, sem sectarismo.</li>
              <li><strong>Aplicação prática:</strong> Foco em como os ensinamentos das Escrituras se aplicam aos desafios concretos da vida moderna (família, trabalho, saúde mental e comunidade).</li>
              <li><strong>Apoio, não substituição:</strong> Nossos conteúdos servem como auxílio à leitura diária, não substituindo o convívio presencial em uma comunidade de fé ou aconselhamento profissional.</li>
            </ul>
          </section>

          <section>
            <h2>Fonte do texto bíblico e direitos autorais</h2>
            <p className="mt-2">
              O texto bíblico exibido é fornecido via API pública bible-api.com, correspondente à tradicional tradução
              de João Ferreira de Almeida, classificada como obra em domínio público. Respeitamos integralmente os direitos
              autorais e patrimoniais de todas as versões e conteúdos de terceiros.
            </p>
          </section>

          <section>
            <h2>Tecnologia responsável e privacidade</h2>
            <p className="mt-2">
              Acreditamos que a privacidade do leitor é sagrada. Suas anotações, capítulos lidos e preferências
              visuais permanecem armazenadas no seu próprio dispositivo. As ferramentas de inteligência artificial
              são desenhadas para fins estritamente pedagógicos e suas respostas devem ser sempre conferidas nas Escrituras.
            </p>
          </section>

          <section>
            <h2>Transparência e canal editorial</h2>
            <p className="mt-2">
              Para sugestões de novos temas, correções de digitação, dúvidas teológicas ou contato com a equipe
              editorial, colocamos à disposição o nosso canal de comunicação:
            </p>
            <p className="mt-1 font-medium text-foreground">
              E-mail editorial: <span className="underline">editorial@bibliaonline.me</span>
            </p>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/biblia">Ler a Bíblia</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/estudos">Explorar Estudos Bíblicos</Link>
          </Button>
        </div>
      </main>
    </SiteLayout>
  );
}