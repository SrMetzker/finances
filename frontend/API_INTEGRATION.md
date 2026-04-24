# 🚀 Integração Frontend com Backend

Seu frontend foi completamente adaptado para consumir dados do backend em tempo real! Aqui está o guia completo.

## ✅ O que foi implementado

### 1. **Sistema de Autenticação**
- Contexto de autenticação (`auth.context.tsx`) que gerencia login/logout
- Armazenamento de token JWT no localStorage
- Proteção automática de rotas (redireciona para login se não autenticado)

### 2. **Serviços de API**
- **api.client.ts**: Cliente HTTP com autenticação
- **api.types.ts**: Tipos TypeScript para todos os modelos

### 3. **Hooks de dados**
- `useTransactions()` - Fetch, criar, atualizar, deletar transações
- `useAccounts()` - Gerenciar contas
- `useCategories()` - Gerenciar categorias
- `useCards()` - Gerenciar cartões

### 4. **Roteiros atualizadas para API**
- Página de login (`/auth/login`)
- Dashboard (`/dashboard`)
- Contas (`/accounts`)
- Categorias (`/categories`)
- Modal de criação de transações

## 🚀 Como executar

### Pré-requisitos
1. Backend rodando em `http://localhost:3001/api`
2. Seed já executado no banco (veja [backend/prisma/SEED.md](../backend/prisma/SEED.md))

### Passos

```bash
# 1. Instale dependências (se não fez ainda)
cd frontend
npm install

# 2. Certifique-se de que o backend está rodando
cd ../backend
npm run dev

# 3. Em outro terminal, inicie o frontend
cd frontend
npm run dev

# 4. Acesse http://localhost:3000
```

## 🔐 Credenciais de Teste

Use essas credenciais criadas pelo seed do backend:

```
Email: joao@example.com
Senha: senha123
```

### Dados pré-populados
- **Usuário**: João Silva (joao@example.com)
- **Workspace**: Finanças Pessoais
- **Contas**: Conta Corrente, Poupança, Investimentos
- **Cartões**: Nubank, Itaú
- **Transações**: 7 exemplos (salário, despesas, transferências)

## 📁 Estrutura de arquivos

```
frontend/src/
├── app/
│   ├── page.tsx                 # Redireciona para dashboard/login
│   ├── dashboard/page.tsx       # Dashboard principal
│   ├── accounts/page.tsx        # Lista de contas
│   ├── categories/page.tsx      # Lista de categorias
│   ├── auth/
│   │   └── login/page.tsx       # Página de login
│   └── ...
├── components/
│   ├── new-transaction-modal.tsx # Modal de criar transação
│   ├── page-shell.tsx           # Layout com navegação
│   └── ...
├── hooks/
│   ├── use-transactions-api.ts  # Hook para transações
│   ├── use-accounts-api.ts      # Hook para contas
│   ├── use-categories-api.ts    # Hook para categorias
│   └── use-cards-api.ts         # Hook para cartões
├── services/
│   ├── api.client.ts            # Cliente HTTP da API
│   ├── api.types.ts             # Tipos de dados
│   ├── auth.context.tsx         # Contexto de autenticação
│   └── mock-data.ts             # (Removido de uso, pode deletar)
└── ...
```

## 🔄 Fluxo de dados

```
UI Component
    ↓
useTransactions() / useAccounts() / useCategories()
    ↓
apiClient (HttpClient com Auth)
    ↓
Backend API
    ↓
Database (Prisma)
```

## 🌐 Variáveis de Ambiente

O arquivo `.env.local` já foi criado com:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WORKSPACE_ID=ws_test
```

Se você quiser mudar a URL da API ou testar em outro ambiente, edite esse arquivo.

## 📝 Exemplos de uso

### Criar uma transação
```tsx
const { createTransaction } = useTransactions();

await createTransaction({
  amount: 150,
  type: 'SAIDA',
  date: '2026-04-22',
  description: 'Almoço',
  isPaid: true,
  accountId: 'acc_123',
  categoryId: 'cat_456',
});
```

### Buscar contas
```tsx
const { accounts, isLoading, error } = useAccounts();

if (isLoading) return <div>Carregando...</div>;
if (error) return <div>Erro: {error}</div>;

accounts.forEach(account => {
  console.log(account.name, account.initialBalance);
});
```

### Login
```tsx
const { login, isAuthenticated } = useAuth();

await login('joao@example.com', 'senha123');
// Token é salvo automaticamente no localStorage
```

## ⚠️ Problemas comuns

### "DATABASE_URL not set" - Backend
Certifique-se de que o arquivo `.env` do backend tem a URL do banco configurada.

### "API Error 401" - Frontend
O token expirou ou não foi configurado. Faça login novamente.

### "CORS Error" - Cliente
Certifique-se de que o backend tem CORS habilitado para `http://localhost:3000`.

### Página em branco
Verifique:
1. Backend está rodando em `http://localhost:3001/api`
2. Você está autenticado (check localStorage: `auth_token`)
3. Abra a aba Network no DevTools para ver erros de requisição

## 🎯 Próximos passos

1. **Adaptar transações** - Mostrar lista completa de transações em `/transactions`
2. **Editção** - Adicionar endpoints de PATCH/PUT
3. **Relatórios** - Integrar com endpoint `/reports`
4. **Histórico** - Filtrar transações por mês/ano
5. **Sincronização** - Usar WebSockets para sync em tempo real

## 📚 Documentação útil

- Backend: [backend/README.md](../backend/README.md)
- Seed: [backend/prisma/SEED.md](../backend/prisma/SEED.md)
- API Types: [src/services/api.types.ts](src/services/api.types.ts)
- API Client: [src/services/api.client.ts](src/services/api.client.ts)

---

**Tudo pronto! Agora seu frontend está 100% integrado com o backend e banco de dados real! 🎉**
