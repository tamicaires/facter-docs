# [UC###] {Título do Caso de Uso}

> **Módulo:** {Nome do módulo}
> **Ator Principal:** {Quem executa}
> **Versão:** 1.0

---

## Descrição

{Descrição breve do objetivo do caso de uso}

---

## Atores

| Ator | Descrição |
|------|-----------|
| Ator Principal | {Descrição do ator que inicia o caso de uso} |
| Ator Secundário | {Descrição de outros atores envolvidos} |

---

## Pré-condições

1. {Condição que deve ser verdadeira antes do caso de uso iniciar}
2. {Outra pré-condição}
3. {Usuário deve estar autenticado}

---

## Pós-condições

### Sucesso
1. {Estado do sistema após execução bem-sucedida}
2. {Outra pós-condição de sucesso}

### Falha
1. {Estado do sistema em caso de falha}

---

## Fluxo Principal

| Passo | Ator | Sistema |
|-------|------|---------|
| 1 | Acessa a tela de {X} | Exibe formulário |
| 2 | Preenche os campos | Valida dados em tempo real |
| 3 | Clica em "Salvar" | Valida dados completos |
| 4 | - | Persiste dados no banco |
| 5 | - | Exibe mensagem de sucesso |
| 6 | - | Redireciona para listagem |

---

## Fluxos Alternativos

### FA01 - {Nome do fluxo alternativo}

**Ponto de extensão:** Passo X do fluxo principal

| Passo | Ator | Sistema |
|-------|------|---------|
| X.1 | {Ação alternativa} | {Resposta do sistema} |
| X.2 | - | {Continua processamento} |
| X.3 | - | Retorna ao passo Y do fluxo principal |

---

## Fluxos de Exceção

### FE01 - Validação falha

**Ponto de exceção:** Passo 3 do fluxo principal

| Passo | Sistema |
|-------|---------|
| 3.1 | Identifica campos inválidos |
| 3.2 | Exibe mensagens de erro nos campos |
| 3.3 | Mantém usuário no formulário |

### FE02 - Erro de servidor

**Ponto de exceção:** Passo 4 do fluxo principal

| Passo | Sistema |
|-------|---------|
| 4.1 | Falha ao persistir dados |
| 4.2 | Exibe mensagem de erro genérica |
| 4.3 | Registra erro no log |

---

## Regras de Negócio

| Código | Descrição |
|--------|-----------|
| RN001 | {Link para regra de negócio relacionada} |
| RN002 | {Link para outra regra} |

---

## Requisitos de Interface

### Campos do Formulário

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| nome | Text | Sim | Mín. 3 caracteres |
| email | Email | Sim | Formato email válido |
| telefone | Phone | Não | Formato (XX) XXXXX-XXXX |

### Ações Disponíveis

| Ação | Descrição | Permissão |
|------|-----------|-----------|
| Salvar | Persiste os dados | Todos |
| Cancelar | Descarta alterações | Todos |
| Excluir | Remove registro | Admin |

---

## Mockup / Wireframe

{Link para mockup ou imagem do wireframe}

```
┌─────────────────────────────────────┐
│ Título da Tela                      │
├─────────────────────────────────────┤
│                                     │
│  Nome: [________________]           │
│  Email: [________________]          │
│                                     │
│  [Cancelar]  [Salvar]               │
│                                     │
└─────────────────────────────────────┘
```

---

## Requisitos Não-Funcionais

| Requisito | Descrição |
|-----------|-----------|
| Performance | Resposta em < 2 segundos |
| Disponibilidade | 99.9% uptime |
| Segurança | Apenas usuários autenticados |

---

## Histórico

| Data | Versão | Alteração | Autor |
|------|--------|-----------|-------|
| YYYY-MM-DD | 1.0 | Criação | Nome |

---

**Voltar para** [Casos de Uso](../README.md)
