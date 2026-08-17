# Glossário Facter

> **Termos e definições padronizadas utilizados em toda documentação.**

---

## A

### API (Application Programming Interface)
Interface de programação que permite comunicação entre sistemas. Na Facter, usamos APIs RESTful.

### ADR (Architecture Decision Record)
Documento que registra uma decisão arquitetural importante, incluindo contexto, decisão e consequências.

### Asset
No contexto do Facter Truck, qualquer bem gerenciável: veículo, reboque, pneu, etc.

---

## B

### Boilerplate
Template de projeto com estrutura e configurações pré-definidas para iniciar novos sistemas rapidamente.

### Business Rule (Regra de Negócio)
Lógica que define ou restringe aspectos do negócio. Documentadas no formato `RN###`.

---

## C

### Clean Architecture
Padrão arquitetural que separa o código em camadas (domain, application, infrastructure, presentation).

### Compound Component
Padrão React onde um componente é dividido em subcomponentes que compartilham estado via Context.

### CVA (Class Variance Authority)
Biblioteca para gerenciar variantes de classes CSS de forma type-safe.

---

## D

### Design System
Conjunto de componentes, tokens e padrões de UI reutilizáveis entre produtos.

### Design Token
Valor atômico de design (cor, espaçamento, tipografia) armazenado como variável.

### DTO (Data Transfer Object)
Objeto usado para transferir dados entre camadas, especialmente em APIs.

---

## E

### Entity (Entidade)
Objeto de domínio com identidade única. No backend, representa uma tabela do banco.

### Endpoint
URL específica de uma API que responde a requisições HTTP.

---

## F

### Feature
Módulo funcional do sistema (ex: módulo de frotas, módulo de OS).

### Feature-Based Architecture
Organização de código onde cada feature é um módulo independente com seus próprios componentes, hooks, etc.

---

## G

### Guard
No NestJS, classe que determina se uma requisição pode prosseguir (autenticação, autorização).

---

## H

### Hook (React)
Função que permite usar estado e outros recursos do React em componentes funcionais.

### Hook (Custom)
Hook criado pela aplicação para encapsular lógica reutilizável.

---

## I

### Interceptor
No NestJS, classe que intercepta requisições/respostas para adicionar lógica transversal.

---

## M

### Migration
Script que altera a estrutura do banco de dados de forma versionada.

### Multi-tenant
Arquitetura onde uma instância do sistema serve múltiplos clientes (tenants) isoladamente.

### Mutation
No React Query, operação que modifica dados no servidor (POST, PUT, DELETE).

---

## O

### OS (Ordem de Serviço)
Documento que registra um trabalho a ser executado. Conceito central em Truck e TechCare.

---

## P

### Persona
Representação fictícia de um tipo de usuário, usado para guiar decisões de UX.

### Provider (React)
Componente que disponibiliza dados via Context para seus descendentes.

### Prisma
ORM (Object-Relational Mapping) usado para interagir com o banco de dados PostgreSQL.

---

## Q

### Query
No React Query, operação que busca dados do servidor (GET).

### Query Key
Identificador único de uma query no React Query, usado para cache e invalidação.

---

## R

### Repository
Padrão que abstrai o acesso a dados, permitindo trocar a implementação sem afetar a lógica de negócio.

### RN (Regra de Negócio)
Código de identificação de regras de negócio. Formato: `RN###`.

---

## S

### Schema (Zod)
Definição de estrutura e validação de dados usando a biblioteca Zod.

### SOLID
Cinco princípios de design orientado a objetos:
- **S**ingle Responsibility
- **O**pen/Closed
- **L**iskov Substitution
- **I**nterface Segregation
- **D**ependency Inversion

### Store
Local centralizado de estado. Usamos Zustand para estado de UI e React Query para estado do servidor.

---

## T

### Tenant
Cliente/empresa que utiliza o sistema em arquitetura multi-tenant.

### Token (Design)
Ver "Design Token".

### Token (Auth)
JWT (JSON Web Token) usado para autenticação de usuários.

---

## U

### UC (Use Case)
Caso de uso - descrição de uma interação do usuário com o sistema. Formato: `UC###`.

### Use Case (Clean Architecture)
Classe que encapsula uma regra de negócio específica no backend.

---

## V

### Validator
Função ou schema que valida dados de entrada.

### ViewModel
Objeto que formata dados da entidade para apresentação na API/UI.

---

## Z

### Zod
Biblioteca TypeScript-first para validação de schemas e tipos.

### Zustand
Biblioteca leve de gerenciamento de estado para React.

---

## Convenções de Nomenclatura

| Contexto | Convenção | Exemplo |
|----------|-----------|---------|
| Regra de Negócio | RN### | RN001, RN002 |
| Caso de Uso | UC### | UC001, UC002 |
| Endpoint | kebab-case | /work-orders |
| Componente | PascalCase | DataTable |
| Hook | camelCase com "use" | useWorkOrder |
| Arquivo React | PascalCase.tsx | WorkOrder.tsx |
| Arquivo util | kebab-case.ts | format-date.ts |

---

## Abreviações Comuns

| Abreviação | Significado |
|------------|-------------|
| API | Application Programming Interface |
| CRUD | Create, Read, Update, Delete |
| DTO | Data Transfer Object |
| JWT | JSON Web Token |
| OS | Ordem de Serviço |
| UI | User Interface |
| UX | User Experience |
| SSO | Single Sign-On |
| SLA | Service Level Agreement |

---

*Glossário atualizado em: Dezembro 2025*
