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
      <h2>Cookies essenciais</h2>
      <p>
        Guardam preferências como tema, tamanho da fonte, favoritos e progresso de leitura.
        Sem eles, o site perde funcionalidades básicas.
      </p>
      <h2>Cookies de medição</h2>
      <p>Ajudam a entender quais páginas são mais acessadas, de forma agregada.</p>
      <h2>Cookies de publicidade</h2>
      <p>
        Utilizados por parceiros de publicidade para exibir anúncios. Você pode recusá-los sem
        perder acesso ao conteúdo.
      </p>
      <h2>Gerenciar preferências</h2>
      <p>
        Você pode redefinir sua escolha a qualquer momento e o banner de consentimento será
        exibido novamente.
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
