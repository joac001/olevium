// Re-export types
export type { ApiCollectionResult } from './types';

// Re-export accounts functions
export {
  getAccounts,
  getAccountTypes,
  getAccountDetail,
  getCurrencies,
  postAccount,
  putAccount,
  deleteAccount,
} from './accounts';

// Re-export transactions functions
export {
  getTransactions,
  getDashboardStats,
  getTransactionsByDateRange,
  getTransactionTypes,
  postTransaction,
  putTransaction,
  deleteTransaction,
  exportTransactionsCsv,
  type TransactionsExportParams,
  type DashboardStats,
} from './transactions';

// Re-export categories functions
export {
  getCategories,
  postCategory,
  putCategory,
  deleteCategory,
  deactivateCategory,
  reactivateCategory,
} from './categories';

// Re-export recurring transactions functions
export {
  getRecurringTransactions,
  normalizeRecurringTransaction,
} from './recurring';

// Re-export user functions
export {
  getCurrentUser,
  postFeedback,
  type User,
  type FeedbackPayload,
} from './user';

// Re-export user tasks functions
export {
  getUserTasks,
  completeTutorial,
  type UserTasks,
} from './userTasks';
