import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { url } from "@/lib/site";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Bíblia Online" },
      {
        name: "description",
        content:
          "Saiba como o Bíblia Online coleta, usa e protege seus dados, em conformidade com a LGPD.",
      },
      { property: "og:title", content: "Política de Privacidade — Bíblia Online" },
      { property: "og:description", content: "Como tratamos seus dados pessoais." },
      { property: "og:url", content: url("/privacidade") },
    ],
    links: [{ rel: "canonical", href: url("/privacidade") }],
  }),
  component: () => (
    <LegalPage title="Política de Privacidade">
      <p>
        Esta política explica como o portal Bíblia Online trata informações de quem utiliza o
        site, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
      </p>
      <h2>Dados que utilizamos</h2>
      <p>
        A leitura da Bíblia não exige cadastro. Preferências como tema, tamanho de fonte,
        favoritos, anotações e progresso de leitura são armazenados localmente no seu
        navegador e não são enviados aos nossos servidores.
      </p>
      <h2>Dados de navegação</h2>
      <p>
        Podemos utilizar ferramentas de medição de audiência para entender o uso do site
        (páginas acessadas, dispositivo, origem do acesso). Esses dados são tratados de forma
        agregada.
      </p>
      <h2>Publicidade</h2>
      <p>
        Quando anúncios estiverem ativos, parceiros de publicidade podem utilizar cookies para
        exibir conteúdo relevante. Você pode gerenciar suas preferências pelo banner de cookies.
      </p>
      <h2>Seus direitos</h2>
      <p>
        Você pode solicitar confirmação de tratamento, acesso, correção ou exclusão de dados
        pessoais. Limpar os dados do navegador remove imediatamente as informações salvas
        localmente.
      </p>
      <h2>Contato</h2>
      <p>Dúvidas sobre privacidade podem ser enviadas pela nossa página de contato.</p>
    </LegalPage>
  ),
});
