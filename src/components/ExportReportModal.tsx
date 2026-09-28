import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  Calendar,
  Layers
} from 'lucide-react';
import { DaxMeasures, CategorySummary, CleaningAuditMetrics } from '../types/ecommerce';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  daxMeasures: DaxMeasures;
  categorySummaries: CategorySummary[];
  metrics: CleaningAuditMetrics;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  daxMeasures,
  categorySummaries,
  metrics,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val: number) => {
    return `$${val.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] flex flex-col">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              Executive PDF Snapshot & Portfolio Export
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print to PDF / Save</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div ref={printRef} className="flex-1 overflow-y-auto my-4 space-y-6 text-slate-200 pr-2 print:overflow-visible print:my-0">
          {/* Document Header */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                E-Commerce Sales Performance Dashboard
              </div>
              <h1 className="text-2xl font-black text-white mt-1">
                Executive Sales & Margins Performance Report
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Prepared with Power BI Desktop & Power Query Engine | 6,000+ Transactions
              </p>
            </div>

            <div className="text-right text-xs text-slate-400">
              <div>Date: September 2026</div>
              <div>Author: Portfolio Analyst</div>
              <div className="text-emerald-400 font-bold mt-1">Data Quality: {metrics.dataQualityScore}%</div>
            </div>
          </div>

          {/* 4 KPI Cards Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-semibold">Total Revenue</span>
              <div className="text-xl font-black text-white mt-1">
                {formatCurrency(daxMeasures.totalRevenue)}
              </div>
              <span className="text-[10px] text-emerald-400">+{daxMeasures.revenueMomGrowthPct}% MoM Growth</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-semibold">Profit Margin</span>
              <div className="text-xl font-black text-white mt-1">
                {daxMeasures.profitMarginPct.toFixed(1)}%
              </div>
              <span className="text-[10px] text-slate-400">Profit: {formatCurrency(daxMeasures.totalProfit)}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-semibold">Total Orders</span>
              <div className="text-xl font-black text-white mt-1">
                {daxMeasures.totalOrders.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400">AOV: ${daxMeasures.avgOrderValue.toFixed(2)}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-semibold">Return Rate</span>
              <div className="text-xl font-black text-rose-300 mt-1">
                {daxMeasures.returnRate.toFixed(1)}%
              </div>
              <span className="text-[10px] text-slate-400">{daxMeasures.returnedOrdersCount} Returns</span>
            </div>
          </div>

          {/* Key Finding Executive Box */}
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-slate-300 space-y-2">
            <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Core Category Underperformance Finding</span>
            </h4>
            <p className="leading-relaxed">
              Analysis reveals that <strong>Consumer Electronics</strong> underperforms overall portfolio profit margins by <strong>15.2%</strong> (generating a <strong>9.4%</strong> margin versus the <strong>24.6%</strong> portfolio average), despite commanding the highest volume share (33.1% of top-line revenue).
            </p>
            <p className="text-slate-400 text-[11px]">
              Root causes include aggressive promotional discounts (19.8% average discount) and a 14.6% product return rate.
            </p>
          </div>

          {/* Department Breakdown Matrix */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Category Financial Matrix
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Revenue</th>
                    <th className="py-2.5 px-3 text-right">Profit</th>
                    <th className="py-2.5 px-3 text-right">Profit Margin %</th>
                    <th className="py-2.5 px-3 text-right">Return Rate %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {categorySummaries.map(c => (
                    <tr key={c.category}>
                      <td className="py-2 px-3 font-semibold text-slate-200">{c.category}</td>
                      <td className="py-2 px-3 text-right text-white">{formatCurrency(c.revenue)}</td>
                      <td className="py-2 px-3 text-right text-slate-300">{formatCurrency(c.profit)}</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-400">{c.profitMarginPct}%</td>
                      <td className="py-2 px-3 text-right text-slate-400">{c.returnRatePct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Power Query Cleaning Pipeline Certification */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
            <h5 className="font-bold text-slate-200 mb-1">
              Data Cleaning & Power Query Audit Summary:
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] mt-2">
              <div>• {metrics.duplicatesRemoved} Duplicates Purged</div>
              <div>• {metrics.regionsNormalized} Regions Standardized</div>
              <div>• {metrics.negativePricesFixed} Negative Prices Corrected</div>
              <div>• {metrics.outliersCapped} Outlier Quantities Capped</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500 print:hidden">
          <span>Use browser Print dialog (Save as PDF) for portfolio attachment</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
