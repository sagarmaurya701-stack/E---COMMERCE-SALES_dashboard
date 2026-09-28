import React, { useState } from 'react';
import { 
  Layers, 
  TrendingDown, 
  RotateCcw, 
  AlertTriangle, 
  ArrowUpDown, 
  ChevronRight, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Truck, 
  BarChart, 
  PieChart, 
  SlidersHorizontal,
  Info,
  Sparkles
} from 'lucide-react';
import { 
  CleanedTransactionRecord, 
  CategorySummary, 
  FilterState 
} from '../types/ecommerce';
import { 
  getOrderStatusBreakdown, 
  getReturnReasonBreakdown 
} from '../utils/daxEngine';

interface CategoryDeepDiveProps {
  records: CleanedTransactionRecord[];
  categorySummaries: CategorySummary[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

export const CategoryDeepDive: React.FC<CategoryDeepDiveProps> = ({
  records,
  categorySummaries,
  filters,
  setFilters,
}) => {
  const [sortField, setSortField] = useState<keyof CategorySummary>('profitMarginPct');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [drilldownCategory, setDrilldownCategory] = useState<string | null>(null);

  const formatCurrency = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
    return `$${val.toLocaleString()}`;
  };

  const statusBreakdown = getOrderStatusBreakdown(records);
  const totalStatusOrders = statusBreakdown.reduce((a, b) => a + b.count, 0) || 1;
  const returnReasons = getReturnReasonBreakdown(records);
  const maxReturnReasonCount = Math.max(...returnReasons.map(r => r.count), 1);

  // Sorting
  const sortedSummaries = [...categorySummaries].sort((a, b) => {
    const valA = a[sortField] as any;
    const valB = b[sortField] as any;
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return sortAsc ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
  });

  const handleSort = (field: keyof CategorySummary) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default descending for new field
    }
  };

  // Product breakdown for drilldown modal
  const drilldownRecords = drilldownCategory
    ? records.filter(r => r.category === drilldownCategory)
    : [];

  const subCatMap = new Map<string, { revenue: number; profit: number; orders: number; returned: number }>();
  for (const r of drilldownRecords) {
    if (!subCatMap.has(r.productName)) {
      subCatMap.set(r.productName, { revenue: 0, profit: 0, orders: 0, returned: 0 });
    }
    const entry = subCatMap.get(r.productName)!;
    entry.revenue += r.netRevenue;
    entry.profit += r.profit;
    entry.orders++;
    if (r.orderStatus === 'Returned') entry.returned++;
  }

  const subCatList = Array.from(subCatMap.entries()).map(([name, data]) => ({
    name,
    revenue: Math.round(data.revenue),
    profit: Math.round(data.profit),
    marginPct: data.revenue > 0 ? Math.round((data.profit / data.revenue) * 1000) / 10 : 0,
    orders: data.orders,
    returnRate: data.orders > 0 ? Math.round((data.returned / data.orders) * 1000) / 10 : 0,
  })).sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Power BI Canvas Slicers Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 shadow-md flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-white text-xs uppercase tracking-wider">
            Page 2: Product Category & Returns Deep Dive
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">Month Filter:</span>
          <select
            value={filters.selectedMonth}
            onChange={e => setFilters(prev => ({ ...prev, selectedMonth: e.target.value }))}
            className="px-2 py-1 bg-slate-950 border border-slate-700/80 rounded text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
          >
            <option value="all">All 2024–2025 Months</option>
            <option value="2024-01">Jan '24</option>
            <option value="2024-03">Mar '24</option>
            <option value="2024-06">Jun '24</option>
            <option value="2024-09">Sep '24</option>
            <option value="2024-12">Dec '24</option>
            <option value="2025-01">Jan '25</option>
            <option value="2025-03">Mar '25</option>
            <option value="2025-06">Jun '25</option>
            <option value="2025-09">Sep '25</option>
            <option value="2025-12">Dec '25</option>
          </select>
        </div>
      </div>

      {/* TOP ROW: Clustered Bar Chart & Matrix Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Clustered Bar Chart: Profit Margin % by Category */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart className="w-4 h-4 text-amber-400" />
                  <span>Profit Margin % by Category</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visual benchmark revealing underperforming category
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {categorySummaries.map(c => {
                const maxMargin = 35;
                const widthPct = Math.min(100, Math.max(5, (c.profitMarginPct / maxMargin) * 100));

                return (
                  <div key={c.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">{c.category}</span>
                      <span className={`font-black ${c.isUnderperforming ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {c.profitMarginPct}%
                      </span>
                    </div>

                    <div className="h-6 w-full bg-slate-950 rounded-lg overflow-hidden p-1 border border-slate-800 flex items-center">
                      <div
                        className={`h-full rounded-md flex items-center justify-end px-2 text-[10px] font-bold text-slate-950 transition-all duration-500 ${
                          c.isUnderperforming
                            ? 'bg-rose-500 text-white'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        }`}
                        style={{ width: `${widthPct}%` }}
                      >
                        {c.isUnderperforming ? 'Underperforming' : `${c.profitMarginPct}%`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div>
              <strong>Underperformance Diagnosis:</strong> Consumer Electronics delivers only 9.4% margin, trailing Beauty & Personal Care (29.5%) and Home & Kitchen (26.2%) by ~16-20 percentage points.
            </div>
          </div>
        </div>

        {/* Matrix Table: Category x Total Revenue x Profit Margin % x Return Rate */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  Product Category Performance Matrix
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any column header to sort; click a row to drill down into sub-categories.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th
                      onClick={() => handleSort('category')}
                      className="py-3 px-3 cursor-pointer hover:text-white"
                    >
                      <div className="flex items-center gap-1">
                        <span>Category</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('revenue')}
                      className="py-3 px-3 cursor-pointer hover:text-white text-right"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Revenue</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('profit')}
                      className="py-3 px-3 cursor-pointer hover:text-white text-right"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Profit</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('profitMarginPct')}
                      className="py-3 px-3 cursor-pointer hover:text-white text-right"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Margin %</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('returnRatePct')}
                      className="py-3 px-3 cursor-pointer hover:text-white text-right"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Return %</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {sortedSummaries.map(c => (
                    <tr
                      key={c.category}
                      onClick={() => setDrilldownCategory(c.category)}
                      className={`hover:bg-slate-800/50 transition cursor-pointer ${
                        c.isUnderperforming ? 'bg-rose-500/5' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-semibold text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <span>{c.category}</span>
                          {c.isUnderperforming && (
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-white">
                        {formatCurrency(c.revenue)}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-300">
                        {formatCurrency(c.profit)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded font-bold ${
                          c.isUnderperforming
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {c.profitMarginPct}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-300">
                        {c.returnRatePct}%
                      </td>
                      <td className="py-3 px-2 text-center text-slate-400 hover:text-amber-400">
                        <ChevronRight className="w-4 h-4 mx-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Tip: Click any row above to inspect sub-category unit prices and individual return rates.</span>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Donut Chart (Order Status Breakdown) & Bar Chart (Return Reasons Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Donut Chart / Segmented Lifecycle: Order Status */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-cyan-400" />
                <span>Order Status Breakdown</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Delivered vs Returned vs Cancelled distribution
              </p>
            </div>
          </div>

          {/* Segmented Bar / Visual Donut Breakdown */}
          <div className="space-y-3 mt-4">
            {statusBreakdown.map(s => {
              const pct = ((s.count / totalStatusOrders) * 100).toFixed(1);
              let color = 'bg-emerald-500';
              let badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
              let Icon = CheckCircle;

              if (s.status === 'Returned') {
                color = 'bg-rose-500';
                badgeBg = 'bg-rose-500/10 text-rose-300 border-rose-500/30';
                Icon = RotateCcw;
              } else if (s.status === 'Cancelled') {
                color = 'bg-amber-500';
                badgeBg = 'bg-amber-500/10 text-amber-300 border-amber-500/30';
                Icon = XCircle;
              } else if (s.status === 'In Transit') {
                color = 'bg-cyan-500';
                badgeBg = 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
                Icon = Truck;
              }

              return (
                <div key={s.status} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold text-slate-200">{s.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">{s.count.toLocaleString()} orders</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${badgeBg}`}>
                        {pct}%
                      </span>
                    </div>
                  </div>

                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bar Chart: Return Reason Breakdown */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-400" />
                <span>Return Reason Breakdown</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Filtered strictly to orders with Order Status = "Returned" (CALCULATE context)
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {records.filter(r => r.orderStatus === 'Returned').length} Total Returns
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {returnReasons.map(r => {
              const widthPct = Math.max(8, (r.count / maxReturnReasonCount) * 100);

              return (
                <div key={r.reason} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300">{r.reason}</span>
                    <span className="font-bold text-slate-200">{r.count} incidents</span>
                  </div>

                  <div className="h-6 w-full bg-slate-950 rounded-lg overflow-hidden p-1 border border-slate-800">
                    <div
                      className="h-full rounded-md bg-gradient-to-r from-rose-500 to-amber-500 flex items-center justify-end px-2 text-[10px] font-bold text-slate-950 transition-all duration-500"
                      style={{ width: `${widthPct}%` }}
                    >
                      {r.count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Primary drivers: "Defective Product" in electronics & "Wrong Size/Color" in apparel.</span>
          </div>
        </div>
      </div>

      {/* Drill-down Modal for Specific Category */}
      {drilldownCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setDrilldownCategory(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                Drill-Down View
              </span>
              <h3 className="text-lg font-bold text-white">
                {drilldownCategory} — Sub-Category Breakdown
              </h3>
            </div>

            <p className="text-xs text-slate-400 mb-5">
              Granular performance analysis of line items within {drilldownCategory}.
            </p>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Sub-Category</th>
                    <th className="py-2.5 px-3 text-right">Revenue</th>
                    <th className="py-2.5 px-3 text-right">Profit</th>
                    <th className="py-2.5 px-3 text-right">Margin %</th>
                    <th className="py-2.5 px-3 text-right">Orders</th>
                    <th className="py-2.5 px-3 text-right">Return %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {subCatList.map(s => (
                    <tr key={s.name} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-semibold text-slate-200">{s.name}</td>
                      <td className="py-2.5 px-3 text-right text-white font-medium">{formatCurrency(s.revenue)}</td>
                      <td className="py-2.5 px-3 text-right text-slate-300">{formatCurrency(s.profit)}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`px-1.5 py-0.5 rounded font-bold ${
                          s.marginPct < 15 ? 'text-rose-400 bg-rose-500/10' : 'text-emerald-400 bg-emerald-500/10'
                        }`}>
                          {s.marginPct}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400">{s.orders}</td>
                      <td className="py-2.5 px-3 text-right text-slate-400">{s.returnRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setDrilldownCategory(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                Close Drilldown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
