# [RN###] {Título da Regra}

> **Módulo:** {Nome do módulo}
> **Status:** Ativa | Inativa | Em revisão
> **Versão:** 1.0

---

## Descrição

{Descrição clara e objetiva do que esta regra de negócio define ou restringe}

---

## Contexto

{Explique o contexto de negócio que justifica esta regra}

---

## Regras

### RN###.1 - {Subtítulo da regra}

{Descrição detalhada da regra}

**Condições:**
- Condição 1
- Condição 2

**Resultado:**
- O que acontece quando as condições são atendidas

---

### RN###.2 - {Subtítulo da regra}

{Descrição detalhada da regra}

| Condição | Ação |
|----------|------|
| Se X | Então Y |
| Se A | Então B |

---

## Validações

| Campo | Regra | Mensagem de Erro |
|-------|-------|------------------|
| campo1 | Obrigatório | "Campo obrigatório" |
| campo2 | Formato email | "Email inválido" |
| campo3 | Mínimo 10 caracteres | "Mínimo 10 caracteres" |

---

## Exceções

### Exceção 1
{Descreva situações onde a regra não se aplica}

### Exceção 2
{Descreva situações onde a regra não se aplica}

---

## Exemplos

### Exemplo 1 - Cenário positivo
```
Dado que {contexto}
Quando {ação}
Então {resultado esperado}
```

### Exemplo 2 - Cenário negativo
```
Dado que {contexto}
Quando {ação}
Então {resultado esperado - erro/validação}
```

---

## Impacto

### Sistemas Afetados
- Sistema A
- Sistema B

### Integrações
- API X
- Webhook Y

---

## Relacionamentos

| Tipo | Código | Descrição |
|------|--------|-----------|
| Depende de | RN001 | {Descrição} |
| É dependência de | RN003 | {Descrição} |
| Relacionada | UC002 | {Descrição} |

---

## Histórico

| Data | Versão | Alteração | Autor |
|------|--------|-----------|-------|
| YYYY-MM-DD | 1.0 | Criação | Nome |
| YYYY-MM-DD | 1.1 | {Alteração} | Nome |

---

## Aprovações

| Papel | Nome | Data |
|-------|------|------|
| Product Owner | Nome | YYYY-MM-DD |
| Tech Lead | Nome | YYYY-MM-DD |

---

**Voltar para** [Regras de Negócio](../README.md)
