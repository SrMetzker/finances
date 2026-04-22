# 💰 Finances

App de controle financeiro pessoal multi-tenant, estilo Mobills — construído com NestJS, Prisma e Next.js.

---

## 🧱 Stack

| Camada | Tecnologia |
|---|---|
| Backend | Node.js · TypeScript · **NestJS** |
| ORM | **Prisma** (PostgreSQL) |
| Autenticação | JWT (passport-jwt) |
| Frontend | **Next.js 16** · React 19 · **TailwindCSS 4** |
| Arquitetura | Clean Architecture · DDD-like · Multi-tenant |

---

## 🗂️ Estrutura do projeto

```
finances/
├── backend/                   # NestJS API
│   ├── prisma/
│   │   ├── schema.prisma      # Models + relações
│   │   └── migrations/        # SQL versionado
│   └── src/
│       ├── common/            # Guards, decorators, middleware, interfaces
│       ├── prisma/            # PrismaService (global)
│       └── modules/
│           ├── auth/          # Registro, login, JWT
│           ├── users/         # Perfil do usuário
│           ├── workspaces/    # Multi-tenant, convite de membros
│           ├── accounts/      # Contas bancárias (CRUD + saldo calculado)
│           ├── cards/         # Cartões de crédito (CRUD)
│           ├── categories/    # Categorias (ENTRADA | SAIDA | TRANSFERENCIA)
│           ├── transactions/  # Transações com regras de saldo
│           └── reports/       # Relatório mensal + dashboard
└── frontend/                  # Next.js App Router
    └── src/
        ├── app/               # Pages: dashboard, transações, contas, cartões, categorias
        ├── components/        # PageShell, StatCard, FloatingActionButton
        ├── hooks/             # useMonthFilter
        └── services/          # mock-data (substitua pela API real)
```

---

## ⚡ Início rápido

### Pré-requisitos

- Node.js ≥ 20
- PostgreSQL ≥ 14

### 1. Instalar dependências

```bash
npm install           # workspace raiz instala backend + frontend
```

### 2. Configurar banco de dados

```bash
cp backend/.env.example backend/.env
# Edite DATABASE_URL e JWT_SECRET em backend/.env
```

### 3. Rodar migrations

```bash
cd backend
npx prisma migrate dev --name init
```

### 4. Iniciar em desenvolvimento

```bash
# Terminal 1 — API
npm run dev:backend        # http://localhost:3001

# Terminal 2 — Frontend
npm run dev:frontend       # http://localhost:3000
```

---

## 🔐 Autenticação

Todas as rotas (exceto `/auth/*`) exigem:

| Header | Valor |
|---|---|
| `Authorization` | `Bearer <accessToken>` |
| `x-workspace-id` | ID do workspace ativo |

---

## 📡 Endpoints da API

### Auth

```
POST /auth/register
POST /auth/login
```

**Registro — Request:**
```json
{ "name": "João", "email": "joao@email.com", "password": "123456" }
```
**Resposta:**
```json
{
  "accessToken": "eyJhb...",
  "user": { "id": "clxxx", "name": "João", "email": "joao@email.com" }
}
```

---

### Usuários

```
GET /users/me          → perfil do usuário autenticado
```

---

### Workspaces

```
GET    /workspaces         → lista workspaces do usuário
POST   /workspaces         → cria workspace
POST   /workspaces/invite  → convida usuário (x-workspace-id obrigatório)
```

**Criar workspace:**
```json
{ "name": "Finanças da Família" }
```

---

### Contas

```
GET    /accounts           → lista com saldo calculado
POST   /accounts           → cria conta
GET    /accounts/:id
PATCH  /accounts/:id
DELETE /accounts/:id
```

**Criar conta:**
```json
{ "name": "Nubank", "initialBalance": 0 }
```

**Resposta (lista):**
```json
[{
  "id": "clxxx",
  "name": "Nubank",
  "initialBalance": 0,
  "currentBalance": 3200.50
}]
```

---

### Cartões

```
GET    /cards
POST   /cards
GET    /cards/:id
PATCH  /cards/:id
DELETE /cards/:id
```

**Criar cartão:**
```json
{ "name": "Nubank Roxinho", "limit": 5000, "closingDay": 8, "dueDay": 15 }
```

---

### Categorias

```
GET    /categories
POST   /categories
GET    /categories/:id
PATCH  /categories/:id
DELETE /categories/:id
```

**Criar categoria:**
```json
{ "name": "Alimentação", "type": "SAIDA" }
```
> Tipos: `ENTRADA` | `SAIDA` | `TRANSFERENCIA`

---

### Transações

```
GET    /transactions?month=4&year=2026
POST   /transactions
GET    /transactions/:id
PATCH  /transactions/:id
DELETE /transactions/:id
```

**Criar transação de entrada:**
```json
{
  "amount": 4200,
  "type": "ENTRADA",
  "date": "2026-04-05",
  "description": "Salário abril",
  "accountId": "clyyy",
  "categoryId": "clzzz",
  "isPaid": true
}
```

**Criar transferência:**
```json
{
  "amount": 500,
  "type": "TRANSFERENCIA",
  "date": "2026-04-10",
  "description": "Para reserva",
  "accountId": "clyyy",
  "destinationAccountId": "clwww",
  "categoryId": "clzzz"
}
```

**Extras suportados:**
- `isPaid` — marcar como paga
- `isRecurring` + `recurrenceRule` — transações recorrentes
- `receiptUrl` — URL do comprovante
- `tags` — array de strings

---

### Relatórios

```
GET /reports/monthly?month=4&year=2026
GET /reports/dashboard?month=4&year=2026
```

**Relatório mensal — Resposta:**
```json
{
  "month": 4,
  "year": 2026,
  "totalIncome": 4200.00,
  "totalExpense": 1650.00,
  "balance": 2550.00
}
```

**Dashboard — Resposta:**
```json
{
  "totalBalance": 4035.50,
  "balances": [
    { "accountId": "...", "accountName": "Nubank", "balance": 3200.50 }
  ],
  "expensesByCategory": [
    { "categoryId": "...", "categoryName": "Alimentação", "total": 850 }
  ]
}
```

---

## 🔒 Segurança multi-tenant

- Toda query filtra por `workspaceId`
- `WorkspaceAccessGuard` verifica se o usuário é membro antes de qualquer operação
- O middleware `WorkspaceMiddleware` injeta o `workspaceId` via header `x-workspace-id`

---

## 🚀 Deploy econômico

### Railway (recomendado — gratuito com limites)
1. Conecte o repositório no [railway.app](https://railway.app)
2. Adicione serviço **PostgreSQL**
3. Configure variáveis: `DATABASE_URL`, `JWT_SECRET`, `PORT`
4. Defina o start command: `npm run start:prod` (dentro de `backend/`)

### Render
1. New Web Service → Branch `main`
2. Build command: `npm install && npx prisma generate && npm run build`
3. Start command: `node dist/main`

### VPS (Hetzner CX11 ~ €4/mês)
```bash
# Instale Node 20, PostgreSQL, PM2
pm2 start dist/main.js --name finances-api
nginx → reverse proxy para 3001 e 3000
```

---

## 🏃 Scripts disponíveis

```bash
# Raiz do monorepo
npm run dev:backend      # NestJS hot-reload
npm run dev:frontend     # Next.js dev server
npm run build:backend    # tsc + nest build
npm run build:frontend   # next build

# Backend
cd backend
npm test                 # Jest unit tests
npm run prisma:generate  # gera Prisma Client
npm run prisma:migrate   # executa migrations
```
