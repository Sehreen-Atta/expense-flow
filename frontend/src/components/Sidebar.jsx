import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'All Expenses', icon: Receipt },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border flex-col hidden md:flex h-full sticky top-0 justify-between">
      <div>
        <div className="p-6 pb-2">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent flex items-center gap-2">
            <Receipt className="text-primary" /> ExpenseFlow
          </h1>
        </div>
        
        <nav className="px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                activeTab === item.id 
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20' 
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
              }`}
            >
              <item.icon size={20} /> {item.label}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
