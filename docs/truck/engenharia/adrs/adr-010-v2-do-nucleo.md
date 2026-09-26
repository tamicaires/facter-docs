---
title: "ADR-010: v2 do núcleo com corte de escopo"
sidebar_position: 10
tags: [adr, v2, arquitetura, schema, lancamento]
---

# ADR-010: v2 do núcleo com corte de escopo

**Status:** Aprovado (26/09/2026)

## Contexto

A [auditoria de 2026-09](../auditoria-2026-09.md) encontrou cinco causas raiz que atravessam o sistema inteiro:

1. regras só na aplicação, com portas laterais;
2. nenhum controle de concorrência;
3. isolamento entre empresas e permissões opt-in;
4. fundação do schema errada;
5. infraestrutura nunca exercitada.

As causas 3 e 4 são estruturais. Corrigi-las no schema atual exige dezenas de migrations encadeadas, cada uma mexendo em repositórios e use cases.

O produto ainda não tem cliente real, e o lançamento é no começo de 2027. Não há dado de produção para migrar. Essa condição deixa de existir no dia do lançamento.

## Decisão

Construir o backend v2 do núcleo num projeto novo, com schema redesenhado e os [padrões de engenharia](../padroes/padroes-de-engenharia.md) desde o primeiro commit. A lógica de domínio que está boa é portada (entidades de ordem, serviço, emergência e pneu, calculador de duração, regras de localização, erros de domínio).

O frontend também é refeito: um app novo usando só o `@facter/ds-core`, portando a casca boa do app atual (cliente HTTP, auth, permissões, wrapper de mutations). Quando a API v1 é desligada, nenhuma tela do app atual sobrevive, então adaptá-lo custaria o mesmo e deixaria dois design systems, código morto e regras duplicadas para limpar.

API, web e contrato vivem num monorepo `facter-truck` (`apps/api`, `apps/web`, `packages/contracts`). A web roda na Vercel; a API e o worker da fila rodam no Render.

O escopo do lançamento está no [roadmap](../../projeto/roadmap.md#escopo-do-lançamento): além do núcleo (ativos, ordem de serviço, serviços e executores, estoque e requisições, pessoas), entram pneus, checklists, rateio completo, indicadores de decisão com resumo semanal por e-mail, "Aprender com o cliente" e OS em PDF. Ficam para depois: preventiva (logo após o lançamento), analytics completo, centros de custo, socorro mecânico e integrações. O lançamento é único, sem etapa de piloto separada.

O modelo de organizações segue o [ADR-011](./adr-011-ecossistema-e-compartilhamento.md): cada organização é dona dos dados que produz, e o compartilhamento entre organizações é concedido por nível. Um cliente isolado é só uma organização sem concessões.

A decisão assume os princípios do [roadmap](../../projeto/roadmap.md): dados primeiro (fatos gravados desde o primeiro dia), registrar sem atrito, operação no tablet e gestão no notebook, PWA instalável com fila local e login por matrícula e PIN, e design system evoluindo puxado pela demanda da web v2.

O que é comum aos produtos Facter (identidade e login, empresas, usuários e membros, permissões e papéis, "Quero isso", notificações e novidades) nasce num módulo `plataforma` destacável, porque o Hub da Facter vai centralizar essa parte no futuro e hoje ainda não existe. Os módulos de domínio só conhecem um `CurrentActor` e a interface da plataforma; a auditoria aponta para uma tabela local de atores, não para a de usuários; ids são UUID globais e o token é validado por chave pública configurável. Trocar a plataforma local pelo Hub é trocar a implementação da interface e a configuração do token.

A API atual fica congelada: sem funcionalidade nova e com correção só quando algo bloqueia uma demonstração.

## Alternativas consideradas

| Alternativa | Por que não |
| --- | --- |
| A. Refatorar tudo no lugar | Cabe no prazo (8–10 semanas), mas leva para produção o ativo polimórfico, o eixo só em reboque e os conceitos duplicados. Toda correção futura vira migração de dado de cliente. |
| C. v2 de tudo, incluindo os módulos fora do núcleo | Não cabe no prazo. Preventiva, analytics completo, centros de custo, socorro e integrações entram depois do lançamento. |

## Consequências

- **Positivas:** lançamento sobre fundações certas (multiempresa com RLS, ativo unificado, `Decimal`, sessões de trabalho, livro de estoque, outbox, versionamento). Módulos seguintes crescem sobre base sólida.
- **Negativas:** o lançamento sai com menos funcionalidades do que existem hoje. Existe um período de dois backends convivendo.
- **Riscos:** subestimar o núcleo, reescrever o que funcionava, frontend e backend desencontrados. As mitigações estão na seção de decisão da auditoria.

## Pendências para aprovar

- ~~Escopo final do lançamento~~: pneus e checklists entram (26/09/2026).
- ~~Tamanho do time~~: a arquiteta com o Claude (26/09/2026).
- ~~Hospedagem~~: web na Vercel, API e worker no Render (26/09/2026).
- ~~Repositório~~: novo (26/09/2026).
