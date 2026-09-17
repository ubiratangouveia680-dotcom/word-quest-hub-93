# Revisão profissional da Bíblia Online

## Objetivo
Evoluir o projeto atual para um portal bíblico completo, rápido e preparado para SEO e futura monetização, preservando todas as páginas, recursos e identidade visual que já funcionam.

## Etapas de implementação

### 1. Base editorial e transparência
- Corrigir as afirmações sobre direitos autorais: identificar a Bíblia como conteúdo fornecido pela `bible-api.com`, classificado pelo provedor como domínio público, sem afirmar uma edição específica não comprovada.
- Criar a página “Sobre a Bíblia Online” e ampliar Termos, Privacidade e Cookies com fonte do texto, IA, anúncios, Analytics, armazenamento local e mecanismo de contato.
- Manter contato honesto: envio real somente se houver mecanismo disponível; caso contrário, informar claramente a alternativa.

### 2. Navegação e experiência de leitura
- Completar o menu com Buscar e Favoritos, mantendo menu compacto no celular e barra inferior.
- Adicionar breadcrumbs visuais nas páginas hierárquicas.
- Preservar o leitor atual, áudio, anotações, favoritos, controle de fonte e navegação entre capítulos.
- Melhorar áreas de toque, foco de teclado, contraste, rótulos acessíveis e comportamento em telas estreitas.
- Adicionar compartilhamento direto por WhatsApp, além de copiar e compartilhar pelo dispositivo.

### 3. Página inicial completa
- Reorganizar a home com: apresentação principal, ações “Ler a Bíblia” e “Versículo do Dia”, busca rápida, continuar leitura, versículo diário, livros por Testamento, orações, devocional, estudos, versículos populares, temas, Pergunte à Bíblia e conteúdos recentes.
- Reutilizar os componentes e dados atuais, mantendo anúncios discretos e sem interromper a leitura.

### 4. Versículo do Dia
- Criar uma seleção anual determinística de 365 referências: todos recebem o mesmo conteúdo na mesma data.
- Acrescentar reflexão e palavra do dia variadas, além de favoritar, copiar, compartilhar e abrir o contexto.
- Manter URLs e conteúdo rastreáveis sem duplicação artificial.

### 5. Conteúdo editorial escalável
- Expandir para pelo menos 100 orações originais, 100 devocionais originais e 100 estudos originais.
- Cobrir todas as categorias solicitadas, com estruturas editoriais completas e textos realmente distintos.
- Criar rotas próprias para orações quando necessário, preservando a página existente como índice.
- Adicionar “Você também pode gostar” com relações coerentes entre conteúdos.

### 6. Temas e versículos por tema
- Criar índice e páginas próprias para Temas Bíblicos.
- Criar as 15 páginas de versículos por tema solicitadas, com introdução, referências, reflexão, aplicação e links relacionados.
- Integrar temas à home, estudos, orações e navegação interna.

### 7. Busca e Pergunte à Bíblia
- Reconhecer livro, livro + capítulo, referência completa, palavra e frase.
- Mostrar referência, trecho e ação “Ler capítulo” em cada resultado.
- Manter a IA atual, melhorar as sugestões e exigir referências bíblicas nas respostas.
- Exibir aviso claro de possíveis interpretações e de que a ferramenta não substitui orientação pastoral.

### 8. SEO técnico
- Garantir títulos, descrições, H1, canonical, Open Graph, Twitter Card e URL própria em toda rota de conteúdo.
- Adicionar dados estruturados adequados para artigos, breadcrumbs, coleções e páginas bíblicas.
- Corrigir o `noindex` da busca e ajustar o robots para permitir que o robô leia essa instrução.
- Atualizar sitemap automático com datas coerentes e todas as novas páginas indexáveis.
- Criar uma página 404 útil e acessível.
- Não adicionar imagem social genérica sem aprovação; os metadados de texto serão completos e a imagem poderá ser criada separadamente em 1200×630.

### 9. Monetização, Analytics e desempenho
- Preservar a configuração segura de AdSense no painel; anúncios só aparecem com Publisher ID e slots válidos.
- Manter espaços responsivos, sem anúncios falsos, cliques automáticos ou chamadas incentivando cliques.
- Deixar Analytics configurável, sem inventar identificador.
- Remover duplicação de scripts, reduzir dependências externas quando viável e revisar carregamento, estabilidade visual e resposta em Android.

### 10. Validação final
- Testar desktop e celular, incluindo 320–411 px, tema claro/escuro, teclado e fluxos principais.
- Verificar links, navegação, busca, áudio, favoritos, copiar, compartilhar, IA, consentimento, anúncios configurados/desativados e páginas vazias.
- Revisar console, requisições, overflow, metadados, sitemap, robots e conteúdo duplicado.
- Entregar um checklist final dos 37 requisitos, indicando o que está concluído e qualquer item dependente de credencial, domínio ou serviço externo.

## Detalhes técnicos
- Manter TanStack Start, Lovable Cloud e os componentes existentes.
- Criar rotas reais para conteúdos compartilháveis; não substituir páginas por âncoras na home.
- Manter dados editoriais em estruturas tipadas e reutilizáveis para evitar duplicação de interface.
- Preservar URLs públicas atuais; novas URLs usarão slugs em português sem acentos.
- Todo conteúdo novo será incluído no projeto, sem geração no carregamento da página.
