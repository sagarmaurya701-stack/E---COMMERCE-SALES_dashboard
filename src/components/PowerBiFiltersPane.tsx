import React from 'react';
import { 
  Filter, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Check, 
  Search,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { FilterState } from '../types/ecommerce';

interface PowerBiFiltersPaneProps {
  isOpen: boolean;
  onToggle: () => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalRecordsCount: number;
  filteredRecordsCount: number;
}

export const PowerBiFiltersPane: React.FC<PowerBiFiltersPaneProps> = ({
  isOpen,
  onToggle,
  filters,
  setFilters,
  totalRecordsCount,
  filteredRecordsCount,
}) => {
  const allRegions = ['North', 'South', 'East', 'West'];
  const allCategories = [
    'Books & Stationery',
    'Electronics',
    'Fashion',
    'Beauty & Personal Care',
    'Home & Kitchen',
    'Sports & Fitness',
  ];
  const allStatuses = ['Delivered', 'Returned', 'Cancelled'];
  const allCities = [
    'Delhi', 'Lucknow', 'Chandigarh', 'Jaipur',
    'Chennai', 'Bengaluru', 'Hyderabad', 'Kochi',
    'Kolkata', 'Patna', 'Guwahati', 'Bhubaneswar',
    'Mumbai', 'Pune', 'Surat', 'Ahmedabad'
  ];

  const handleToggleRegion = (reg: string) => {
    setFilters(prev => ({
      ...prev,
      selectedRegions: prev.selectedRegions.includes(reg)
        ? prev.selectedRegions.filter(r => r !== reg)
        : [...prev.selectedRegions, reg]
    }));
  };

  const handleToggleCity = (city: string) => {
    setFilters(prev => ({
      ...prev,
      selectedCities: prev.selectedCities?.includes(city)
        ? prev.selectedCities.filter(c => c !== city)
        : [...(prev.selectedCities || []), city]
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

  const handleToggleStatus = (st: string) => {
    setFilters(prev => ({
      ...prev,
      selectedStatuses: prev.selectedStatuses.includes(st)
        ? prev.selectedStatuses.filter(s => s !== st)
        : [...prev.selectedStatuses, st]
    }));
  };

  const handleClearAll = () => {
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

  const hasFilters =
    filters.selectedRegions.length > 0 ||
    (filters.selectedCities && filters.selectedCities.length > 0) ||
    filters.selectedCategories.length > 0 ||
    filters.selectedStatuses.length > 0 ||
    filters.selectedMonth !== 'all' ||
    filters.onlyUnderperforming ||
    filters.searchQuery !== '';

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-slate-900 border-l border-y border-slate-700/80 p-2 rounded-l-xl text-slate-300 hover:text-amber-400 hover:bg-slate-800 shadow-xl transition flex flex-col items-center gap-1.5"
        title="Expand Power BI Filters Pane"
      >
        <Filter className="w-4 h-4 text-amber-400" />
        <span className="text-[10px] font-bold uppercase tracking-widest [writing-mode:vertical-lr]">
          Filters
        </span>
        {hasFilters && (
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
        )}
      </button>
    );
  }

  return (
    <aside className="w-72 bg-slate-900 border-l border-slate-800 flex flex-col h-full shrink-0 shadow-2xl z-30 transition-all select-none">
      {/* Pane Header */}
      <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Filters on this page
          </span>
        </div>

        <div className="flex items-center gap-1">
          {hasFilters && (
            <button
              onClick={handleClearAll}
              className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition"
              title="Clear all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onToggle}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
            title="Collapse Filters Pane"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Filter Status & Count */}
      <div className="px-3 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>Filtered Data:</span>
        <span className="font-mono font-bold text-amber-300">
          {filteredRecordsCount.toLocaleString()} / {totalRecordsCount.toLocaleString()} rows
        </span>
      </div>

      {/* Filter Cards Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
        {/* Quick Search */}
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Search Visual Records
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Search product, ID, city..."
              className="w-full pl-7 pr-2 py-1 bg-slate-900 border border-slate-700/80 rounded text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Region Filter Card */}
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Region ({filters.selectedRegions.length || 'All'})
            </span>
            {filters.selectedRegions.length > 0 && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, selectedRegions: [] }))}
                className="text-[10px] text-slate-400 hover:text-rose-400"
              >
                Clear
              </button>
            )}
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
            {allRegions.map(reg => {
              const checked = filters.selectedRegions.includes(reg);
              return (
                <label
                  key={reg}
                  className="flex items-center gap-2 p-1 rounded hover:bg-slate-900 cursor-pointer text-slate-300 hover:text-white"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleRegion(reg)}
                    className="h-3.5 w-3.5 accent-amber-500 rounded"
                  />
                  <span className="text-[11px]">{reg}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Product Category Filter Card */}
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Category ({filters.selectedCategories.length || 'All'})
            </span>
            {filters.selectedCategories.length > 0 && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, selectedCategories: [] }))}
                className="text-[10px] text-slate-400 hover:text-rose-400"
              >
                Clear
              </button>
            )}
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
            {allCategories.map(cat => {
              const checked = filters.selectedCategories.includes(cat);
              return (
                <label
                  key={cat}
                  className="flex items-center gap-2 p-1 rounded hover:bg-slate-900 cursor-pointer text-slate-300 hover:text-white"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleCategory(cat)}
                    className="h-3.5 w-3.5 accent-amber-500 rounded"
                  />
                  <span className="text-[11px] truncate" title={cat}>{cat}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Order Status Filter Card */}
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Order Status ({filters.selectedStatuses.length || 'All'})
            </span>
            {filters.selectedStatuses.length > 0 && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, selectedStatuses: [] }))}
                className="text-[10px] text-slate-400 hover:text-rose-400"
              >
                Clear
              </button>
            )}
          </div>
          <div className="space-y-1">
            {allStatuses.map(st => {
              const checked = filters.selectedStatuses.includes(st);
              return (
                <label
                  key={st}
                  className="flex items-center gap-2 p-1 rounded hover:bg-slate-900 cursor-pointer text-slate-300 hover:text-white"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleStatus(st)}
                    className="h-3.5 w-3.5 accent-amber-500 rounded"
                  />
                  <span className="text-[11px]">{st}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* City Filter Card */}
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              City ({(filters.selectedCities && filters.selectedCities.length) || 'All'})
            </span>
            {filters.selectedCities && filters.selectedCities.length > 0 && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, selectedCities: [] }))}
                className="text-[10px] text-slate-400 hover:text-rose-400"
              >
                Clear
              </button>
            )}
          </div>
          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
            {allCities.map(city => {
              const checked = filters.selectedCities?.includes(city) || false;
              return (
                <label
                  key={city}
                  className="flex items-center gap-2 p-1 rounded hover:bg-slate-900 cursor-pointer text-slate-300 hover:text-white"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleCity(city)}
                    className="h-3.5 w-3.5 accent-amber-500 rounded"
                  />
                  <span className="text-[11px]">{city}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};
