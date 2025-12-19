import type { Account, Transaction } from '@/lib/types';

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

export const mockAccounts: Account[] = [
  {
    account_id: 'acc-demo-ars-main',
    user_id: 'user-demo',
    name: 'Cuenta sueldo',
    type_id: 1,
    currency_id: 1,
    currency: 'ARS' as any,
    balance: 850000,
    created_at: daysAgo(120),
    deleted: false,
    description: 'Cuenta principal en pesos',
  },
  {
    account_id: 'acc-demo-ars-savings',
    user_id: 'user-demo',
    name: 'Ahorros',
    type_id: 2,
    currency_id: 1,
    currency: 'ARS' as any,
    balance: 420000,
    created_at: daysAgo(200),
    deleted: false,
    description: 'Fondo de emergencias',
  },
];

export const mockTransactions: Transaction[] = [
  {
    transaction_id: 'tx-demo-salary',
    user_id: 'user-demo',
    account_id: 'acc-demo-ars-main',
    amount: 600000,
    type_id: 2,
    date: daysAgo(5),
    category_id: 'cat-demo-income-salary',
    category: {
      category_id: 'cat-demo-income-salary',
      description: 'Sueldo',
      color: '#22c55e',
      transaction_type: {
        type_id: 2,
        name: 'Ingreso',
      },
    },
    transaction_type: {
      type_id: 2,
      name: 'Ingreso',
    },
    type_name: 'Ingreso',
    description: 'Sueldo mensual',
    created_at: daysAgo(5),
  },
  {
    transaction_id: 'tx-demo-rent',
    user_id: 'user-demo',
    account_id: 'acc-demo-ars-main',
    amount: 180000,
    type_id: 1,
    date: daysAgo(3),
    category_id: 'cat-demo-expense-rent',
    category: {
      category_id: 'cat-demo-expense-rent',
      description: 'Alquiler',
      color: '#f97316',
      transaction_type: {
        type_id: 1,
        name: 'Gasto',
      },
    },
    transaction_type: {
      type_id: 1,
      name: 'Gasto',
    },
    type_name: 'Gasto',
    description: 'Alquiler departamento',
    created_at: daysAgo(3),
  },
  {
    transaction_id: 'tx-demo-groceries',
    user_id: 'user-demo',
    account_id: 'acc-demo-ars-main',
    amount: 65000,
    type_id: 1,
    date: daysAgo(2),
    category_id: 'cat-demo-expense-groceries',
    category: {
      category_id: 'cat-demo-expense-groceries',
      description: 'Supermercado',
      color: '#0ea5e9',
      transaction_type: {
        type_id: 1,
        name: 'Gasto',
      },
    },
    transaction_type: {
      type_id: 1,
      name: 'Gasto',
    },
    type_name: 'Gasto',
    description: 'Compras del hogar',
    created_at: daysAgo(2),
  },
  {
    transaction_id: 'tx-demo-subscriptions',
    user_id: 'user-demo',
    account_id: 'acc-demo-ars-main',
    amount: 18000,
    type_id: 1,
    date: daysAgo(8),
    category_id: 'cat-demo-expense-subscriptions',
    category: {
      category_id: 'cat-demo-expense-subscriptions',
      description: 'Suscripciones',
      color: '#a855f7',
      transaction_type: {
        type_id: 1,
        name: 'Gasto',
      },
    },
    transaction_type: {
      type_id: 1,
      name: 'Gasto',
    },
    type_name: 'Gasto',
    description: 'Streaming y herramientas',
    created_at: daysAgo(8),
  },
  {
    transaction_id: 'tx-demo-transport',
    user_id: 'user-demo',
    account_id: 'acc-demo-ars-main',
    amount: 12000,
    type_id: 1,
    date: daysAgo(1),
    category_id: 'cat-demo-expense-transport',
    category: {
      category_id: 'cat-demo-expense-transport',
      description: 'Transporte',
      color: '#facc15',
      transaction_type: {
        type_id: 1,
        name: 'Gasto',
      },
    },
    transaction_type: {
      type_id: 1,
      name: 'Gasto',
    },
    type_name: 'Gasto',
    description: 'Combustible y peajes',
    created_at: daysAgo(1),
  },
];
