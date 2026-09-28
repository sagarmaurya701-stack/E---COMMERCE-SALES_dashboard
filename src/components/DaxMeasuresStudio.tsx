import React, { useState } from 'react';
import { 
  Calculator, 
  Copy, 
  Check, 
  HelpCircle, 
  Calendar, 
  Layers, 
  ArrowRight, 
  Sparkles, 
  Info,
  GitFork,
  ExternalLink
} from 'lucide-react';
import { CleanedTransactionRecord, DaxMeasures } from '../types/ecommerce';
import { DAX_CATALOG, DaxFormulaMeta } from '../utils/daxEngine';

interface DaxMeasuresStudioProps {
  records: CleanedTransactionRecord[];
  daxMeasures: DaxMeasures;
}

export const DaxMeasuresStudio: React.FC<DaxMeasuresStudioProps> = ({
  records,
  daxMeasures,
}) => {
  const [selectedMeasure, setSelectedMeasure] = useState<DaxFormulaMeta>(DAX_CATALOG[0]);
  const [copiedName, setCopiedName] = useState<string | null>(null);

  const handleCopy = (expression: string, name: string) => {
    navigator.clipboard.writeText(expression);
    setCopiedName(name);
    setTimeout(() => setCopiedName(null), 2000);
  };

  const getLiveValue = (name: string): string => {
    switch (name) {
      case 'Total Revenue':
        return `$${daxMeasures.totalRevenue.toLocaleString()}`;
      case 'Total Profit':
        return `$${daxMeasures.totalProfit.toLocaleString()}`;
      case 'Profit Margin %':
        return `${daxMeasures.profitMarginPct.toFixed(1)}%`;
      case 'Total Orders':
        return daxMeasures.totalOrders.toLocaleString();
      case 'Return Rate':
        return `${daxMeasures.returnRate.toFixed(1)}%`;
      case 'Avg Order Value (AOV)':
        return `$${daxMeasures.avgOrderValue.toFixed(2)}`;
      case 'Revenue MoM Growth %':
        return `${daxMeasures.revenueMomGrowthPct >= 0 ? '+' : ''}${daxMeasures.revenueMomGrowthPct.toFixed(1)}%`;
      default:
        return 'N/A';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Studio Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                Stage 3 Engine
              </span>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                DAX Measures & Model View Studio
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Inspection and live evaluation of production DAX measures: SUM, DIVIDE, DISTINCTCOUNT, CALCULATE, and Time Intelligence.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            <span>Live Modeling Engine Active</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Measure Selector & Code Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Measure Selector List */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Engine Measures ({DAX_CATALOG.length})
          </div>

          <div className="space-y-2">
            {DAX_CATALOG.map(m => {
              const isSelected = selectedMeasure.name === m.name;
              return (
                <button
                  key={m.name}
                  onClick={() => setSelectedMeasure(m)}
                  className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/50 text-white'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{m.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{m.category}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-amber-300">
                      {getLiveValue(m.name)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Measure Detail & Explanations */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                  {selectedMeasure.category}
                </span>
                <h3 className="text-lg font-bold text-white">{selectedMeasure.name}</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">{selectedMeasure.description}</p>
            </div>

            <button
              onClick={() => handleCopy(selectedMeasure.expression, selectedMeasure.name)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
            >
              {copiedName === selectedMeasure.name ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy DAX</span>
                </>
              )}
            </button>
          </div>

          {/* DAX Formula Display Box */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              DAX Syntax Expression
            </div>
            <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-amber-300 overflow-x-auto leading-relaxed">
              {selectedMeasure.expression}
            </pre>
          </div>

          {/* Evaluation Result */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">Evaluated Live Value on Current Filter State:</span>
              <div className="text-2xl font-black text-white mt-0.5">
                {getLiveValue(selectedMeasure.name)}
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-400">
              Evaluated across {records.length.toLocaleString()} transactions
            </div>
          </div>

          {/* Interview & Technical Insight Note */}
          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-cyan-300">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Interview Defense & Technical Rationale:</span>
            </div>
            <p className="leading-relaxed text-slate-300">
              {selectedMeasure.interviewNote}
            </p>
          </div>
        </div>
      </div>

      {/* Date Table & Data Modeling Star Schema Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Date Table & Modeling Relationship (Model View)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Time Intelligence functions (like DATEADD in MoM Growth) require a dedicated Date dimension table.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* DAX Calendar Table Code */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-amber-300">Date Table Definition (DAX)</div>
            <pre className="font-mono text-xs text-slate-300 leading-relaxed">
{`DateTable = 
CALENDAR(
    MIN('Raw_Transactions'[Order Date]), 
    MAX('Raw_Transactions'[Order Date])
)`}
            </pre>
            <p className="text-[11px] text-slate-400 pt-1">
              Marked as Date Table in Power BI Modeling view to enable continuous time intelligence calculations without date gaps.
            </p>
          </div>

          {/* Star Schema Relationship Diagram */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <GitFork className="w-4 h-4" />
              <span>Star Schema Relationship</span>
            </div>

            <div className="my-3 flex items-center justify-center gap-4 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-center">
                <div className="text-white font-bold">DateTable</div>
                <div className="text-[10px] text-cyan-400">[Date] (1)</div>
              </div>

              <div className="flex items-center text-slate-500 font-sans text-xs">
                <span>1 ──► *</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-center">
                <div className="text-white font-bold">Raw_Transactions</div>
                <div className="text-[10px] text-amber-400">[Order Date] (*)</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 text-center">
              Active One-to-Many (1:*) Single Direction Filter Relationship
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
