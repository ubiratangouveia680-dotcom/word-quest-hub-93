import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { url } from "@/lib/site";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — Bíblia Online" },
      {
        name: "description",
        content: "Condições de uso do portal Bíblia Online: conteúdo, responsabilidades e direitos.",
      },
      { property: "og:title", content: "Termos de Uso — Bíblia Online" },
      { property: "og:description", content: "Condições de uso do portal." },
      { property: "og:url", content: url("/termos") },
    ],
    links: [{ rel: "canonical", href: url("/termos") }],
  }),
  component: () => (
    <LegalPage title="Termos de Uso">
      <p>
        Ao utilizar o Bíblia Online, você concorda com estas condições. O acesso ao conteúdo é
        gratuito e destinado a leitura, estudo e uso pessoal.
      </p>
      <h2>Conteúdo bíblico</h2>
      <p>
        O texto bíblico exibido utiliza a tradução João Ferreira de Almeida em domínio público.
        Traduções protegidas por direitos autorais só serão incluídas mediante licença.
      </p>
      <h2>Conteúdo editorial</h2>
      <p>
        Estudos, devocionais e orações são materiais originais deste portal, oferecidos para
        edificação pessoal. Interpretações apresentadas não substituem o acompanhamento
        pastoral ou o estudo aprofundado.
      </p>
      <h2>Respostas geradas por IA</h2>
      <p>
        A seção “Pergunte sobre a Bíblia” utiliza inteligência artificial. As respostas podem
        conter erros e devem ser conferidas no texto bíblico.
      </p>
      <h2>Limitação de responsabilidade</h2>
      <p>
        O portal é oferecido “como está”. Não nos responsabilizamos por decisões tomadas
        exclusivamente com base no conteúdo aqui publicado.
      </p>
    </LegalPage>
  ),
});
