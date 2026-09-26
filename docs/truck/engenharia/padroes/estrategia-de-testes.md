---
title: "Estratégia de testes"
sidebar_position: 2
tags: [testes, integracao, e2e, mutacao, padroes]
---

# Estratégia de testes

:::note Documento vivo
Origem: [auditoria de 2026-09](../auditoria-2026-09.md). Esta página evolui com o projeto; mudança de padrão exige ADR. Vale para todo código novo da v2.
:::

**A camada principal é o teste de integração contra Postgres real, não o unitário com mock.** A suíte atual tem 448 testes, 438 passam, e nenhum pegou a corrida do executor, o estoque negativo ou o vazamento entre empresas, porque todos mockam exatamente o que quebra: banco, transação e concorrência.

### As camadas e o que cada uma prova

| Camada | Ferramenta | O que prova | O que não deve testar |
| --- | --- | --- | --- |
| Unitário de domínio | Jest + fast-check | Regras puras: máquina de estados, cálculo de duração, custo, derivar status do serviço pelos executores. Sem mock nenhum, porque domínio não tem dependência | Repositório, controller, "chamou o método X" |
| Integração (principal) | Jest + Testcontainers (Postgres e Redis reais) + supertest | Cada use case pela API: regra + transação + RLS + permissão + resposta. Invariantes conferidos no banco depois da chamada | Detalhe de layout, texto de mensagem |
| Concorrência | Mesma base, requisições em paralelo | Os cenários desta auditoria: aprovações simultâneas, creates na mesma frota, cancelar + iniciar | — |
| Isolamento e permissão | Gerada a partir da lista de rotas | Para toda rota: empresa B não lê nem altera dado da A; cada papel recebe exatamente o que a matriz diz; nenhuma rota sem permissão | — |
| Contrato | OpenAPI + tipos gerados no app | Frontend e backend concordam; mudança que quebra o contrato quebra o build | — |
| E2E | Playwright contra API real e banco semeado | 8 a 12 jornadas críticas de ponta a ponta, no desktop e no celular | Toda variação de regra (isso é integração) |
| Carga | k6 com volume realista | Metas de latência da seção Métricas nas rotas quentes | — |

### Teste que vale e teste que enche linguiça

**Enche linguiça** (padrão comum na suíte atual):

```ts
it('calls repository.save', async () => {
  repo.findById.mockResolvedValue(order);
  await sut.execute({ id });
  expect(repo.save).toHaveBeenCalled();
});
```

Passa mesmo se a regra estiver errada, se a transação não existir e se duas chamadas simultâneas corromperem o dado. Testa a implementação, não o comportamento, e quebra em qualquer refactor.

**Vale** (prova o comportamento que importa, no banco de verdade):

```ts
it('never lets stock go negative under concurrent approvals', async () => {
  const part = await seed.part({ stock: 1 });
  const reqs = await seed.partRequests(3, { part, quantity: 1 });

  const results = await Promise.all(
    reqs.map(r => api.as(manager).post(`/part-requests/${r.id}/approve`))
  );

  expect(results.filter(r => r.status === 200)).toHaveLength(1);
  expect(results.filter(r => r.status === 409)).toHaveLength(2);
  expect(await db.stockOf(part.id)).toBe(0);
  expect(await db.movementsOf(part.id)).toHaveLength(1);
});
```

### Regras

1. **Todo use case novo nasce com teste de integração** cobrindo o caminho feliz, cada regra que recusa e o efeito no banco.
2. **Todo invariante escrito tem um teste que tenta quebrá-lo**, inclusive por concorrência quando fizer sentido.
3. **Todo bug começa com um teste que falha.** O PR da correção mostra o teste vermelho antes e verde depois.
4. **Mock só na fronteira externa** (telemática, e-mail, ERP). Banco, fila e cache são reais no teste.
5. **Máquinas de estado têm teste por propriedade** (fast-check): sequências aleatórias de comandos nunca produzem estado inválido.
6. **Qualidade medida por mutação, não por cobertura.** Stryker no módulo de domínio: se mudar um `>=` para `>` e nenhum teste falhar, o teste não protege nada. Cobertura de linha sozinha premia teste linguiça.
7. **Dados de teste por fábrica** (`seed.part({ stock: 1 })`), nunca por fixture gigante compartilhada. Cada teste cria o que usa, dentro de uma empresa própria, e pode rodar em paralelo.
8. **E2E só para jornadas**, cada uma com dono e critério claro. Teste E2E instável é corrigido ou removido na mesma semana, nunca ignorado.

### Jornadas E2E iniciais

1. Login, troca de empresa e logout sem vazar dados entre empresas.
2. Abrir ordem, colocar em manutenção, adicionar serviço e executor, iniciar, pausar com motivo, retomar, concluir, finalizar a ordem.
3. Dois executores no mesmo serviço, com tempos trabalhados corretos na tela.
4. Requisitar peça, aprovar por outro usuário, entregar, devolver, conferir estoque e custo da ordem.
5. Mecânico no celular: vê só as ordens dele, inicia e conclui o serviço.
6. Papel sem permissão não vê o botão e recebe 403 ao tentar pela API.
7. Cancelar ordem com serviços abertos e conferir que nada fica rodando.
8. Indicadores do dia batendo com as ordens criadas no teste.

### Verificação contínua de invariantes

Além dos testes, um job diário em homologação (e depois em produção) roda consultas SQL que procuram violações: serviço pausado com executor rodando, estoque negativo, sessão aberta em serviço concluído, linha sem `company_id`. Qualquer resultado gera alerta. É a rede que pega o que os testes não previram.
