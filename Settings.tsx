import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Download, Tags, DollarSign, ChevronRight, Shield, Bell, Target } from 'lucide-react';
import { UserSettings, ViewState, Transaction, Category } from '../types';

interface SettingsProps {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  onChangeView: (view: ViewState) => void;
  transactions: Transaction[];
  categories: Category[];
}

export function Settings({ settings, onUpdateSettings, onChangeView, transactions, categories }: SettingsProps) {
  const [budgetInput, setBudgetInput] = useState(settings.monthlyBudget.toString());
  const [savingsInput, setSavingsInput] = useState(settings.savingsGoal.toString());
  const [pinInput, setPinInput] = useState(settings.pinLock || '');

  const handleSaveBudget = () => {
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val >= 0) {
      onUpdateSettings({ ...settings, monthlyBudget: val });
    }
  };

  const handleSaveSavings = () => {
    const val = parseFloat(savingsInput);
    if (!isNaN(val) && val >= 0) {
      onUpdateSettings({ ...settings, savingsGoal: val });
    }
  };

  const handleSavePin = () => {
    if (pinInput.length === 4) {
      onUpdateSettings({ ...settings, pinLock: pinInput });
    } else if (pinInput === '') {
      onUpdateSettings({ ...settings, pinLock: null });
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Note'];
    const rows = transactions.map(t => {
      const cat = categories.find(c => c.id === t.categoryId)?.name || 'Unknown';
      return [t.date, t.type, cat, t.amount, `"${t.note}"`].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pb-32 px-6 pt-12 space-y-6 max-w-md mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
          <SettingsIcon className="text-slate-400" size={20} />
        </div>
      </div>

      <div className="space-y-4">
        {/* Budget Goal */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <DollarSign className="text-blue-400" size={20} />
            </div>
            <div>
              <h2 className="text-white font-semibold">Monthly Budget</h2>
              <p className="text-xs text-slate-400">Set your spending limit</p>
            </div>
          </div>
          <div className="flex gap-3">
            <input
              type="number"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500/50"
              placeholder="e.g. 2000"
            />
            <button
              onClick={handleSaveBudget}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-medium transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        {/* Savings Goal */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Target className="text-emerald-400" size={20} />
            </div>
            <div>
              <h2 className="text-white font-semibold">Savings Goal</h2>
              <p className="text-xs text-slate-400">Target monthly savings</p>
            </div>
          </div>
          <div className="flex gap-3">
            <input
              type="number"
              value={savingsInput}
              onChange={(e) => setSavingsInput(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500/50"
              placeholder="e.g. 500"
            />
            <button
              onClick={handleSaveSavings}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        {/* App Lock */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Shield className="text-purple-400" size={20} />
            </div>
            <div>
              <h2 className="text-white font-semibold">App Lock (PIN)</h2>
              <p className="text-xs text-slate-400">Leave blank to disable</p>
            </div>
          </div>
          <div className="flex gap-3">
            <input
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-purple-500/50 tracking-[0.5em] font-mono"
              placeholder="****"
            />
            <button
              onClick={handleSavePin}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl font-medium transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        {/* Categories Link */}
        <button
          onClick={() => onChangeView('categories')}
          className="w-full glass-card p-5 flex items-center justify-between group hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
              <Tags className="text-teal-400" size={20} />
            </div>
            <div className="text-left">
              <h2 className="text-white font-semibold">Manage Categories</h2>
              <p className="text-xs text-slate-400">Add or remove categories</p>
            </div>
          </div>
          <ChevronRight className="text-slate-500 group-hover:text-white transition-colors" size={20} />
        </button>

        {/* Export Data */}
        <button
          onClick={handleExportCSV}
          className="w-full glass-card p-5 flex items-center justify-between group hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Download className="text-orange-400" size={20} />
            </div>
            <div className="text-left">
              <h2 className="text-white font-semibold">Export Data</h2>
              <p className="text-xs text-slate-400">Download CSV report</p>
            </div>
          </div>
          <ChevronRight className="text-slate-500 group-hover:text-white transition-colors" size={20} />
        </button>

      </div>
    </motion.div>
  );
}
