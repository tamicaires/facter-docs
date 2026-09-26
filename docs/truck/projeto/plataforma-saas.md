---
title: "Plataforma SaaS"
sidebar_position: 2
tags: [plataforma, saas, planos, cobranca, configuracoes, lgpd, operacao, hub]
---

# Plataforma SaaS

Além das funcionalidades, um SaaS com cliente pagante precisa de uma camada comercial, de entrada, configuração, confiança e operação. Esta página lista o que o Truck precisa, o que entra no lançamento e a versão pragmática para o piloto. O que é comum aos produtos Facter nasce no módulo `plataforma` do Truck v2 e migra para o Hub quando ele existir ([ADR-010](../engenharia/adrs/adr-010-v2-do-nucleo.md)).

## Itens

| Área | Item | Lançamento | Versão para o piloto | Destino futuro |
| --- | --- | --- | --- | --- |
| Comercial | Planos e o que cada um libera (módulos, veículos, usuários) | Sim (modelo) | Planos no sistema, cobrança manual | Hub |
| Comercial | Cobrança automática (boleto, PIX, cartão) via gateway brasileiro | Depois | Contrato + boleto/PIX emitido à mão | Hub |
| Comercial | Nota fiscal de serviço (NFS-e) | Depois | Emitida pelo contador/ERP | Hub |
| Comercial | Inadimplência: carência e modo somente leitura | Depois | Caso a caso | Hub |
| Entrada | Importar dados de planilha (veículos, peças, funcionários, estoque inicial) e dos sistemas atuais (no piloto: SmartQuestion, Excel de pneus, histórico do Sofit; OS em Word e checklist em papel não têm histórico importável) | Sim | Importação feita pelo time, por script; o histórico de pneus do Excel dá valor ao módulo de pneus desde o primeiro dia | Truck |
| Entrada | Convite de usuário, primeiro acesso, redefinir senha | Sim | — | Hub |
| Entrada | Login sem e-mail (matrícula + PIN) com troca rápida de usuário no tablet compartilhado | Sim (decidido em 26/09/2026) | — | Hub |
| Entrada | Assistente de configuração inicial | Depois | Configuração feita junto com o piloto | Truck |
| Configuração | Configurações da empresa (fuso, prefixos, turnos, limite de ajuste de horário, base do rateio, campos obrigatórios, papéis) | Sim | Tela simples, esquema tipado com padrões | Truck |
| Configuração | Preferências de notificação do usuário | Sim (mínima) | — | Hub |
| Configuração | Feature flags por empresa (módulos, "em breve", rollout gradual) | Sim | Mesmo mecanismo dos planos | Hub |
| Comunicação | E-mail transacional | Sim | Provedor (Resend, SES) | Hub |
| Comunicação | Notificação no app | Sim | — | Hub |
| Comunicação | WhatsApp | Depois | — | Hub |
| Confiança | Termos e política de privacidade versionados com aceite registrado | Sim | — | Hub |
| Confiança | Exportar dados da empresa e excluir conta (LGPD) | Sim, sob demanda | Feito pelo time, por script | Hub |
| Confiança | Auditoria administrativa (permissão, configuração, plano) | Sim | — | Hub + Truck |
| Confiança | Backup com restauração testada, RPO/RTO definidos | Sim | Backup do provedor + teste de restauração | Infra |
| Operação | Backoffice interno (empresas, planos, uso, flags) | Sim (mínimo) | Tela simples só para o time | Hub |
| Operação | Canal de suporte | Sim | WhatsApp/e-mail de suporte | — |
| Operação | "Ver como o cliente vê", com consentimento e auditoria | Depois | — | Hub |
| Operação | Página de status e processo de incidente | Depois | — | Infra |
| Arquivos | Anexos em storage de objetos (R2/S3) com limite por plano | Sim | — | Truck |
| Arquivos | OS em PDF (cabeçalho, veículo e km, serviços, executores, peças, custos, assinatura de liberação) | Sim (decidido em 26/09/2026) | Versão simples gerada no servidor; 2–3 dias | Truck |
| Arquivos | Listas em Excel | Depois | — | Truck |
| Mobile | PWA instalável, fila local de ações, uso com sinal ruim | Sim (decidido em 26/09/2026) | — | Truck |
| Integrações | API pública, chaves e webhooks | Depois | — | Hub + Truck |

Os itens do lançamento, na versão para o piloto, somam cerca de 2 a 3 semanas.

## Lançamento

Lançamento único (decidido em 26/09/2026). As versões para o piloto da tabela acima valem para os primeiros clientes: importação, cobrança e configuração feitas pelo time até serem automatizadas.

## Decisões pendentes

- [ ] Planos: quais existem e o que cada um libera
