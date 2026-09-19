import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { Button } from "@/components/ui/button";
import { url } from "@/lib/site";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Política de Cookies — Bíblia Online" },
      {
        name: "description",
        content: "Entenda quais cookies usamos e como gerenciar suas preferências.",
      },
      { property: "og:title", content: "Política de Cookies — Bíblia Online" },
      { property: "og:description", content: "Como usamos cookies e como gerenciá-los." },
      { property: "og:url", content: url("/cookies") },
    ],
    links: [{ rel: "canonical", href: url("/cookies") }],
  }),
  component: CookiesPage,
});

function CookiesPage() {
  return (
    <LegalPage title="Política de Cookies">
      <p>
        Cookies são pequenos arquivos armazenados no seu navegador. Utilizamos apenas o
        necessário para o funcionamento do site, medição de audiência e, quando ativos, anúncios.
      </p>
      <h2>1. Cookies estritamente essenciais</h2>
      <p>
        Necessários para o funcionamento das ferramentas de leitura. Guardam suas preferências
        como tema escuro/claro, tamanho da tipografia, lista de versículos favoritados e progresso
        nos livros bíblicos. Sem eles, o site não consegue memorizar seu ponto de leitura entre acessos.
      </p>

      <h2>2. Cookies analíticos e de desempenho</h2>
      <p>
        Operados pelo Google Analytics (GA4), nos ajudam a entender de forma agrupada quais livros,
        capítulos, estudos e devocionais despertam mais interesse, permitindo planejar melhorias de navegação
        e desempenho de carregamento.
      </p>

      <h2>3. Cookies de publicidade e Google AdSense</h2>
      <p>
        Permitem a veiculação de anúncios relevantes através da rede de parceiros do Google. Eles medem
        a eficácia das campanhas e impedem que o mesmo anúncio seja exibido repetidamente ao mesmo leitor.
        Você pode recusá-los ou gerenciar seus consentimentos a qualquer instante sem perder acesso ao texto bíblico.
      </p>

      <h2>4. Como gerenciar ou redefinir suas preferências</h2>
      <p>
        Você tem controle total: além de limpar os cookies nas opções do seu próprio navegador,
        é possível reabrir nosso banner de consentimento clicando no botão abaixo:
      </p>
      <Button
        variant="outline"
        onClick={() => {
          localStorage.removeItem("bo:cookie-consent");
          location.reload();
        }}
      >
        Redefinir preferências de cookies
      </Button>
    </LegalPage>
  );
}
