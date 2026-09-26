---
title: "ADR-016: Conteúdo da plataforma fora das empresas (Novidades)"
sidebar_position: 16
tags: [adr, plataforma, rls, novidades]
---

# ADR-016: Conteúdo da plataforma fora das empresas (Novidades)

**Status:** Proposto (26/09/2026), implementado na task 1.14 — aguarda aprovação da arquiteta

## Contexto

Novidades são escritas pelo time Facter e lidas por todas as empresas. A regra geral ([ADR-014](./adr-014-multiempresa-banco-compartilhado.md)) é `org_id not null` com RLS em toda tabela de negócio, mas uma entrada de Novidades não pertence a nenhuma empresa. Já o pedido "Quero isso" pertence: é a empresa (e a pessoa) dizendo o que quer.

Também não existia quem pudesse escrever conteúdo para todas as empresas: todo papel da [matriz](../../produto/papeis-e-permissoes.md) é dentro de uma empresa.

## Decisão

1. **Schema `platform`** para conteúdo da Facter para todas as empresas: `platform.product_updates` e `platform.product_update_images`. Fora do RLS por organização, como o schema `identity` ([ADR-015](./adr-015-sessao-opaca-em-cookie.md)); o teste de cobertura de RLS ignora os dois schemas de propósito.
2. **Estado por pessoa fica em `identity`**: quando viu Novidades pela última vez (`users.updates_seen_at`) e quais banners fechou (`product_update_dismissals`).
3. **Pedido é dado da empresa**: `product_update_interests` no schema público, com `org_id` e RLS forçado, autor por `actor_id`. Desfazer grava `withdrawn_at`; nada é apagado.
4. **Equipe da plataforma** é uma marca no usuário (`identity.users.platform_staff`), definida só por migration ou script, nunca pela API. Rotas do painel interno usam um quarto nível de acesso, `@PlatformStaffRoute`, que a auditoria de rotas conhece.
5. **Imagem no banco** (`bytea`, até 1 MB, PNG ou JPEG) até a hospedagem ser decidida (ADR-012, pendente). Poucas imagens, servidas com cache longo por id. Quando existir armazenamento de objetos, a tabela vira ponteiro e as imagens migram.
6. **Público por grupo de papéis**, não por papel: Dono, Gestão de frota, Financeiro, Pátio, Oficina, Almoxarifado e Pneus, mapeados no código a partir dos 12 papéis. O feed mostra tudo a todos; o ponto no menu e o banner só aparecem para o público da entrada.

## Alternativas consideradas

| Alternativa | Por que não |
| --- | --- |
| Entradas com `org_id` da Facter e política especial | Mistura conteúdo global com dado de empresa e abre exceção na política de RLS, que é a garantia principal |
| Arquivo estático (markdown) no repositório da web | Sem "Quero isso", sem público por papel, sem aviso de pedido que chegou; cada entrada exigiria deploy |
| Serviço de terceiros de changelog | Texto fora do COPY.md e do i18n, dado de pedido fora do banco |

## Consequências

- Dois schemas fora do RLS (`identity`, `platform`), ambos sem dado de empresa; qualquer tabela com dado de empresa continua obrigada a ter `org_id` e RLS.
- O painel interno vive na mesma web, em rota carregada só por quem é da equipe.
