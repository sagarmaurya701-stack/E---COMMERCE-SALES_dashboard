import React from 'react';
import { 
  FileText, 
  Layers, 
  Database, 
  Calculator, 
  Sparkles, 
  Plus, 
  Maximize2 
} from 'lucide-react';
import { ActiveTab } from './Navbar';

interface PowerBiBottomTabsProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  filteredCount: number;
}

export const PowerBiBottomTabs: React.FC<PowerBiBottomTabsProps> = ({
  activeTab,
  setActiveTab,
  filteredCount,
}) => {
  const pages: { id: ActiveTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Page 1 — Executive Overview', icon: FileText },
    { id: 'deepdive', label: 'Page 2 — Category & Returns Deep Dive', icon: Layers },
    { id: 'powerquery', label: 'Transform Data (Power Query)', icon: Database },
    { id: 'dax', label: 'Modeling & DAX Measures', icon: Calculator },
    { id: 'interview', label: 'Finding Proof (15.2% Margin Gap)', icon: Sparkles },
  ];

  return (
    <div className="bg-slate-900 border-t border-slate-800 px-3 py-1.5 flex items-center justify-between text-xs select-none z-30 shrink-0">
      {/* Bottom Tabs List */}
      <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
        {pages.map(page => {
          const isActive = activeTab === page.id;
          const Icon = page.icon;

          return (
            <button
              key={page.id}
              onClick={() => setActiveTab(page.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-t-md text-xs font-semibold whitespace-nowrap transition border-b-2 ${
                isActive
                  ? 'bg-slate-950 text-amber-300 border-amber-400 font-bold shadow'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{page.label}</span>
            </button>
          );
        })}

        <button
          className="p-1 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-800"
          title="New Page"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right Status / Canvas Metrics */}
      <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
        <span>Rows: <strong className="text-slate-200 font-mono">{filteredCount.toLocaleString()}</strong></span>
        <span className="text-slate-600">|</span>
        <span>Fit to page (16:9)</span>
        <span className="text-slate-600">|</span>
        <span className="text-emerald-400 font-medium">Power BI Engine Active</span>
      </div>
    </div>
  );
};
