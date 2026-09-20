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
        Esta política de privacidade descreve como o portal <strong>Bíblia Online</strong> coleta, utiliza,
        armazena e protege os dados dos seus usuários, em total conformidade com a Lei Geral de Proteção de
        Dados Pessoais (LGPD — Lei nº 13.709/2018) e as diretrizes internacionais de transparência digital.
      </p>

      <h2>1. Dados de Leitura e Preferências Pessoais</h2>
      <p>
        O acesso à leitura dos textos bíblicos, planos, devocionais e estudos não exige a criação de conta
        nem fornecimento de dados pessoais. Suas preferências de navegação — incluindo tema (claro ou escuro),
        tamanho da tipografia, histórico recente de leitura e versículos favoritados — são armazenadas
        <strong>exclusivamente na memória local do seu próprio navegador (LocalStorage)</strong>. Esses dados
        não são transmitidos para servidores centrais e podem ser limpos a qualquer momento nas configurações do seu navegador.
      </p>

      <h2>2. Publicidade Programática e Google AdSense</h2>
      <p>
        Para manter a gratuidade de todo o acervo e a sustentabilidade dos servidores, este portal exibe
        anúncios veiculados pelo <strong>Google AdSense</strong> e fornecedores terceirizados parceiros.
      </p>
      <ul>
        <li>
          <strong>Cookies de publicidade:</strong> O Google e outras redes de anúncios utilizam cookies para
          veicular anúncios com base nas visitas anteriores dos usuários a este ou a outros sites na Internet.
        </li>
        <li>
          <strong>Anúncios personalizados:</strong> O uso de cookies de publicidade pelo Google permite que ele e
          seus parceiros veiculem anúncios para os usuários com base nas visitas feitas a este portal e a outros sites.
        </li>
        <li>
          <strong>Desativação da personalização (Opt-Out):</strong> Os usuários podem optar por desativar a
          publicidade personalizada acessando as{" "}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-primary/80"
          >
            Configurações de Anúncios do Google
          </a>
          . Alternativamente, você pode desativar o uso de cookies de terceiros para publicidade personalizada
          visitando o portal internacional{" "}
          <a
            href="https://www.aboutads.info/choices/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-primary/80"
          >
            www.aboutads.info
          </a>
          .
        </li>
      </ul>

      <h2>3. Métricas de Audiência e Google Analytics</h2>
      <p>
        Utilizamos ferramentas de análise de tráfego, como o Google Analytics (GA4), para coletar dados estatísticos
        anônimos e agregados sobre padrões de navegação (páginas mais lidas, tempo médio de permanência, tipo de
        dispositivo e distribuição geográfica geral). Esses dados são estritamente estatísticos e não identificam
        individualmente o leitor.
      </p>

      <h2>4. Seus Direitos segundo a LGPD</h2>
      <p>
        Conforme a legislação brasileira de proteção de dados, você tem pleno direito a confirmar a existência
        de tratamento de dados, solicitar acesso, correção, anonimização, bloqueio ou eliminação de informações.
        Como as suas anotações e histórico bíblico permanecem no seu próprio dispositivo, você pode excluí-los
        instantaneamente limpando os dados de navegação do seu browser.
      </p>

      <h2>5. Dados de Localização Geográfica (Recurso "Igrejas perto de você")</h2>
      <p>
        Para a utilização do recurso de busca de igrejas próximas (<code>/igrejas</code>), o portal pode solicitar acesso
        à sua localização geográfica através da API de Geolocalização do seu navegador.
      </p>
      <ul>
        <li>
          <strong>Ação exclusivamente voluntária:</strong> A localização só é solicitada após o clique explícito do usuário no botão <em>"Encontrar igrejas perto de mim"</em>. O site nunca solicita coordenadas de forma automática ao carregar páginas.
        </li>
        <li>
          <strong>Processamento em tempo real:</strong> As coordenadas de latitude e longitude são utilizadas estritamente em tempo real para calcular a distância e consultar estabelecimentos religiosos cadastrados em mapas.
        </li>
        <li>
          <strong>Não armazenamento:</strong> Não armazenamos, não registramos em banco de dados e não vinculamos as coordenadas geográficas exatas do usuário a contas de perfil ou identificadores pessoais.
        </li>
        <li>
          <strong>Alternativa manual:</strong> Usuários que optarem por não compartilhar sua localização podem realizar pesquisas manuais normalmente digitando o nome da cidade, bairro ou endereço desejado.
        </li>
      </ul>

      <h2>6. Canal de Atendimento e Encarregado (DPO)</h2>
      <p>
        Para esclarecer dúvidas sobre esta Política de Privacidade, exercer seus direitos ou reportar qualquer
        questão de conformidade com a LGPD, disponibilizamos nosso canal oficial de comunicação institucional:
      </p>
      <p className="font-medium text-foreground">
        E-mail de contato e privacidade: <span className="underline">privacidade@bibliaonline.me</span>
      </p>
    </LegalPage>
  ),
});
