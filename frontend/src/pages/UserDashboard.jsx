import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Plus, Bell, Calendar, Search, ArrowUpRight, ArrowDownRight, CreditCard, Pencil, Trash2, Loader2, Receipt, ShoppingCart, Car, Zap, Film, Utensils, Dumbbell } from 'lucide-react';
import api from '../api';
import Sidebar from '../components/Sidebar';

const COLORS = ['#38bdf8', '#c084fc', '#34d399', '#f472b6', '#fbbf24', '#818cf8'];
const CATEGORIES = ['Food & Dining', 'Transport', 'Shopping', 'Bills & Utilities', 'Entertainment', 'Others'];

const ICONS = {
  'Food & Dining': <Utensils size={20} />,
  'Transport': <Car size={20} />,
  'Shopping': <ShoppingCart size={20} />,
  'Bills & Utilities': <Zap size={20} />,
  'Entertainment': <Film size={20} />,
  'Others': <Dumbbell size={20} />
};

export default function UserDashboard() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', amount: '', category: CATEGORIES[0], date: new Date().toISOString().split('T')[0], notes: '' });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setError(null);
      const res = await api.get('/expenses');
      setExpenses(res.data);
    } catch (err) {
      setError('Failed to fetch expenses. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (expense = null) => {
    if (expense) {
      setEditingId(expense._id);
      setFormData({
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        date: new Date(expense.date).toISOString().split('T')[0],
        notes: expense.notes || ''
      });
    } else {
      setEditingId(null);
      setFormData({ title: '', amount: '', category: CATEGORIES[0], date: new Date().toISOString().split('T')[0], notes: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      if (editingId) {
        const res = await api.put(`/expenses/${editingId}`, formData);
        setExpenses(expenses.map(exp => exp._id === editingId ? res.data : exp));
      } else {
        const res = await api.post('/expenses', formData);
        setExpenses([res.data, ...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
      setIsModalOpen(false);
    } catch (err) {
      setError('Error saving expense. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        setError(null);
        await api.delete(`/expenses/${id}`);
        setExpenses(expenses.filter(exp => exp._id !== id));
      } catch (err) {
        setError('Error deleting expense. Please try again.');
      }
    }
  };

  const totalExpenses = useMemo(() => expenses.reduce((sum, exp) => sum + exp.amount, 0), [expenses]);
  
  const thisMonthExpenses = useMemo(() => {
    const now = new Date();
    return expenses
      .filter(exp => {
        const d = new Date(exp.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);

  const categoryTotals = useMemo(() => {
    return expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});
  }, [expenses]);

  const chartData = useMemo(() => {
    return Object.keys(categoryTotals).map((key, index) => ({
      name: key,
      value: categoryTotals[key],
      color: COLORS[index % COLORS.length]
    })).sort((a, b) => b.value - a.value);
  }, [categoryTotals]);

  // Aggregate expenses by day for the Bar Chart
  const barChartData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }).reverse();

    const grouped = expenses.reduce((acc, exp) => {
      const dateStr = new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      acc[dateStr] = (acc[dateStr] || 0) + exp.amount;
      return acc;
    }, {});

    return last7Days.map(date => ({
      name: date,
      amount: grouped[date] || 0
    }));
  }, [expenses]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-primary">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  const renderExpenseList = (expensesList) => (
    <div className="flex-1 overflow-auto">
      {expensesList.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
          <Receipt size={40} className="mb-4 opacity-20" />
          <p>No expenses found. Add one!</p>
        </div>
      ) : (
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="text-muted-foreground uppercase tracking-wider text-[10px]">
              <th className="px-6 py-4 font-medium">Title</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium text-right">Amount</th>
              <th className="px-6 py-4 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {expensesList.map((exp) => {
              const catIndex = CATEGORIES.indexOf(exp.category);
              const iconColor = COLORS[catIndex !== -1 ? catIndex % COLORS.length : 0];
              return (
              <tr key={exp._id} className="hover:bg-secondary/20 transition-colors group">
                <td className="px-6 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm shrink-0 border border-border/50" style={{ backgroundColor: `${iconColor}20`, color: iconColor }}>
                    {ICONS[exp.category] || <CreditCard size={20} />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-foreground truncate">{exp.title}</div>
                    {exp.notes && <div className="text-xs text-muted-foreground truncate max-w-[150px]">{exp.notes}</div>}
                  </div>
                </td>
                <td className="px-6 py-3">
                  <span className="px-3 py-1 rounded-full text-[10px] font-medium bg-secondary text-secondary-foreground border border-border/50 whitespace-nowrap">
                    {exp.category}
                  </span>
                </td>
                <td className="px-6 py-3 text-muted-foreground whitespace-nowrap">
                  {new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-6 py-3 font-semibold text-right whitespace-nowrap">
                  ${exp.amount.toFixed(2)}
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(exp)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(exp._id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background relative">
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-2 animate-in slide-in-from-top-2">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-2 font-bold opacity-70 hover:opacity-100">&times;</button>
          </div>
        )}
        
        {/* Header */}
        <header className="h-24 flex items-center justify-between px-8 z-10 shrink-0">
          <div>
            <h2 className="text-2xl font-bold">Good Evening <span className="text-2xl">👋</span></h2>
            <p className="text-muted-foreground text-sm mt-1">Here's what's happening with your finances today.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input type="text" placeholder="Search expenses..." className="bg-card border border-border rounded-full pl-10 pr-4 py-2.5 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-primary/50" />
            </div>
            
            <button className="relative p-2.5 bg-card border border-border rounded-full hover:bg-secondary transition-colors">
              <Bell size={18} />
            </button>
            <button 
              onClick={() => handleOpenModal()}
              className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-full font-medium flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(129,140,248,0.3)] hover:-translate-y-0.5"
            >
              <Plus size={18} /> Add Expense
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-6">
          {activeTab === 'expenses' ? (
             <div className="bg-card rounded-2xl border border-border shadow-lg flex flex-col h-full">
              <div className="p-6 border-b border-border flex justify-between items-center">
                <h3 className="text-lg font-semibold">All Expenses</h3>
              </div>
              {renderExpenseList(expenses)}
             </div>
          ) : (
            <>
              {/* Top Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#2a1b4d] rounded-2xl p-5 border border-purple-500/20 shadow-lg relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-purple-200/70 text-sm font-medium">Total Expenses</p>
                    <div className="bg-purple-500/20 p-2 rounded-lg"><CreditCard size={18} className="text-purple-300" /></div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">${totalExpenses.toFixed(2)}</h3>
                  <p className="text-xs text-green-400 flex items-center gap-1"><ArrowUpRight size={14}/> 12.5% <span className="text-purple-200/50">from last month</span></p>
                </div>
                
                <div className="bg-[#0f2854] rounded-2xl p-5 border border-blue-500/20 shadow-lg relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-blue-200/70 text-sm font-medium">This Month</p>
                    <div className="bg-blue-500/20 p-2 rounded-lg"><Calendar size={18} className="text-blue-300" /></div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">${thisMonthExpenses.toFixed(2)}</h3>
                  <p className="text-xs text-green-400 flex items-center gap-1"><ArrowUpRight size={14}/> 100% <span className="text-blue-200/50">from last month</span></p>
                </div>

                <div className="bg-[#0d3429] rounded-2xl p-5 border border-green-500/20 shadow-lg relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-green-200/70 text-sm font-medium">Transaction Count</p>
                    <div className="bg-green-500/20 p-2 rounded-lg"><Receipt size={18} className="text-green-300" /></div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">{expenses.length}</h3>
                  <p className="text-xs text-green-400 flex items-center gap-1"><ArrowUpRight size={14}/> 25% <span className="text-green-200/50">from last month</span></p>
                </div>

                <div className="bg-[#422116] rounded-2xl p-5 border border-orange-500/20 shadow-lg relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-orange-200/70 text-sm font-medium">Average Expense</p>
                    <div className="bg-orange-500/20 p-2 rounded-lg"><CreditCard size={18} className="text-orange-300" /></div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">${expenses.length ? (totalExpenses/expenses.length).toFixed(2) : '0.00'}</h3>
                  <p className="text-xs text-red-400 flex items-center gap-1"><ArrowDownRight size={14}/> 8.2% <span className="text-orange-200/50">from last month</span></p>
                </div>
              </div>

              {/* Middle Row: Pie Chart & Recent Transactions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pie Chart */}
                <div className="bg-card rounded-2xl p-6 border border-border shadow-lg lg:col-span-1">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Spending by Category</h3>
                    <select className="bg-secondary text-xs px-2 py-1 rounded-md border-none outline-none text-muted-foreground"><option>This Month</option></select>
                  </div>
                  
                  <div className="h-[200px] relative">
                    {chartData.length > 0 ? (
                      <>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                              {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                            </Pie>
                            <RechartsTooltip formatter={(value) => `$${value.toFixed(2)}`} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.75rem' }} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-2xl font-bold">${thisMonthExpenses.toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground">Total</span>
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data</div>
                    )}
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    {chartData.slice(0, 4).map(cat => (
                      <div key={cat.name} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{backgroundColor: cat.color}}></div>
                          <span className="text-muted-foreground">{cat.name}</span>
                        </div>
                        <div className="flex gap-4">
                          <span className="font-medium">${cat.value.toFixed(2)}</span>
                          <span className="text-muted-foreground w-8 text-right">{totalExpenses > 0 ? ((cat.value/totalExpenses)*100).toFixed(1) : 0}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-card rounded-2xl border border-border shadow-lg lg:col-span-2 flex flex-col">
                  <div className="p-6 border-b border-border flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Recent Transactions</h3>
                    <button onClick={() => setActiveTab('expenses')} className="text-xs bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded-full transition-colors">View All</button>
                  </div>
                  {renderExpenseList(expenses.slice(0, 6))}
                </div>
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bar Chart (Replaced Line Chart) */}
                <div className="bg-card rounded-2xl p-6 border border-border shadow-lg lg:col-span-2">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Last 7 Days</h3>
                    <select className="bg-secondary text-xs px-2 py-1 rounded-md border-none outline-none text-muted-foreground"><option>Past Week</option></select>
                  </div>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                        <RechartsTooltip cursor={{fill: 'hsl(var(--secondary))', opacity: 0.2}} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }} />
                        <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Categories */}
                <div className="bg-card rounded-2xl p-6 border border-border shadow-lg">
                   <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Top Categories</h3>
                    <button onClick={() => setActiveTab('expenses')} className="text-xs bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded-full transition-colors">View All</button>
                  </div>
                  <div className="space-y-5">
                    {chartData.slice(0, 4).map((cat, i) => (
                      <div key={cat.name}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <div className="flex items-center gap-2">
                             <div className="p-1.5 rounded-md" style={{backgroundColor: `${cat.color}20`, color: cat.color}}>{ICONS[cat.name]}</div>
                             <span className="font-medium text-foreground">{cat.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                             <span className="text-muted-foreground">${cat.value.toFixed(2)}</span>
                             <span className="text-xs text-muted-foreground w-8 text-right">{totalExpenses > 0 ? ((cat.value/totalExpenses)*100).toFixed(1) : 0}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${totalExpenses > 0 ? (cat.value/totalExpenses)*100 : 0}%`, backgroundColor: cat.color }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Enhanced Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
           <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border p-6 animate-in zoom-in-95 duration-200">
              <h3 className="text-xl font-semibold mb-6">{editingId ? 'Edit Expense' : 'Add Expense'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                   <label className="block text-xs text-muted-foreground mb-1">Title</label>
                   <input type="text" placeholder="e.g., Grocery shopping" required className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-1 focus:ring-primary outline-none transition-all" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} />
                 </div>
                 
                 <div className="flex gap-4">
                   <div className="flex-1">
                     <label className="block text-xs text-muted-foreground mb-1">Amount ($)</label>
                     <input type="number" placeholder="0.00" step="0.01" min="0" required className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-1 focus:ring-primary outline-none transition-all" value={formData.amount} onChange={e=>setFormData({...formData, amount: e.target.value})} />
                   </div>
                   <div className="flex-1">
                     <label className="block text-xs text-muted-foreground mb-1">Date</label>
                     <input type="date" required className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-1 focus:ring-primary outline-none transition-all" value={formData.date} onChange={e=>setFormData({...formData, date: e.target.value})} />
                   </div>
                 </div>

                 <div>
                   <label className="block text-xs text-muted-foreground mb-1">Category</label>
                   <select className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-1 focus:ring-primary outline-none transition-all" value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                 </div>

                 <div>
                   <label className="block text-xs text-muted-foreground mb-1">Notes (Optional)</label>
                   <textarea placeholder="Any additional details..." className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-1 focus:ring-primary outline-none transition-all resize-none h-20" value={formData.notes} onChange={e=>setFormData({...formData, notes: e.target.value})}></textarea>
                 </div>

                 <div className="flex gap-3 justify-end pt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 font-medium transition-colors">Cancel</button>
                    <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium shadow-lg hover:-translate-y-0.5 transition-all">
                      {editingId ? 'Save Changes' : 'Add Expense'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
