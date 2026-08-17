# API - TechCare

> **Documentação da API REST do sistema TechCare.**

---

## Base URL

```
Desenvolvimento: http://localhost:3333/api/v1
Produção: https://api.techcare.facter.com.br/v1
```

---

## Autenticação

### JWT Bearer Token

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Endpoints de Auth

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/auth/login` | Login |
| POST | `/auth/register` | Registro |
| POST | `/auth/refresh` | Renovar token |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Usuário atual |

---

## Padrões

Antes de consultar os endpoints, veja os padrões de resposta e paginação:

| Documento | Descrição |
|-----------|-----------|
| [Padrões de Resposta](./padroes-resposta.md) | Estruturas de resposta, paginação, erros e metadados para tabelas |

---

## Endpoints

### Auth (Autenticação)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/auth/login` | Login |
| POST | `/auth/register` | Registro |
| POST | `/auth/refresh` | Renovar token |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Usuário atual |
| POST | `/auth/switch-company` | Trocar empresa |
| POST | `/auth/forgot-password` | Recuperar senha |
| POST | `/auth/reset-password` | Redefinir senha |

**Documentação detalhada**: [auth.md](./auth.md)

### Service Orders (Ordens de Serviço)

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/service-orders` | Listar OS | `read:ServiceOrder` |
| GET | `/service-orders/:id` | Detalhes da OS | `read:ServiceOrder` |
| POST | `/service-orders` | Criar OS | `create:ServiceOrder` |
| PATCH | `/service-orders/:id` | Atualizar OS | `update:ServiceOrder` |
| DELETE | `/service-orders/:id` | Excluir OS | `delete:ServiceOrder` |
| PATCH | `/service-orders/:id/status` | Alterar status | `update:ServiceOrder` |
| POST | `/service-orders/:id/assign` | Atribuir técnico | `update:ServiceOrder` |
| GET | `/service-orders/:id/timeline` | Timeline de eventos | `read:ServiceOrder` |

**Documentação detalhada**: [service-orders.md](./service-orders.md)

### Customers (Clientes)

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/customers` | Listar clientes | `read:Customer` |
| GET | `/customers/:id` | Detalhes do cliente | `read:Customer` |
| POST | `/customers` | Criar cliente | `create:Customer` |
| PATCH | `/customers/:id` | Atualizar cliente | `update:Customer` |
| DELETE | `/customers/:id` | Excluir cliente | `delete:Customer` |
| GET | `/customers/:id/orders` | OS do cliente | `read:Customer` |
| GET | `/customers/search` | Buscar cliente | `read:Customer` |

**Documentação detalhada**: [customers.md](./customers.md)

### Quotes (Orçamentos)

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/quotes` | Listar orçamentos | `read:Quote` |
| GET | `/quotes/:id` | Detalhes do orçamento | `read:Quote` |
| POST | `/quotes` | Criar orçamento | `create:Quote` |
| PATCH | `/quotes/:id` | Atualizar orçamento | `update:Quote` |
| POST | `/quotes/:id/send` | Enviar ao cliente | `update:Quote` |
| POST | `/quotes/:id/approve` | Aprovar (cliente) | - |
| POST | `/quotes/:id/reject` | Rejeitar (cliente) | - |

**Documentação detalhada**: [quotes.md](./quotes.md)

### Stock (Estoque)

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/parts` | Listar peças | `read:Part` |
| GET | `/parts/:id` | Detalhes da peça | `read:Part` |
| POST | `/parts` | Cadastrar peça | `create:Part` |
| PATCH | `/parts/:id` | Atualizar peça | `update:Part` |
| DELETE | `/parts/:id` | Excluir peça | `delete:Part` |
| POST | `/stock/entry` | Entrada de estoque | `create:Stock` |
| POST | `/stock/exit` | Saída de estoque | `update:Stock` |
| GET | `/stock/movements` | Movimentações | `read:Stock` |

**Documentação detalhada**: [stock.md](./stock.md)

### Technicians (Técnicos)

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/technicians` | Listar técnicos | `read:Technician` |
| GET | `/technicians/:id` | Detalhes do técnico | `read:Technician` |
| GET | `/technicians/:id/orders` | OS do técnico | `read:Technician` |
| GET | `/technicians/:id/performance` | Métricas | `read:Technician` |

**Documentação detalhada**: [technicians.md](./technicians.md)

### Equipments (Equipamentos)

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/equipments` | Listar equipamentos | `read:Equipment` |
| GET | `/equipments/:id` | Detalhes | `read:Equipment` |
| POST | `/equipments` | Cadastrar | `create:Equipment` |
| PATCH | `/equipments/:id` | Atualizar | `update:Equipment` |
| DELETE | `/equipments/:id` | Excluir | `delete:Equipment` |
| POST | `/equipments/:id/photos` | Upload fotos | `update:Equipment` |
| GET | `/equipments/:id/history` | Histórico | `read:Equipment` |

**Documentação detalhada**: [equipments.md](./equipments.md)

### Payments (Pagamentos)

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/payments` | Listar pagamentos | `read:Payment` |
| GET | `/payments/:id` | Detalhes | `read:Payment` |
| POST | `/payments` | Registrar | `create:Payment` |
| POST | `/payments/partial` | Pagamento parcial | `create:Payment` |
| POST | `/payments/:id/refund` | Reembolso | `refund:Payment` |
| GET | `/payments/summary` | Resumo financeiro | `read:Payment` |

**Documentação detalhada**: [payments.md](./payments.md)

### Warranties (Garantias)

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/warranties` | Listar garantias | `read:Warranty` |
| GET | `/warranties/:id` | Detalhes | `read:Warranty` |
| POST | `/warranties` | Criar | `create:Warranty` |
| POST | `/warranties/:id/claim` | Acionar | `create:Warranty` |
| POST | `/warranties/:id/extend` | Estender | `update:Warranty` |
| GET | `/warranties/:id/certificate` | Certificado | `read:Warranty` |
| GET | `/warranties/validate/:number` | Validar (público) | - |

**Documentação detalhada**: [warranties.md](./warranties.md)

### Appointments (Agendamentos)

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/appointments` | Listar | `read:Appointment` |
| GET | `/appointments/calendar` | Calendário | `read:Appointment` |
| GET | `/appointments/:id` | Detalhes | `read:Appointment` |
| POST | `/appointments` | Criar | `create:Appointment` |
| PATCH | `/appointments/:id` | Atualizar | `update:Appointment` |
| DELETE | `/appointments/:id` | Cancelar | `delete:Appointment` |
| POST | `/appointments/:id/complete` | Finalizar | `update:Appointment` |
| GET | `/appointments/availability` | Disponibilidade | `read:Appointment` |

**Documentação detalhada**: [appointments.md](./appointments.md)

### Commissions (Comissões)

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/commissions` | Listar | `read:Commission` |
| GET | `/commissions/:id` | Detalhes | `read:Commission` |
| GET | `/commissions/technician/:id` | Por técnico | `read:Commission` |
| POST | `/commissions/calculate` | Calcular (preview) | `read:Commission` |
| POST | `/commissions/pay` | Pagar | `pay:Commission` |
| GET | `/commission-rules` | Regras | `read:Commission` |
| POST | `/commission-rules` | Criar regra | `manage:Commission` |

**Documentação detalhada**: [commissions.md](./commissions.md)

### Notifications (Notificações)

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/notifications` | Listar | - |
| GET | `/notifications/unread-count` | Não lidas | - |
| PATCH | `/notifications/:id/read` | Marcar lida | - |
| POST | `/notifications/read-all` | Marcar todas | - |
| GET | `/notifications/preferences` | Preferências | - |
| PATCH | `/notifications/preferences` | Atualizar prefs | - |
| POST | `/notifications/send` | Enviar (admin) | `send:Notification` |

**Documentação detalhada**: [notifications.md](./notifications.md)

### Settings (Configurações)

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/settings` | Configurações | `read:Settings` |
| PATCH | `/settings/company` | Atualizar empresa | `update:Company` |
| GET | `/settings/modules` | Config módulos | `read:Settings` |
| PATCH | `/settings/modules/:module` | Atualizar módulo | `update:Settings` |
| GET | `/settings/business-hours` | Horário func. | `read:Settings` |
| GET | `/settings/users` | Listar membros | `manage:Users` |
| POST | `/settings/users/invite` | Convidar | `manage:Users` |

**Documentação detalhada**: [settings.md](./settings.md)

### Dashboard

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/dashboard/counts` | Contadores | `read:Dashboard` |
| GET | `/dashboard/recent` | OS recentes | `read:Dashboard` |
| GET | `/dashboard/metrics` | Métricas | `read:Dashboard` |

### Reports (Relatórios)

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/reports/service-orders` | Relatório de OS | `read:Report` |
| GET | `/reports/revenue` | Relatório financeiro | `read:Report` |
| GET | `/reports/technicians` | Performance técnicos | `read:Report` |
| GET | `/reports/stock` | Relatório de estoque | `read:Report` |
| GET | `/reports/customers` | Relatório de clientes | `read:Report` |
| GET | `/reports/warranties` | Relatório de garantias | `read:Report` |
| POST | `/reports/export` | Exportar relatório | `read:Report` |
| GET | `/reports/scheduled` | Relatórios agendados | `manage:Report` |

**Documentação detalhada**: [reports.md](./reports.md)

---

## Padrões de Response

### Sucesso (Single)

```json
{
  "data": {
    "id": "uuid",
    "number": "OS-202501-00001",
    "status": "RECEIVED"
  }
}
```

### Sucesso (Lista)

```json
{
  "data": [
    { "id": "uuid1", "number": "OS-202501-00001" },
    { "id": "uuid2", "number": "OS-202501-00002" }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "perPage": 20,
    "totalPages": 5
  }
}
```

### Erro

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": [
      {
        "field": "email",
        "message": "Email inválido"
      }
    ]
  }
}
```

---

## Query Parameters

### Paginação

```
?page=1&perPage=20
```

### Ordenação

```
?sortBy=createdAt&sortOrder=desc
```

### Filtros

```
?status=RECEIVED&technicianId=uuid&search=termo
```

### Exemplo Completo

```
GET /service-orders?page=1&perPage=20&status=RECEIVED&sortBy=createdAt&sortOrder=desc&search=iphone
```

---

## Códigos de Status

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado |
| 204 | Sem conteúdo (delete) |
| 400 | Requisição inválida |
| 401 | Não autenticado |
| 403 | Não autorizado |
| 404 | Não encontrado |
| 422 | Erro de validação |
| 500 | Erro interno |

---

## Rate Limiting

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

- **Limite**: 100 requisições por minuto
- **Burst**: 10 requisições por segundo

---

## Versionamento

A API usa versionamento por URL:

```
/api/v1/service-orders
/api/v2/service-orders  (futuro)
```

---

**Voltar para** [TechCare](../README.md)
