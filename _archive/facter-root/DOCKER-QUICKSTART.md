# Facter - Docker Quick Start

Este guia explica como rodar o Hub e TechCare facilmente via Docker.

## Portas

| Servico | Hub | TechCare |
|---------|-----|----------|
| Web | 3000 | 3002 |
| API | 3001 | 3003 |
| PostgreSQL | 5433 | 5434 |
| Redis | 6380 | 6381 |

## Pre-requisitos

1. Docker e Docker Compose instalados
2. Node.js 20+ e pnpm para o Design System

## 1. Build do Design System

O Design System precisa ser buildado localmente antes de rodar o TechCare:

```bash
cd facter-design-system/packages/core
pnpm install
pnpm build
```

## 2. Rodar apenas o Facter Hub

```bash
cd facter-hub

# Primeira vez: subir banco e rodar migrations
docker-compose -f docker-compose.dev.yml up -d postgres redis
docker-compose -f docker-compose.dev.yml run --rm api pnpm prisma migrate deploy
docker-compose -f docker-compose.dev.yml run --rm api pnpm prisma db seed

# Subir tudo
docker-compose -f docker-compose.dev.yml up -d

# Verificar logs
docker-compose -f docker-compose.dev.yml logs -f
```

Acesse:
- Hub Admin: http://localhost:3000
- Hub API: http://localhost:3001/api

Credenciais:
- Email: `admin@facter.com`
- Senha: `Admin@123`

## 3. Rodar Hub + TechCare

O TechCare depende do Hub para autenticacao.

```bash
# Terminal 1: Rodar Hub (porta 3000/3001)
cd facter-hub
docker-compose -f docker-compose.dev.yml up -d

# Terminal 2: Rodar TechCare (porta 3002/3003)
cd facter-techcare

# Primeira vez: subir banco e rodar migrations
docker-compose -f docker-compose.dev.yml up -d postgres redis
docker-compose -f docker-compose.dev.yml run --rm api pnpm prisma migrate deploy
docker-compose -f docker-compose.dev.yml run --rm api pnpm prisma db seed

# Subir tudo
docker-compose -f docker-compose.dev.yml up -d
```

Acesse:
- Hub: http://localhost:3000
- TechCare: http://localhost:3002

## 4. Desenvolvimento Local (sem Docker para apps)

Para hot-reloading mais rapido, rode apenas os bancos via Docker:

```bash
# Apenas databases
cd facter-hub
docker-compose -f docker-compose.dev.yml up -d postgres redis

cd facter-techcare
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Rode as apps localmente
cd facter-hub/facter-hub-api && pnpm start:dev
cd facter-hub/facter-hub-web && pnpm dev

cd facter-techcare/facter-techcare-api && pnpm start:dev
cd facter-techcare/facter-techcare-web && pnpm dev
```

## Comandos Uteis

```bash
# Ver logs
docker-compose -f docker-compose.dev.yml logs -f api
docker-compose -f docker-compose.dev.yml logs -f web

# Parar tudo
docker-compose -f docker-compose.dev.yml down

# Parar e remover volumes (reset do banco)
docker-compose -f docker-compose.dev.yml down -v

# Rebuild das imagens
docker-compose -f docker-compose.dev.yml build --no-cache

# Executar comando dentro do container
docker-compose -f docker-compose.dev.yml exec api pnpm prisma studio
```

## Troubleshooting

### Erro de porta em uso

```bash
# Verificar o que esta usando a porta
netstat -ano | findstr :3000

# Ou parar todos containers Docker
docker stop $(docker ps -q)
```

### Erro de conexao com banco

1. Verifique se o postgres esta rodando: `docker-compose ps`
2. Verifique as variaveis de ambiente no docker-compose.dev.yml
3. Dentro do container o host do banco e `postgres`, nao `localhost`

### Design System nao encontrado

1. Build o DS: `cd facter-design-system/packages/core && pnpm build`
2. Verifique se o volume esta correto no docker-compose.dev.yml
