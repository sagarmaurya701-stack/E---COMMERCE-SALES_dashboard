import React from 'react';
import { 
  BarChart3, 
  Database, 
  Calculator, 
  HelpCircle, 
  Layers, 
  ShieldCheck, 
  LogOut, 
  UserCheck, 
  Download, 
  FileText,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { UserProfile } from '../firebase';

export type ActiveTab = 'overview' | 'deepdive' | 'powerquery' | 'dax' | 'interview';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  userProfile: UserProfile | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenAuditLogs: () => void;
  onOpenExport: () => void;
  dataHealthScore: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userProfile,
  onOpenAuth,
  onSignOut,
  onOpenAuditLogs,
  onOpenExport,
  dataHealthScore,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      {/* Top Application Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-xl">
              PBi
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                  Sales Analytics Studio
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  Power BI & Excel Edition
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                E-Commerce Sales Performance & Data Cleaning Engine
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Data Pipeline Health Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-400">Data Quality:</span>
              <span className="font-semibold text-emerald-400">{dataHealthScore}%</span>
            </div>

            {/* Export Report Action */}
            <button
              onClick={onOpenExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              title="Export Executive Report & PDF"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Export Report</span>
            </button>

            {/* Audit Trail (RBAC / Compliance) */}
            <button
              onClick={onOpenAuditLogs}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
              title="View Security Audit Trail"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Audit Logs</span>
            </button>

            {/* User Profile / Auth Button */}
            {userProfile ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-bold text-xs uppercase">
                    {userProfile.displayName ? userProfile.displayName.charAt(0) : 'A'}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
                      {userProfile.displayName}
                    </p>
                    <span className="text-[10px] uppercase font-bold text-amber-400/90 tracking-wider">
                      {userProfile.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onSignOut}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/10 transition"
              >
                <UserCheck className="w-4 h-4" />
                <span>Sign In / Demo</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="flex overflow-x-auto no-scrollbar border-t border-slate-800/80 -mx-4 px-4 sm:mx-0 sm:px-0">
          <nav className="flex space-x-1 py-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'overview'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Page 1: Executive Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('deepdive')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'deepdive'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Page 2: Category & Returns</span>
            </button>

            <button
              onClick={() => setActiveTab('powerquery')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'powerquery'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Stage 2: Power Query Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('dax')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'dax'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Stage 3: DAX Measures</span>
            </button>

            <button
              onClick={() => setActiveTab('interview')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'interview'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Stage 5: Resume & Interview Hub</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
