# Corrigir sitemap, robots e indexação técnica

## Objetivo
Corrigir os arquivos públicos de rastreamento para que o Google reconheça o sitemap no domínio oficial, sem alterar a interface, o conteúdo religioso ou as funcionalidades do site.

## Alterações
- Trocar a origem canônica global de `https://word-quest-hub-93.lovable.app` para `https://bibliaonlineoficial.com.br`.
- Ajustar `/sitemap.xml` para emitir XML válido, com URLs absolutas exclusivamente no domínio oficial.
- Manter no sitemap somente páginas públicas, reais e indexáveis: páginas editoriais, livros, capítulos, temas, estudos, devocionais, orações e páginas comunitárias públicas estáveis.
- Excluir autenticação, administração, busca interna, favoritos, perfil, configurações e URLs privadas/dinâmicas sem lista pública confiável.
- Ajustar `/robots.txt` para apontar ao sitemap oficial e bloquear apenas áreas administrativas ou privadas.
- Alinhar também o arquivo estático de segurança para evitar que uma forma de publicação volte a expor o domínio antigo.
- Corrigir canonicals e `og:url` que dependem da origem global, sem qualquer mudança visual.

## Validação
- Testar localmente os tipos de resposta e o conteúdo real de `/sitemap.xml` e `/robots.txt`.
- Validar sintaxe XML, domínio de cada `<loc>`, duplicidades e correspondência de todas as URLs com rotas existentes.
- Verificar status HTTP, redirecionamentos, `Content-Type`, `X-Robots-Tag`, canonical e meta robots das páginas públicas principais.
- Publicar a correção no domínio de produção e repetir os testes diretamente em `https://bibliaonlineoficial.com.br`.
- Informar a quantidade final de URLs, validade do XML, bloqueios encontrados e resultado público após a publicação.

## Observação técnica
O erro atual foi reproduzido: o sitemap e o robots publicados respondem corretamente como XML/texto, mas ainda referenciam `https://word-quest-hub-93.lovable.app`. Isso faz o sitemap conter URLs fora da propriedade `https://bibliaonlineoficial.com.br/`, justificando a rejeição do Search Console.
