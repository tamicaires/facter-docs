---
title: "Papéis e permissões"
sidebar_position: 2
tags: [permissoes, papeis, rbac, seguranca, v2]
---

# Papéis e permissões

Nem todo mundo vê nem faz tudo. O Truck separa duas camadas: o **isolamento entre empresas**, garantido pelo banco ([ADR-014](../engenharia/adrs/adr-014-multiempresa-banco-compartilhado.md)), e a **permissão dentro da empresa**, descrita nesta página. A matriz abaixo é a proposta de papéis padrão; cada empresa pode criar papéis próprios ou ajustar os padrões.

:::info[Proposta em revisão]
Matriz escrita em 26/09/2026 para revisão. Depois de aprovada, vira o catálogo de permissões do código e a base dos testes de permissão.
:::

## Regras gerais

1. **Permissão por ação de negócio** (`work_order.finish`), não por "ler, criar, editar, apagar".
2. **Negado por padrão.** O que não está concedido é proibido; rota sem permissão declarada não sobe.
3. **Papéis são dados.** O sistema traz os papéis padrão; a empresa ajusta sem mexer em código.
4. **Escopo** de cada permissão concedida:
   - **E** (empresa): tudo da organização.
   - **B** (base): só da base ou oficina à qual a pessoa está ligada.
   - **P** (próprio): só o que é da pessoa (OS em que trabalha, pedidos que fez, veículo que dirige).
5. **O filtro de escopo é aplicado na consulta ao banco**, não só na tela.
6. **Leitura sensível tira o campo da resposta da API** para quem não tem a permissão; nada vaza pela rede.
7. **Mudou o papel, a sessão cai na hora.**
8. **Uma pessoa pode ter mais de um papel**; vale a soma das permissões e o escopo mais amplo.

## Papéis padrão

| Sigla | Papel | Quem é | Dispositivo típico |
| --- | --- | --- | --- |
| **Adm** | Administrador | Responsável pelo sistema na empresa: usuários, papéis, configurações, compartilhamento | Notebook |
| **Ges** | Gestor | Dono, diretoria, chefia: acompanha tudo, decide, aprova o que é caro ou excepcional | Notebook |
| **Sup** | Supervisor de manutenção | Chefe de oficina: opera, distribui trabalho e aprova no dia a dia | Tablet e notebook |
| **Pla** | Planejador | Consultor de manutenção: abre e organiza OS, designa mecânicos | Tablet |
| **Mec** | Mecânico | Executa serviços | Tablet ou celular, muitas vezes compartilhado |
| **Alm** | Almoxarife | Controla peças e estoque | Tablet ou notebook |
| **CtP** | Controlador de pneus | Controla o ciclo de vida dos pneus e confirma operações | Tablet ou notebook |
| **Bor** | Borracheiro | Executa inspeção, troca e rodízio de pneus | Tablet |
| **Ins** | Inspetor | Faz checklists de inspeção (entrada, pátio, saída) | Tablet |
| **Fin** | Financeiro / controladoria | Custos, rateio, exportações para o ERP; não opera a oficina | Notebook |
| **Mot** | Motorista | Relata problema do veículo que dirige e acompanha o status | Celular |
| **Lei** | Leitura | Consulta relatórios e indicadores, sem nenhuma ação | Notebook |

Fora das empresas existe o **Suporte Facter** (ver [acesso de suporte](#acesso-de-suporte)), que não é um papel da empresa.

**Legenda da matriz:** E = empresa · B = base · P = próprio · — = sem acesso.

:::info[Esta matriz é o código]
As permissões e os papéis padrão do `facter-truck` foram gerados desta página (`apps/api/src/platform/auth/permissions.ts` e `system-roles.ts`). Mudou uma célula aqui, muda lá no mesmo ciclo, e vice-versa. O teste `role-matrix.spec.ts` confere cada rota contra a permissão esperada e cada papel contra a sua coluna.
:::

## Plataforma e administração

| Permissão | O que permite | Adm | Ges | Sup | Pla | Mec | Alm | CtP | Bor | Ins | Fin | Mot | Lei |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `member.manage` | Convidar, suspender, trocar papel de pessoas | E | — | — | — | — | — | — | — | — | — | — | — |
| `role.manage` | Criar e ajustar papéis da empresa | E | — | — | — | — | — | — | — | — | — | — | — |
| `settings.manage` | Configurações da empresa (fuso, prefixos, limites, motivos) | E | — | — | — | — | — | — | — | — | — | — | — |
| `base.manage` | Bases, boxes, depósitos | E | — | — | — | — | — | — | — | — | — | — | — |
| `employee.manage` | Funcionários, cargos, turnos | E | E | B | — | — | — | — | — | — | — | — | — |
| `sharing.manage` | Conceder e revogar compartilhamento com outras empresas | E | — | — | — | — | — | — | — | — | — | — | — |
| `sharing.view_received` | Ver os dados que outras empresas compartilharam conosco | E | E | E | E | — | — | E | — | — | E | — | E |
| `access_review.view` | Relatório de quem tem acesso a quê (auditoria) | E | E | — | — | — | — | — | — | — | E | — | — |
| `audit_log.view` | Trilha de alterações administrativas | E | E | — | — | — | — | — | — | — | E | — | — |
| `feature.request` | Botão "Quero isso" | E | E | E | E | E | E | E | E | E | E | E | E |

## Ativos

| Permissão | O que permite | Adm | Ges | Sup | Pla | Mec | Alm | CtP | Bor | Ins | Fin | Mot | Lei |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `vehicle.view` | Ver veículos, conjuntos, engates, posições | E | E | E | E | E | E | E | E | E | E | P | E |
| `vehicle.manage` | Cadastrar e editar veículos e tipos de conjunto | E | E | — | E | — | — | — | — | — | — | — | — |
| `trailer_set.recompose` | Montar ou alterar conjunto de implementos | E | E | E | E | — | — | — | — | — | — | — | — |
| `coupling.record` | Registrar engate e desengate | E | E | E | E | E | — | — | — | E | — | — | — |
| `meter.record` | Registrar leitura de km ou horas | E | E | E | E | E | — | — | E | E | — | P | — |
| `meter.correct` | Corrigir leitura menor que a anterior | E | E | E | — | — | — | — | — | — | — | — | — |

## Oficina: ordens de serviço

| Permissão | O que permite | Adm | Ges | Sup | Pla | Mec | Alm | CtP | Bor | Ins | Fin | Mot | Lei |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `work_order.view` | Ver OS | E | E | B | B | P | B | B | P | B | E | P | E |
| `work_order.open` | Abrir OS | E | E | B | B | — | — | — | — | B | — | — | — |
| `work_order.start` | Colocar em manutenção (box) | E | E | B | B | — | — | — | — | — | — | — | — |
| `work_order.pause` | Pausar e retomar a OS | E | E | B | B | — | — | — | — | — | — | — | — |
| `work_order.finish` | Finalizar a OS e liberar o veículo | E | E | B | B | — | — | — | — | — | — | — | — |
| `work_order.cancel` | Cancelar OS | E | E | B | — | — | — | — | — | — | — | — | — |
| `work_order.reopen` | Reabrir OS finalizada (com motivo) | E | E | — | — | — | — | — | — | — | — | — | — |
| `work_order.note` | Escrever notas | E | E | B | B | P | B | B | P | B | — | — | — |
| `work_order.attach` | Anexar fotos | E | E | B | B | P | — | B | P | B | — | P | — |
| `work_order.print` | Gerar a OS em PDF | E | E | B | B | P | — | — | — | — | E | — | E |
| `maintenance_request.create` | Pedir manutenção (ao próprio time ou a oficina parceira) | E | E | B | B | — | — | — | — | — | — | P | — |
| `maintenance_request.respond` | Aceitar ou recusar pedido de manutenção recebido | E | E | B | B | — | — | — | — | — | — | — | — |

## Oficina: serviços e tempo

| Permissão | O que permite | Adm | Ges | Sup | Pla | Mec | Alm | CtP | Bor | Ins | Fin | Mot | Lei |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `service.add` | Adicionar serviço à OS (com componente) | E | E | B | B | P | — | — | — | B | — | — | — |
| `service.assign` | Designar e remover mecânicos | E | E | B | B | — | — | — | — | — | — | — | — |
| `service.work` | Iniciar, pausar e concluir o próprio trabalho | — | — | B | — | P | — | — | P | — | — | — | — |
| `service.control` | Pausar, retomar ou concluir o serviço de todos os executores | E | E | B | B | — | — | — | — | — | — | — | — |
| `service.cancel` | Cancelar serviço | E | E | B | B | — | — | — | — | — | — | — | — |
| `service.mark_rework` | Marcar ou desmarcar retrabalho | E | E | B | B | P | — | — | — | — | — | — | — |
| `service.adjust_time` | Ajustar horário de sessão dentro do limite configurado | E | E | B | — | P | — | — | P | — | — | — | — |
| `service.adjust_time_beyond_limit` | Ajustar horário além do limite (fica registrado) | E | E | B | — | — | — | — | — | — | — | — | — |
| `external_service.record` | Registrar serviço externo e o valor | E | E | B | B | — | — | — | — | — | E | — | — |

## Estoque e peças

| Permissão | O que permite | Adm | Ges | Sup | Pla | Mec | Alm | CtP | Bor | Ins | Fin | Mot | Lei |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `part.view` | Ver catálogo e saldo | E | E | B | B | B | E | E | B | — | E | — | E |
| `part.manage` | Cadastrar peças, categorias, unidades | E | E | — | — | — | E | — | — | — | — | — | — |
| `part_request.create` | Pedir peça para uma OS | E | E | B | B | P | B | — | P | — | — | — | — |
| `part_request.approve` | Aprovar ou recusar pedido (nunca o próprio) | E | E | B | — | — | B | — | — | — | — | — | — |
| `part_request.deliver` | Entregar peça (gera saída) | E | — | — | — | — | B | — | — | — | — | — | — |
| `part_request.return` | Registrar devolução | E | — | — | — | — | B | — | — | — | — | — | — |
| `stock.receive` | Entrada de compra | E | — | — | — | — | E | — | — | — | — | — | — |
| `stock.transfer` | Transferir entre depósitos | E | E | — | — | — | E | — | — | — | — | — | — |
| `stock.adjust` | Ajuste de inventário (com motivo) | E | E | — | — | — | E | — | — | — | — | — | — |
| `stock.adjust_approve` | Aprovar ajuste acima do limite configurado | E | E | — | — | — | — | — | — | — | E | — | — |
| `depot.authorize_operator` | Autorizar oficina parceira a operar depósito (consignado) | E | E | — | — | — | — | — | — | — | — | — | — |

## Pneus

| Permissão | O que permite | Adm | Ges | Sup | Pla | Mec | Alm | CtP | Bor | Ins | Fin | Mot | Lei |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `tire.view` | Ver pneus, ficha e linha do tempo | E | E | E | E | B | E | E | B | — | E | — | E |
| `tire.receive` | Entrada de carga (gera número de fogo) | E | — | — | — | — | E | E | — | — | — | — | — |
| `tire.reserve` | Liberar e reservar pneus | E | — | — | — | — | — | E | — | — | — | — | — |
| `tire.operate` | Registrar troca, rodízio e inspeção | E | — | — | — | — | — | E | B | — | — | — | — |
| `tire.confirm_operation` | Confirmar operação lançada pelo borracheiro | E | — | — | — | — | — | E | — | — | — | — | — |
| `tire.retread` | Envio e retorno de recapagem | E | — | — | — | — | — | E | — | — | — | — | — |
| `tire.scrap` | Descartar pneu (com motivo) | E | — | — | — | — | — | E | — | — | — | — | — |
| `tire.scrap_approve` | Aprovar descarte | E | E | E | — | — | — | — | — | — | — | — | — |
| `tire.reverse` | Estornar lançamento errado (novo evento, nunca edição) | E | — | — | — | — | — | E | — | — | — | — | — |
| `tire.settings` | Parâmetros de alerta (sulco, pressão, dias parado) | E | E | — | — | — | — | E | — | — | — | — | — |

## Checklists

| Permissão | O que permite | Adm | Ges | Sup | Pla | Mec | Alm | CtP | Bor | Ins | Fin | Mot | Lei |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `checklist.view` | Ver checklists | E | E | B | B | P | — | — | — | B | — | P | E |
| `checklist.execute` | Executar checklist | E | E | B | B | P | — | — | P | B | — | P | — |
| `checklist.create_service` | Transformar não conformidade em serviço | E | E | B | B | — | — | — | — | B | — | — | — |
| `checklist_template.manage` | Criar e editar modelos | E | E | E | — | — | — | — | — | — | — | — | — |

## Custos, rateio e indicadores

| Permissão | O que permite | Adm | Ges | Sup | Pla | Mec | Alm | CtP | Bor | Ins | Fin | Mot | Lei |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `indicator.view` | Ver indicadores de decisão | E | E | B | B | — | — | B | — | — | E | — | E |
| `allocation.view` | Ver rateio | E | E | — | — | — | — | — | — | — | E | — | E |
| `allocation.close` | Fechar e reabrir mês de rateio | E | — | — | — | — | — | — | — | — | E | — | — |
| `data.export` | Exportar CSV de fatos e indicadores | E | E | — | — | — | — | — | — | — | E | — | E |
| `weekly_digest.receive` | Receber o resumo semanal por e-mail | E | E | E | — | — | — | — | — | — | E | — | E |

## Leitura sensível

Sem a permissão, o campo **não sai da API**; a tela mostra só o que chegou.

| Permissão | Campos protegidos | Adm | Ges | Sup | Pla | Mec | Alm | CtP | Bor | Ins | Fin | Mot | Lei |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `cost.view` | Custo de OS, serviço, peça, veículo; CPK; composição do custo | E | E | B | B | — | E | E | — | — | E | — | E |
| `labor_rate.view` | Custo/hora dos cargos e custo de mão de obra por pessoa | E | E | — | — | — | — | — | — | — | E | — | — |
| `billing.view` | Valor cobrado do cliente (oficina terceira) | E | E | — | — | — | — | — | — | — | E | — | — |
| `productivity.view_individual` | Horas trabalhadas e produtividade por pessoa | E | E | B | — | P | — | — | P | — | — | — | — |
| `stock.value_view` | Valor do estoque e preço de peça | E | E | — | — | — | E | E | — | — | E | — | E |
| `personal_data.view` | Telefone, e-mail e documentos de funcionários | E | E | B | — | — | — | — | — | — | — | — | — |

Mecânico e borracheiro veem **as próprias horas** (escopo P), nunca as dos colegas: não existe ranking na oficina.

## Papéis personalizados

Cada empresa pode criar os próprios papéis (quem tem `role.manage`, na matriz só o Administrador). No schema, papel com `org_id` é da empresa; sem `org_id`, é padrão do sistema.

1. **Criar a partir de um modelo:** o caminho principal é "Duplicar papel" de um padrão parecido e ajustar.
2. **Papéis padrão não são editados:** pertencem à Facter e melhoram com o tempo; quem quer outra coisa duplica e ajusta a cópia.
3. **Só permissões do catálogo, e só de módulos contratados:** sem o módulo de Pneus, as permissões de pneus nem aparecem.
4. **A segregação de função vale para qualquer papel:** as regras abaixo estão no domínio e no banco, então nenhum papel personalizado abre brecha (ex.: aprovar o próprio pedido continua impossível).
5. **Permissões sensíveis pedem confirmação** na tela (`cost.view`, `labor_rate.view`, `billing.view`, `personal_data.view`), e toda criação ou mudança de papel entra na trilha de auditoria.
6. **Papel em uso não é apagado:** as pessoas precisam ser movidas antes.

Na tela: permissões agrupadas por módulo, escolha de escopo (E, B, P) em cada uma e uma prévia do que uma pessoa com esse papel vai ver. O nome de um papel personalizado é texto da empresa e não é traduzido.

## Segregação de função

Garantidas no domínio e, quando possível, no banco:

- Quem **pede** peça não **aprova** o próprio pedido (`check` em `part_requests`).
- Quem **lança** ajuste de estoque acima do limite não o **aprova**.
- Quem **registra** descarte de pneu não o **aprova**.
- Quem **ajusta** horário além do limite fica registrado como autor do ajuste, com motivo obrigatório.
- Quem **fecha** o mês de rateio é registrado; reabrir exige motivo.

## Ecossistema

O acesso a dados de **outra empresa** não vem de papel, vem de **concessão** ([ADR-011](../engenharia/adrs/adr-011-ecossistema-e-compartilhamento.md)). Dentro da empresa que recebe, só quem tem `sharing.view_received` vê o que foi compartilhado, e as leituras sensíveis continuam valendo: um Planejador da Suzano vê o status e os serviços feitos pela Vale, mas não o custo interno da Vale, que nem é publicado abaixo do nível completo.

## Acesso de suporte

O time Facter não tem acesso aos dados de nenhuma empresa. Para suporte, o administrador da empresa **concede acesso temporário** (ex.: 24 horas), com escopo de leitura por padrão; tudo o que o suporte vê e faz entra na trilha de auditoria, e o administrador pode revogar a qualquer momento. Implementação depois do lançamento; até lá, suporte só com a tela compartilhada pelo cliente.

## Pontos para decidir

- **Supervisor aprova descarte de pneu?** A matriz propõe que sim (junto com Gestor), pelo documento de pneus.
- **Motorista no lançamento:** a matriz prevê o papel, mas as telas dele (relatar problema pelo celular, ver status) podem ficar para depois.
- **Inspetor separado do Mecânico** ou o mecânico faz checklist: a matriz permite os dois.
- **Planejador vê custo** (hoje sim, escopo base): algumas empresas preferem esconder.
- **Limites** (ajuste de horário, ajuste de estoque) vêm das configurações da empresa.

## Papéis do v1 (referência)

`ADMIN`, `SUPER_ADMIN`, `MAINTENANCE_MANAGER`, `MAINTENANCE_CONSULTANT`, `PARTS_MANAGER`, `PARTS_CONSULTANT`, `TIRE_CONSULTANT`, `REPORT_MANAGER`, `REPORT_VIEWER`, `GENERAL_VIEWER`, `MECHANIC`, `DRIVER`, `GUEST`. Problemas (detalhes na [auditoria](../engenharia/auditoria-2026-09.md#permissões-rbac)): regras de negação nunca funcionavam, todo papel lia tudo, os papéis especializados quase não tinham regras e não existia condição de dono.
