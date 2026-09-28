import React from 'react';
import { 
  RefreshCw, 
  FileDown, 
  RotateCcw, 
  Filter, 
  ShieldCheck, 
  User, 
  LogOut, 
  Sparkles,
  CheckCircle2,
  Download
} from 'lucide-react';
import { UserProfile } from '../firebase';

interface PowerBiToolbarProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  onExportPdf: () => void;
  onOpenDownloadModal: () => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  isFiltersPaneOpen: boolean;
  onToggleFiltersPane: () => void;
  userProfile: UserProfile | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenAuditLogs: () => void;
  dataQualityScore: number;
}

export const PowerBiToolbar: React.FC<PowerBiToolbarProps> = ({
  onRefresh,
  isRefreshing,
  onExportPdf,
  onOpenDownloadModal,
  onResetFilters,
  hasActiveFilters,
  isFiltersPaneOpen,
  onToggleFiltersPane,
  userProfile,
  onOpenAuth,
  onSignOut,
  onOpenAuditLogs,
  dataQualityScore,
}) => {
  return (
    <div className="bg-slate-900 border-b border-slate-800 px-3 sm:px-4 py-2 flex items-center justify-between text-xs select-none shadow-md z-30">
      {/* Left: Power BI App Title & Document Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Power BI Brand Yellow Badge */}
        <div className="h-7 w-7 rounded bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow">
          PB
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-white tracking-tight">
            Ecommerce_Sales_Dashboard.pbix
          </span>
          <span className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
            <span>Power BI Desktop</span>
          </span>
          <span className="hidden lg:inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            <span>Data Health: {dataQualityScore}%</span>
          </span>
        </div>
      </div>

      {/* Right: Power BI Functional Tooling */}
      <div className="flex items-center gap-2">
        {/* Download Project Package (Prominent Button) */}
        <button
          onClick={onOpenDownloadModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
          title="Download complete project ZIP, CSV datasets, M-Code & DAX"
        >
          <Download className="w-3.5 h-3.5 text-slate-950" />
          <span>Download Project</span>
        </button>

        {/* Refresh Visuals */}
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          title="Refresh dataset & visual calculations"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        {/* Reset Slicers */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium border border-rose-500/30 transition"
            title="Reset all visual slicers to default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Slicers</span>
          </button>
        )}

        {/* Toggle Filters Pane */}
        <button
          onClick={onToggleFiltersPane}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium border transition ${
            isFiltersPaneOpen
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
          title="Toggle Power BI Filters Pane"
        >
          <Filter className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Filters Pane</span>
        </button>

        {/* Export to PDF (Stage 6) */}
        <button
          onClick={onExportPdf}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          title="Export report snapshot to PDF"
        >
          <FileDown className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Export PDF</span>
        </button>

        {/* Audit Log / Compliance */}
        <button
          onClick={onOpenAuditLogs}
          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition"
          title="View Audit Trail"
        >
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
        </button>

        {/* Auth / User Status */}
        {userProfile ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="flex items-center gap-1.5">
              <div className="h-6 w-6 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-bold text-[11px]">
                {userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="hidden md:inline text-xs text-slate-300 font-medium truncate max-w-[110px]">
                {userProfile.displayName}
              </span>
            </div>
            <button
              onClick={onSignOut}
              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In / Demo</span>
          </button>
        )}
      </div>
    </div>
  );
};
