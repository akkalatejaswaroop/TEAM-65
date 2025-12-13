import React from 'react';
import { LayoutDashboard, Map, Activity, AlertTriangle, Cpu, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'map', label: 'Network Map', icon: Map },
    { id: 'gantt', label: 'Timeline & Schedule', icon: Activity },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { id: 'optimization', label: 'Quantum Optimizer', icon: Cpu },
  ];

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Cpu className="w-8 h-8 text-cyan-400" />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              QuantumRail
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-2">v2.4.0 Production Build</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-800/50'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors">
            <Settings size={20} />
            <span>System Settings</span>
          </button>
          <div className="mt-4 flex items-center gap-3 px-4">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-green-500 font-mono">SYSTEM ONLINE</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-900 relative">
        {children}
      </main>
    </div>
  );
};

export default Layout;
