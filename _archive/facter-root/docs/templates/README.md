# Templates de Documentação

> **Templates padronizados para documentação dos produtos Facter.**

---

## Como Usar

1. Copie o template desejado
2. Renomeie para o nome do seu documento
3. Preencha as seções
4. Remova seções não aplicáveis
5. Atualize o índice se necessário

---

## Templates Disponíveis

| Template | Uso | Localização |
|----------|-----|-------------|
| [README Produto](./README-produto.template.md) | Visão geral de um produto | `facter-{produto}/README.md` |
| [Regra de Negócio](./regra-negocio.template.md) | Documentar regras de negócio | `negocio/regras-negocio/` |
| [Caso de Uso](./caso-uso.template.md) | Documentar casos de uso | `negocio/casos-uso/` |
| [Endpoint API](./endpoint-api.template.md) | Documentar endpoints | `tecnico/api/endpoints/` |
| [Entidade Banco](./entidade-banco.template.md) | Documentar tabelas | `tecnico/banco-dados/entidades/` |
| [ADR](./adr.template.md) | Architecture Decision Record | `tecnico/adrs/` |

---

## Convenções

### Nomenclatura de Arquivos

| Tipo | Formato | Exemplo |
|------|---------|---------|
| Regra de Negócio | `RN###-{nome}.md` | `RN001-criacao-os.md` |
| Caso de Uso | `UC###-{nome}.md` | `UC001-criar-ordem-servico.md` |
| Endpoint | `{metodo}-{recurso}.md` | `post-users.md` |
| Entidade | `{nome-tabela}.md` | `work-order.md` |
| ADR | `ADR###-{titulo}.md` | `ADR001-escolha-orm.md` |

### Formatação

- **Títulos:** Usar H1 (`#`) apenas uma vez (título do documento)
- **Seções:** Usar H2 (`##`) para seções principais
- **Subseções:** Usar H3 (`###`) para subseções
- **Código:** Usar code blocks com linguagem especificada
- **Tabelas:** Usar para informações estruturadas

---

**Voltar para** [Documentação](../README.md)
