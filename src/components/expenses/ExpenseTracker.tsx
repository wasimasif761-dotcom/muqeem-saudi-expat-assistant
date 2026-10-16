import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  PlusCircle, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight, 
  PiggyBank, 
  TrendingUp, 
  Calendar,
  Utensils,
  Home,
  Car,
  Send,
  Users,
  Building,
  Zap,
  HeartPulse,
  MoreHorizontal
} from 'lucide-react';
import { db } from '../../db/db';
import { ExpenseCategory, ExpenseItem, MonthlyBudget } from '../../types';
import { useI18n } from '../../context/I18nContext';

export const ExpenseTracker: React.FC = () => {
  const { t, isRtl } = useI18n();

  const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-10"
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [salary, setSalary] = useState<number>(8500);
  const [targetSavings, setTargetSavings] = useState<number>(2000);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);

  // Form states
  const [amountInput, setAmountInput] = useState<string>('');
  const [categoryInput, setCategoryInput] = useState<ExpenseCategory>('food');
  const [descriptionInput, setDescriptionInput] = useState<string>('');
  const [dateInput, setDateInput] = useState<string>(new Date().toISOString().split('T')[0]);

  const loadData = async () => {
    // Load budget
    const budget = await db.budgets.get(selectedMonth);
    if (budget) {
      setSalary(budget.salary);
      setTargetSavings(budget.targetSavings);
    } else {
      // Default initial budget
      setSalary(8500);
      setTargetSavings(2000);
    }

    // Load expenses for selected month
    const items = await db.expenses.where('monthYear').equals(selectedMonth).toArray();
    setExpenses(items.sort((a, b) => b.createdAt - a.createdAt));
  };

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  const handleUpdateBudget = async (newSalary: number, newSavings: number) => {
    setSalary(newSalary);
    setTargetSavings(newSavings);
    await db.budgets.put({
      monthYear: selectedMonth,
      salary: newSalary,
      targetSavings: newSavings,
    });
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amountInput);
    if (isNaN(num) || num <= 0) return;

    const item: ExpenseItem = {
      id: `exp-${Date.now()}`,
      monthYear: selectedMonth,
      category: categoryInput,
      amount: num,
      description: descriptionInput.trim() || t.earnings.categories[categoryInput],
      date: dateInput || new Date().toISOString().split('T')[0],
      createdAt: Date.now(),
    };

    await db.expenses.add(item);
    setAmountInput('');
    setDescriptionInput('');
    loadData();
  };

  const handleDeleteExpense = async (id: string) => {
    await db.expenses.delete(id);
    loadData();
  };

  // Calculations
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const remainingBalance = salary - totalSpent;
  const savingsRate = salary > 0 ? Math.round(((salary - totalSpent) / salary) * 100) : 0;

  // Category breakdown
  const categoryConfig: Record<ExpenseCategory, { label: string; color: string; icon: React.ElementType }> = {
    rent: { label: t.earnings.categories.rent, color: '#047857', icon: Home },
    food: { label: t.earnings.categories.food, color: '#f59e0b', icon: Utensils },
    transport: { label: t.earnings.categories.transport, color: '#0ea5e9', icon: Car },
    remittance: { label: t.earnings.categories.remittance, color: '#8b5cf6', icon: Send },
    family: { label: t.earnings.categories.family, color: '#ec4899', icon: Users },
    government_fees: { label: t.earnings.categories.government_fees, color: '#ef4444', icon: Building },
    utilities: { label: t.earnings.categories.utilities, color: '#14b8a6', icon: Zap },
    health: { label: t.earnings.categories.health, color: '#06b6d4', icon: HeartPulse },
    other: { label: t.earnings.categories.other, color: '#64748b', icon: MoreHorizontal },
  };

  const categoryTotals: Record<ExpenseCategory, number> = {
    rent: 0,
    food: 0,
    transport: 0,
    remittance: 0,
    family: 0,
    government_fees: 0,
    utilities: 0,
    health: 0,
    other: 0,
  };

  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const activeCategories = (Object.keys(categoryTotals) as ExpenseCategory[])
    .filter((cat) => categoryTotals[cat] > 0)
    .sort((a, b) => categoryTotals[b] - categoryTotals[a]);

  // SVG Donut calculation
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
            <Wallet className="w-3.5 h-3.5" />
            <span>IndexedDB Financial Vault</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            {t.earnings.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            {t.earnings.subtitle}
          </p>
        </div>

        {/* Month picker */}
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
        />
      </div>

      {/* Salary & Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Monthly Income Card */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.earnings.monthlySalary}</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <input
              type="number"
              value={salary}
              onChange={(e) => handleUpdateBudget(parseFloat(e.target.value) || 0, targetSavings)}
              className="text-2xl font-black text-white font-mono bg-transparent border-b border-dashed border-slate-700 w-32 focus:outline-none focus:border-emerald-400"
            />
            <span className="text-xs font-bold text-slate-400">{t.common.sar}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Tap number to adjust monthly pay</p>
        </div>

        {/* Total Spent */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.earnings.totalSpent}</span>
            <ArrowDownRight className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-rose-400 font-mono">
              {totalSpent.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-400">{t.common.sar}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            {expenses.length} expenses logged this month
          </p>
        </div>

        {/* Remaining Balance */}
        <div className={`rounded-2xl border p-4 ${
          remainingBalance >= 0 
            ? 'bg-emerald-950/40 border-emerald-700/50' 
            : 'bg-rose-950/40 border-rose-700/50'
        }`}>
          <div className="flex items-center justify-between text-xs">
            <span className={remainingBalance >= 0 ? 'text-emerald-300' : 'text-rose-300'}>
              {t.earnings.remainingBudget}
            </span>
            <PiggyBank className={`w-4 h-4 ${remainingBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={`text-2xl font-black font-mono ${remainingBalance >= 0 ? 'text-white' : 'text-rose-300'}`}>
              {remainingBalance.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-400">{t.common.sar}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Savings rate: <strong className={savingsRate > 20 ? 'text-emerald-400' : 'text-amber-400'}>{savingsRate}%</strong>
          </p>
        </div>
      </div>

      {/* Visual Expense Breakdown Chart & Add Expense Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Interactive Donut & Category List (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-4">
            {t.earnings.expenseHistory}
          </h3>

          {totalSpent === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              {t.earnings.emptyExpenses}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Donut and Highlights */}
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
                <div className="relative w-40 h-40 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      stroke="#1e293b"
                      strokeWidth="18"
                    />
                    {activeCategories.map((cat) => {
                      const amount = categoryTotals[cat];
                      const percent = amount / totalSpent;
                      const strokeDasharray = `${circumference * percent} ${circumference * (1 - percent)}`;
                      const strokeDashoffset = -circumference * accumulatedPercent;
                      accumulatedPercent += percent;

                      return (
                        <circle
                          key={cat}
                          cx="80"
                          cy="80"
                          r={radius}
                          fill="transparent"
                          stroke={categoryConfig[cat].color}
                          strokeWidth="18"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-500"
                        />
                      );
                    })}
                  </svg>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Total</span>
                    <span className="text-sm font-black text-white font-mono">{totalSpent.toLocaleString()}</span>
                    <span className="text-[9px] text-emerald-400 font-semibold">{t.common.sar}</span>
                  </div>
                </div>

                {/* Progress bars for top categories */}
                <div className="flex-1 w-full space-y-2.5">
                  {activeCategories.slice(0, 4).map((cat) => {
                    const amount = categoryTotals[cat];
                    const percent = Math.round((amount / totalSpent) * 100);
                    const cfg = categoryConfig[cat];
                    const Icon = cfg.icon;

                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: cfg.color }}
                            />
                            {cfg.label}
                          </span>
                          <span className="font-mono text-slate-200">
                            {amount.toLocaleString()} {t.common.sar} ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: cfg.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Expense History Table */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-400 block mb-2">
                  Recent Entries
                </span>
                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                  {expenses.map((item) => {
                    const cfg = categoryConfig[item.category] || categoryConfig.other;
                    const Icon = cfg.icon;

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-200 truncate">
                              {item.description}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              {item.date} • {cfg.label}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">
                            {item.amount.toLocaleString()} {t.common.sar}
                          </span>
                          <button
                            onClick={() => handleDeleteExpense(item.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Add New Expense Form (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              {t.earnings.addExpense}
            </h3>
          </div>

          <form onSubmit={handleAddExpense} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {t.earnings.category}
              </label>
              <select
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value as ExpenseCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="rent">{t.earnings.categories.rent}</option>
                <option value="food">{t.earnings.categories.food}</option>
                <option value="transport">{t.earnings.categories.transport}</option>
                <option value="remittance">{t.earnings.categories.remittance}</option>
                <option value="family">{t.earnings.categories.family}</option>
                <option value="government_fees">{t.earnings.categories.government_fees}</option>
                <option value="utilities">{t.earnings.categories.utilities}</option>
                <option value="health">{t.earnings.categories.health}</option>
                <option value="other">{t.earnings.categories.other}</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Amount ({t.common.sar}) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder={t.earnings.amountPlaceholder}
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Description
              </label>
              <input
                type="text"
                placeholder={t.earnings.descriptionPlaceholder}
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {t.earnings.date}
              </label>
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-sm text-white shadow-lg shadow-emerald-950/50 transition active:scale-95 flex items-center justify-center gap-2 mt-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.earnings.addExpense}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
