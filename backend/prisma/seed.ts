import { PrismaClient } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  console.log('🗑️  Limpando dados anteriores...');
  await prisma.transactionTag.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.card.deleteMany();
  await prisma.category.deleteMany();
  await prisma.account.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  // Criar usuário
  console.log('👤 Criando usuário...');
  const hashedPassword = await bcryptjs.hash('senha123', 10);
  const user = await prisma.user.create({
    data: {
      name: 'João Silva',
      email: 'joao@example.com',
      password: hashedPassword,
    },
  });
  console.log(`✓ Usuário criado: ${user.email}`);

  // Criar workspace
  console.log('🏢 Criando workspace...');
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Finanças Pessoais',
    },
  });
  console.log(`✓ Workspace criado: ${workspace.name}`);

  // Adicionar usuário ao workspace
  console.log('🔗 Adicionando usuário ao workspace...');
  await prisma.workspaceMember.create({
    data: {
      userId: user.id,
      workspaceId: workspace.id,
      role: 'ADMIN',
    },
  });
  console.log('✓ Usuário adicionado ao workspace');

  // Criar contas
  console.log('💳 Criando contas...');
  const accounts = await Promise.all([
    prisma.account.create({
      data: {
        name: 'Conta Corrente',
        initialBalance: 5000.0,
        icon: 'wallet',
        color: '#EF4444',
        workspaceId: workspace.id,
      },
    }),
    prisma.account.create({
      data: {
        name: 'Poupança',
        initialBalance: 10000.0,
        icon: 'piggy-bank',
        color: '#10B981',
        workspaceId: workspace.id,
      },
    }),
    prisma.account.create({
      data: {
        name: 'Investimentos',
        initialBalance: 15000.0,
        icon: 'trending-up',
        color: '#6366F1',
        workspaceId: workspace.id,
      },
    }),
  ]);
  console.log(`✓ ${accounts.length} contas criadas`);

  // Criar cartões
  console.log('💰 Criando cartões...');
  const cards = await Promise.all([
    prisma.card.create({
      data: {
        name: 'Cartão Crédito Nubank',
        limit: 5000.0,
        closingDay: 15,
        dueDay: 25,
        workspaceId: workspace.id,
      },
    }),
    prisma.card.create({
      data: {
        name: 'Cartão Débito Itaú',
        limit: 0,
        closingDay: 1,
        dueDay: 1,
        workspaceId: workspace.id,
      },
    }),
  ]);
  console.log(`✓ ${cards.length} cartões criados`);

  // Criar categorias
  console.log('📂 Criando categorias...');
  const categories = await Promise.all([
    // Categorias de Entrada
    prisma.category.create({
      data: {
        name: 'Salário',
        type: 'ENTRADA',
        icon: 'banknote',
        color: '#10B981',
        workspaceId: workspace.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Freelance',
        type: 'ENTRADA',
        icon: 'briefcase-business',
        color: '#22C55E',
        workspaceId: workspace.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Bônus',
        type: 'ENTRADA',
        icon: 'gift',
        color: '#14B8A6',
        workspaceId: workspace.id,
      },
    }),
    // Categorias de Saída
    prisma.category.create({
      data: {
        name: 'Alimentação',
        type: 'SAIDA',
        icon: 'utensils',
        color: '#F97316',
        workspaceId: workspace.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Transporte',
        type: 'SAIDA',
        icon: 'car',
        color: '#3B82F6',
        workspaceId: workspace.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Moradia',
        type: 'SAIDA',
        icon: 'house',
        color: '#8B5CF6',
        workspaceId: workspace.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Saúde',
        type: 'SAIDA',
        icon: 'heart-pulse',
        color: '#EC4899',
        workspaceId: workspace.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Lazer',
        type: 'SAIDA',
        icon: 'gamepad-2',
        color: '#A855F7',
        workspaceId: workspace.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Educação',
        type: 'SAIDA',
        icon: 'graduation-cap',
        color: '#0EA5E9',
        workspaceId: workspace.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Utilidades',
        type: 'SAIDA',
        icon: 'wifi',
        color: '#64748B',
        workspaceId: workspace.id,
      },
    }),
  ]);
  console.log(`✓ ${categories.length} categorias criadas`);

  // Criar transações
  console.log('📊 Criando transações...');
  const now = new Date();
  const transactions = await Promise.all([
    // Entrada: Salário
    prisma.transaction.create({
      data: {
        amount: 5000.0,
        type: 'ENTRADA',
        date: new Date(now.getFullYear(), now.getMonth(), 1),
        description: 'Salário mensal',
        isPaid: true,
        workspaceId: workspace.id,
        accountId: accounts[0].id,
        categoryId: categories[0].id,
        userId: user.id,
      },
    }),
    // Saída: Moradia
    prisma.transaction.create({
      data: {
        amount: 1500.0,
        type: 'SAIDA',
        date: new Date(now.getFullYear(), now.getMonth(), 5),
        description: 'Aluguel do apartamento',
        isPaid: true,
        workspaceId: workspace.id,
        accountId: accounts[0].id,
        categoryId: categories[5].id,
        userId: user.id,
      },
    }),
    // Saída: Alimentação
    prisma.transaction.create({
      data: {
        amount: 350.0,
        type: 'SAIDA',
        date: new Date(now.getFullYear(), now.getMonth(), 7),
        description: 'Compras no supermercado',
        isPaid: true,
        workspaceId: workspace.id,
        accountId: accounts[0].id,
        categoryId: categories[3].id,
        userId: user.id,
      },
    }),
    // Saída: Transporte
    prisma.transaction.create({
      data: {
        amount: 150.0,
        type: 'SAIDA',
        date: new Date(now.getFullYear(), now.getMonth(), 10),
        description: 'Passagem de ônibus mensal',
        isPaid: true,
        workspaceId: workspace.id,
        accountId: accounts[0].id,
        categoryId: categories[4].id,
        userId: user.id,
      },
    }),
    // Saída: Lazer
    prisma.transaction.create({
      data: {
        amount: 80.0,
        type: 'SAIDA',
        date: new Date(now.getFullYear(), now.getMonth(), 12),
        description: 'Cinema com amigos',
        isPaid: true,
        workspaceId: workspace.id,
        accountId: accounts[0].id,
        categoryId: categories[7].id,
        userId: user.id,
      },
    }),
    // Transferência
    prisma.transaction.create({
      data: {
        amount: 1000.0,
        type: 'TRANSFERENCIA',
        date: new Date(now.getFullYear(), now.getMonth(), 15),
        description: 'Transferência para poupança',
        isPaid: true,
        workspaceId: workspace.id,
        accountId: accounts[0].id,
        destinationAccountId: accounts[1].id,
        categoryId: categories[0].id,
        userId: user.id,
      },
    }),
    // Entrada: Freelance
    prisma.transaction.create({
      data: {
        amount: 800.0,
        type: 'ENTRADA',
        date: new Date(now.getFullYear(), now.getMonth(), 20),
        description: 'Projeto de freelance',
        isPaid: true,
        workspaceId: workspace.id,
        accountId: accounts[0].id,
        categoryId: categories[1].id,
        userId: user.id,
      },
    }),
  ]);
  console.log(`✓ ${transactions.length} transações criadas`);

  console.log('\n✅ Seed concluído com sucesso!');
  console.log('\n📋 Dados criados:');
  console.log(`  👤 Usuário: joao@example.com (senha: senha123)`);
  console.log(`  🏢 Workspace: ${workspace.name}`);
  console.log(`  💳 Contas: ${accounts.map((a) => a.name).join(', ')}`);
  console.log(`  💰 Cartões: ${cards.map((c) => c.name).join(', ')}`);
  console.log(`  📂 Categorias: ${categories.length} criadas`);
  console.log(`  📊 Transações: ${transactions.length} criadas`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
