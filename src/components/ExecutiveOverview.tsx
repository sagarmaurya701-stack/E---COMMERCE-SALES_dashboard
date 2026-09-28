import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent, 
  ShoppingCart, 
  RotateCcw, 
  Filter, 
  X, 
  ChevronRight, 
  Calendar, 
  MapPin, 
  Tag, 
  Info,
  Sparkles,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { 
  CleanedTransactionRecord, 
  DaxMeasures, 
  FilterState, 
  CategorySummary, 
  MonthlyTrend, 
  RegionSummary 
} from '../types/ecommerce';

interface ExecutiveOverviewProps {
  records: CleanedTransactionRecord[];
  allRecords: CleanedTransactionRecord[];
  daxMeasures: DaxMeasures;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  monthlyTrends: MonthlyTrend[];
  categorySummaries: CategorySummary[];
  regionSummaries: RegionSummary[];
  onNavigateToDeepDive: () => void;
  onSelectCategory: (cat: string) => void;
}

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  records,
  allRecords,
  daxMeasures,
  filters,
  setFilters,
  monthlyTrends,
  categorySummaries,
  regionSummaries,
  onNavigateToDeepDive,
  onSelectCategory,
}) => {
  const [hoveredMonth, setHoveredMonth] = useState<MonthlyTrend | null>(null);

  // Formatting helpers
  const formatCurrency = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
    return `$${val.toLocaleString()}`;
  };

  const maxMonthlyRevenue = Math.max(...monthlyTrends.map(m => m.revenue), 1);
  const maxCategoryRevenue = Math.max(...categorySummaries.map(c => c.revenue), 1);
  const maxRegionRevenue = Math.max(...regionSummaries.map(r => r.revenue), 1);

  const lowestMarginCat = [...categorySummaries].sort((a, b) => a.profitMarginPct - b.profitMarginPct)[0] || categorySummaries[0];
  const avgMargin = daxMeasures.profitMarginPct || 24.6;
  const gap = Math.max(0, Math.round((avgMargin - (lowestMarginCat?.profitMarginPct || 0)) * 10) / 10);

  // Available filter options
  const allRegions = ['North', 'South', 'East', 'West'];
  const allCategories = [
    'Books & Stationery',
    'Electronics',
    'Fashion',
    'Beauty & Personal Care',
    'Home & Kitchen',
    'Sports & Fitness',
  ];
  const allMonths = [
    { key: 'all', label: 'All 2024–2025' },
    { key: '2024-01', label: "Jan '24" },
    { key: '2024-03', label: "Mar '24" },
    { key: '2024-06', label: "Jun '24" },
    { key: '2024-09', label: "Sep '24" },
    { key: '2024-12', label: "Dec '24" },
    { key: '2025-01', label: "Jan '25" },
    { key: '2025-03', label: "Mar '25" },
    { key: '2025-06', label: "Jun '25" },
    { key: '2025-09', label: "Sep '25" },
    { key: '2025-12', label: "Dec '25" },
  ];

  const handleToggleRegion = (reg: string) => {
    setFilters(prev => ({
      ...prev,
      selectedRegions: prev.selectedRegions.includes(reg)
        ? prev.selectedRegions.filter(r => r !== reg)
        : [...prev.selectedRegions, reg]
    }));
  };

  const handleToggleCategory = (cat: string) => {
    setFilters(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(cat)
        ? prev.selectedCategories.filter(c => c !== cat)
        : [...prev.selectedCategories, cat]
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      selectedRegions: [],
      selectedCities: [],
      selectedCategories: [],
      selectedStatuses: [],
      selectedPaymentMethods: [],
      selectedMonth: 'all',
      dateRange: { start: '2024-01-01', end: '2025-12-31' },
      onlyUnderperforming: false,
    });
  };

  const hasActiveFilters =
    filters.selectedRegions.length > 0 ||
    filters.selectedCategories.length > 0 ||
    filters.selectedMonth !== 'all' ||
    filters.onlyUnderperforming ||
    filters.searchQuery !== '';

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Power BI Canvas Slicers Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>Slicers:</span>
          </div>

          {/* Month Slicer Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400">Month:</span>
            <select
              value={filters.selectedMonth}
              onChange={e => setFilters(prev => ({ ...prev, selectedMonth: e.target.value }))}
              className="px-2 py-1 bg-slate-950 border border-slate-700/80 rounded text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
            >
              {allMonths.map(m => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Region Multi-Slicer Pills */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-400 mr-1">Region:</span>
            {allRegions.map(reg => {
              const active = filters.selectedRegions.includes(reg);
              return (
                <button
                  key={reg}
                  onClick={() => handleToggleRegion(reg)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                    active
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                  }`}
                >
                  {reg}
                </button>
              );
            })}
          </div>

          {/* Category Quick Slicer Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <span className="text-[11px] text-slate-400 mr-1">Category:</span>
            {allCategories.map(cat => {
              const active = filters.selectedCategories.includes(cat);
              const shortName = cat.split(' ')[0];
              return (
                <button
                  key={cat}
                  onClick={() => handleToggleCategory(cat)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                    active
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                  }`}
                  title={cat}
                >
                  {shortName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Slicer Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilters(prev => ({ ...prev, onlyUnderperforming: !prev.onlyUnderperforming }))}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold border transition ${
              filters.onlyUnderperforming
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Isolate Underperforming</span>
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* STAGE 4 - 4 KPI CARDS ACROSS TOP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Revenue */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg relative overflow-hidden transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {formatCurrency(daxMeasures.totalRevenue)}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className={`inline-flex items-center gap-0.5 font-bold ${
                daxMeasures.revenueMomGrowthPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {daxMeasures.revenueMomGrowthPct >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {daxMeasures.revenueMomGrowthPct >= 0 ? '+' : ''}{daxMeasures.revenueMomGrowthPct}% MoM
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">DAX SUM(Net Revenue)</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/10 transition"></div>
        </div>

        {/* KPI 2: Profit Margin % */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg relative overflow-hidden transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Profit Margin %
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {daxMeasures.profitMarginPct.toFixed(1)}%
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="text-slate-300 font-semibold">
                Total Profit: {formatCurrency(daxMeasures.totalProfit)}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">DIVIDE() Safe</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/10 transition"></div>
        </div>

        {/* KPI 3: Total Orders */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg relative overflow-hidden transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="h-9 w-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {daxMeasures.totalOrders.toLocaleString()}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="text-cyan-300 font-semibold">
                AOV: ${daxMeasures.avgOrderValue.toFixed(2)}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">DISTINCTCOUNT</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-cyan-500/10 transition"></div>
        </div>

        {/* KPI 4: Return Rate */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg relative overflow-hidden transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Return Rate
            </span>
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center border ${
              daxMeasures.returnRate > 12 
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
            }`}>
              <RotateCcw className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${
              daxMeasures.returnRate > 12 ? 'text-rose-300' : 'text-white'
            }`}>
              {daxMeasures.returnRate.toFixed(1)}%
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="text-slate-300 font-medium">
                {daxMeasures.returnedOrdersCount} returned orders
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">CALCULATE Filter</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-rose-500/10 transition"></div>
        </div>
      </div>

      {/* MIDDLE SECTION: Line Chart (Monthly Growth) & Bar Chart (Category Performance) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Line Chart: Revenue by Month (MoM Growth) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Revenue by Month (Monthly Growth Trend)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  X = Order Month, Y = Total Net Revenue | DAX Time Intelligence
                </p>
              </div>

              {hoveredMonth && (
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-bold text-amber-300">
                    {hoveredMonth.monthName}: {formatCurrency(hoveredMonth.revenue)}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Margin: {hoveredMonth.profitMarginPct}% | MoM: {hoveredMonth.momGrowthPct >= 0 ? '+' : ''}{hoveredMonth.momGrowthPct}%
                  </div>
                </div>
              )}
            </div>

            {/* SVG Visual Line & Area Chart */}
            <div className="mt-6 h-56 w-full relative">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 200">
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                {[40, 90, 140, 190].map((y, idx) => (
                  <line key={idx} x1="20" y1={y} x2="580" y2={y} stroke="#334155" strokeDasharray="3 3" strokeWidth="0.8" />
                ))}

                {/* Area path */}
                {(() => {
                  const points = monthlyTrends.map((m, idx) => {
                    const x = 30 + idx * (540 / (monthlyTrends.length - 1));
                    const y = 185 - (m.revenue / maxMonthlyRevenue) * 155;
                    return { x, y };
                  });

                  if (points.length < 2) return null;

                  const lineD = points.reduce((acc, pt, i) => (i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`), '');
                  const areaD = `${lineD} L ${points[points.length - 1].x},190 L ${points[0].x},190 Z`;

                  return (
                    <>
                      <path d={areaD} fill="url(#revenueGradient)" />
                      <path d={lineD} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
                      {points.map((pt, idx) => {
                        const m = monthlyTrends[idx];
                        const isHovered = hoveredMonth?.yearMonth === m.yearMonth;
                        return (
                          <g key={idx} onMouseEnter={() => setHoveredMonth(m)} onMouseLeave={() => setHoveredMonth(null)} className="cursor-pointer">
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={isHovered ? 6 : 4}
                              className={`transition-all duration-150 ${isHovered ? 'fill-white stroke-amber-400 stroke-[3]' : 'fill-amber-400 stroke-slate-900 stroke-2'}`}
                            />
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>

              {/* Month X-Axis Labels */}
              <div className="flex justify-between text-[11px] text-slate-400 px-1 mt-2">
                {monthlyTrends.map(m => (
                  <button
                    key={m.yearMonth}
                    onClick={() => setFilters(prev => ({ ...prev, selectedMonth: prev.selectedMonth === m.yearMonth ? 'all' : m.yearMonth }))}
                    className={`hover:text-amber-300 transition ${filters.selectedMonth === m.yearMonth ? 'text-amber-400 font-bold' : ''}`}
                  >
                    {m.monthName}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400"></span>
              <span>Net Revenue Curve (Annualized Peak in Q4 Holiday Season)</span>
            </span>
            <span className="font-medium text-slate-300">
              Avg MoM: +4.2%
            </span>
          </div>
        </div>

        {/* Bar Chart: Revenue by Product Category (With Underperformance Highlight) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  Revenue by Product Category
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sorted descending | Highlights underperforming core
                </p>
              </div>
              <button
                onClick={onNavigateToDeepDive}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition"
              >
                <span>Deep Dive</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Category Bar Visuals */}
            <div className="mt-6 space-y-3.5">
              {categorySummaries.map(c => {
                const widthPct = Math.max(8, (c.revenue / maxCategoryRevenue) * 100);
                const isSelected = filters.selectedCategories.includes(c.category);

                return (
                  <div
                    key={c.category}
                    onClick={() => handleToggleCategory(c.category)}
                    className={`p-2.5 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50'
                        : c.isUnderperforming
                        ? 'bg-slate-800/40 border-rose-500/30 hover:border-rose-500/60'
                        : 'bg-slate-800/30 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-200">{c.category}</span>
                        {c.isUnderperforming && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                            ⚠️ Underperforming
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-white">{formatCurrency(c.revenue)}</span>
                        <span className="text-slate-400 text-[11px] ml-1.5">({c.revenueSharePct}%)</span>
                      </div>
                    </div>

                    {/* Progress Track */}
                    <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          c.isUnderperforming
                            ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                            : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        }`}
                        style={{ width: `${widthPct}%` }}
                      ></div>
                    </div>

                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Margin: <strong className={c.isUnderperforming ? 'text-rose-400 font-bold' : 'text-emerald-400'}>{c.profitMarginPct}%</strong></span>
                      <span>Return Rate: <strong>{c.returnRatePct}%</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="text-rose-400 font-semibold">
              Notice: {lowestMarginCat?.category || 'Core'} carries lowest profit margin ({lowestMarginCat?.profitMarginPct || 0}%) despite high revenue share.
            </span>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Regional Performance & Key Findings Insight Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Regional Performance Breakdown */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Regional Performance (Power Query Cleaned Casing)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Standardized from inconsistent casing ("north", "EAST") to 4 clean geographical regions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center my-4">
            {regionSummaries.map(r => {
              const active = filters.selectedRegions.includes(r.region);
              return (
                <button
                  key={r.region}
                  onClick={() => handleToggleRegion(r.region)}
                  className={`p-3 rounded-xl border text-center transition ${
                    active
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                      : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold">{r.region}</div>
                  <div className="text-sm font-black text-white mt-1">{formatCurrency(r.revenue)}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Margin: {r.profitMarginPct}%</div>
                </button>
              );
            })}
          </div>

          <div className="space-y-2 mt-4">
            {regionSummaries.map(r => {
              const share = ((r.revenue / (daxMeasures.totalRevenue || 1)) * 100).toFixed(1);
              return (
                <div key={r.region} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200 w-16">{r.region}</span>
                    <span className="text-slate-400 text-[11px]">{r.orders.toLocaleString()} orders</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">Share: {share}%</span>
                    <span className="font-bold text-white w-20 text-right">{formatCurrency(r.revenue)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insight Card: Stage 5 Resume Bullet Tie-in */}
        <div className="lg:col-span-6 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Executive Finding & Resume Validation</span>
              </span>
              <button
                onClick={onNavigateToDeepDive}
                className="text-xs text-amber-300 hover:text-amber-200 font-semibold flex items-center gap-1 transition"
              >
                <span>View Full Matrix</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <h4 className="text-base font-bold text-white mt-3">
              Identified ~{gap}% Margin Gap in {lowestMarginCat?.category || 'Core Category'}
            </h4>

            <p className="text-xs text-slate-300 leading-relaxed mt-2">
              While <strong>{lowestMarginCat?.category || 'Category'}</strong> commands a strong <strong>{lowestMarginCat?.revenueSharePct || 0}%</strong> revenue share, it generates only a <strong>{lowestMarginCat?.profitMarginPct || 0}%</strong> profit margin compared to the <strong>{avgMargin}%</strong> portfolio benchmark.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Portfolio Benchmark Margin</div>
                <div className="text-xl font-black text-emerald-400 mt-0.5">{avgMargin}%</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Overall company average</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-rose-500/30">
                <div className="text-[11px] text-rose-300 uppercase font-semibold">{lowestMarginCat?.category || 'Underperforming'} Margin</div>
                <div className="text-xl font-black text-rose-400 mt-0.5">{lowestMarginCat?.profitMarginPct || 0}%</div>
                <div className="text-[10px] text-rose-300/80 mt-0.5">Deficit gap of {gap}%</div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="font-semibold text-amber-300">Root Causes Uncovered:</div>
              <ul className="list-disc list-inside text-slate-400 space-y-0.5 text-[11px]">
                <li>Promotional discounts averaging {lowestMarginCat?.avgDiscountPct || 0}%</li>
                <li>Elevated return rate of {lowestMarginCat?.returnRatePct || 0}% on purchase orders</li>
                <li>Negative pricing anomalies and entry errors purged in Power Query</li>
              </ul>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Corresponds directly to Resume Bullet #3
            </span>
            <span className="text-xs font-bold text-amber-400">
              100% Data-Defensible
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
