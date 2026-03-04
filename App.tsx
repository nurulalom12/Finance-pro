import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Transaction, Category, ViewState, UserSettings } from './types';
import { DEFAULT_CATEGORIES } from './constants';

import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { Analytics } from './components/Analytics';
import { History } from './components/History';
import { Categories } from './components/Categories';
import { Settings } from './components/Settings';
import { AddTransactionModal } from './components/AddTransactionModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Onboarding } from './components/Onboarding';
import { PinLock } from './components/PinLock';

export default function App() {
  const [view, setView] = useState<ViewState>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('smart-income-transactions', []);
  const [categories, setCategories] = useLocalStorage<Category[]>('smart-income-categories', DEFAULT_CATEGORIES);
  const [settings, setSettings] = useLocalStorage<UserSettings>('smart-income-settings', {
    currency: 'USD',
    monthlyBudget: 2000,
    savingsGoal: 500,
    pinLock: null,
    hasCompletedOnboarding: false,
  });

  useEffect(() => {
    if (!settings.pinLock) {
      setIsUnlocked(true);
    }
  }, [settings.pinLock]);

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = uuidv4();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const handleAddTransaction = useCallback((newTransaction: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTransaction,
      id: uuidv4(),
    };
    setTransactions((prev) => [...prev, transaction]);
    addToast(`Successfully added ${transaction.type}`, 'success');
  }, [setTransactions, addToast]);

  const handleDeleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    addToast('Transaction deleted', 'info');
  }, [setTransactions, addToast]);

  const handleAddCategory = useCallback((newCategory: Omit<Category, 'id'>) => {
    const category: Category = {
      ...newCategory,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, category]);
    addToast('Category added', 'success');
  }, [setCategories, addToast]);

  const handleDeleteCategory = useCallback((id: string) => {
    const isUsed = transactions.some(t => t.categoryId === id);
    if (isUsed) {
      addToast('Cannot delete category in use', 'error');
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    addToast('Category deleted', 'info');
  }, [setCategories, addToast, transactions]);

  if (!settings.hasCompletedOnboarding) {
    return <Onboarding onComplete={() => setSettings({ ...settings, hasCompletedOnboarding: true })} />;
  }

  if (settings.pinLock && !isUnlocked) {
    return <PinLock correctPin={settings.pinLock} onUnlock={() => setIsUnlocked(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#0B1120] text-slate-50 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      <ToastContainer toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
      
      <AnimatePresence mode="wait">
        {view === 'dashboard' && (
          <motion.div key="dashboard" className="w-full h-full">
            <Dashboard
              transactions={transactions}
              categories={categories}
              settings={settings}
              onViewAll={() => setView('history')}
            />
          </motion.div>
        )}
        {view === 'analytics' && (
          <motion.div key="analytics" className="w-full h-full">
            <Analytics
              transactions={transactions}
              categories={categories}
            />
          </motion.div>
        )}
        {view === 'history' && (
          <motion.div key="history" className="w-full h-full">
            <History
              transactions={transactions}
              categories={categories}
              onDelete={handleDeleteTransaction}
            />
          </motion.div>
        )}
        {view === 'categories' && (
          <motion.div key="categories" className="w-full h-full">
            <Categories
              categories={categories}
              onAdd={handleAddCategory}
              onDelete={handleDeleteCategory}
              onBack={() => setView('settings')}
            />
          </motion.div>
        )}
        {view === 'settings' && (
          <motion.div key="settings" className="w-full h-full">
            <Settings
              settings={settings}
              onUpdateSettings={setSettings}
              onChangeView={setView}
              transactions={transactions}
              categories={categories}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav
        currentView={view}
        onChangeView={setView}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddTransaction}
        categories={categories}
      />
    </div>
  );
}

