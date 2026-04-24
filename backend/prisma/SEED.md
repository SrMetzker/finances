# 🌱 Seed do Banco de Dados

Este projeto inclui um script de seed para popular dados iniciais de teste no banco de dados.

## O que é criado?

O seed cria os seguintes dados:

- **1 Usuário**: João Silva (joao@example.com, senha: `senha123`)
- **1 Workspace**: "Finanças Pessoais"
- **3 Contas**: Conta Corrente, Poupança, Investimentos
- **2 Cartões**: Cartão Crédito Nubank, Cartão Débito Itaú
- **10 Categorias**:
  - Entrada: Salário, Freelance, Bônus
  - Saída: Alimentação, Transporte, Moradia, Saúde, Lazer, Educação, Utilidades
- **7 Transações**: Exemplos de entradas, saídas e transferências

## Como usar?

### 1. Executar o seed (primeiro setup)

```bash
# Dentro da pasta backend/
cd backend

# Instalar dependências (se não instalado)
npm install

# Fazer push do schema para o banco (primeira vez)
npm run db:push

# Executar o seed
npm run seed
```

### 2. Redefinir o banco e rodar seed novamente

```bash
# Isso irá deletar e recriar o banco (cuidado em produção!)
npm run db:reset

# Depois basta rodar:
npm run seed
```

### 3. Apenas executar o seed sem resetar

```bash
npm run seed
```

## Estrutura do arquivo seed

O arquivo `prisma/seed.ts` faz o seguinte:

1. **Limpa dados anteriores** (DELETE de todas as tabelas)
2. **Cria um usuário** com bcrypt para hash da senha
3. **Cria um workspace**
4. **Adiciona o usuário ao workspace**
5. **Cria contas bancárias** com saldos iniciais
6. **Cria cartões de crédito**
7. **Cria categorias** (entrada/saída/transferência)
8. **Cria transações de exemplo** com diferentes tipos

## Credenciais para teste

- **Email**: `joao@example.com`
- **Senha**: `senha123`

## Personalizando o seed

Para adicionar mais dados ou modificar os existentes, edite o arquivo `prisma/seed.ts`:

- Altere os valores de saldos, nomes, datas, etc.
- Adicione mais transações ou categorias conforme necessário
- Modifique o usuário ou workspace padrão

## Variáveis de ambiente

Certifique-se de que seu arquivo `.env` está configurado com:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/finances_db"
```

## Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run seed` | Executa o seed (limpa e popula dados) |
| `npm run db:push` | Faz push do schema para o banco (cria tabelas) |
| `npm run db:migrate` | Executa migrations (desenvolvimento) |
| `npm run db:reset` | Reset total do banco + seed |

## Troubleshooting

### Erro: "DATABASE_URL not set"
Certifique-se que o arquivo `.env` existe e tem a variável `DATABASE_URL` configurada.

### Erro: "ts-node not found"
Rode `npm install` no diretório backend para instalar todas as dependências.

### Erro: "Database connection failed"
Verifique se o PostgreSQL está rodando e a string de conexão está correta.

---

Após rodar o seed, você poderá fazer login na aplicação frontend com as credenciais acima! 🎉
