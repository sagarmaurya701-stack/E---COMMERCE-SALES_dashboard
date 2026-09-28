import React, { useState } from 'react';
import { 
  Database, 
  Check, 
  Sparkles, 
  Copy, 
  Download, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sliders, 
  Code, 
  Table, 
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { 
  RawTransactionRecord, 
  CleanedTransactionRecord, 
  CleaningPipelineConfig, 
  CleaningAuditMetrics 
} from '../types/ecommerce';
import { 
  generatePowerQueryMCode, 
  convertToCSV 
} from '../utils/powerQueryEngine';

interface PowerQueryStudioProps {
  rawRecords: RawTransactionRecord[];
  cleanedRecords: CleanedTransactionRecord[];
  pipelineConfig: CleaningPipelineConfig;
  setPipelineConfig: React.Dispatch<React.SetStateAction<CleaningPipelineConfig>>;
  metrics: CleaningAuditMetrics;
  onApplyPipeline: () => void;
}

export const PowerQueryStudio: React.FC<PowerQueryStudioProps> = ({
  rawRecords,
  cleanedRecords,
  pipelineConfig,
  setPipelineConfig,
  metrics,
  onApplyPipeline,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'pipeline' | 'rawdata' | 'mcode'>('pipeline');
  const [dataSearch, setDataSearch] = useState('');
  const [anomalyFilter, setAnomalyFilter] = useState<'all' | 'negative' | 'missing' | 'outlier' | 'duplicate'>('all');
  const [page, setPage] = useState(1);
  const [copiedMCode, setCopiedMCode] = useState(false);
  const rowsPerPage = 20;

  // Filter raw records for inspection
  const filteredRaw = rawRecords.filter(r => {
    if (dataSearch.trim()) {
      const q = dataSearch.toLowerCase();
      const match =
        r.orderId.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        r.region.toLowerCase().includes(q) ||
        r.customerId.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (anomalyFilter === 'negative') {
      return (r.unitPrice || 0) < 0;
    }
    if (anomalyFilter === 'missing') {
      return r.unitPrice === null || r.quantity === null || !r.paymentMethod;
    }
    if (anomalyFilter === 'outlier') {
      return (r.quantity || 0) > 10;
    }
    if (anomalyFilter === 'duplicate') {
      return r.row > 6090; // duplicate append rows
    }
    return true;
  });

  const totalPages = Math.ceil(filteredRaw.length / rowsPerPage) || 1;
  const currentRows = filteredRaw.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleCopyMCode = () => {
    const code = generatePowerQueryMCode();
    navigator.clipboard.writeText(code);
    setCopiedMCode(true);
    setTimeout(() => setCopiedMCode(false), 2000);
  };

  const handleDownloadCleanCSV = () => {
    const csv = convertToCSV(cleanedRecords);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ecommerce_cleaned_transactions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadRawCSV = () => {
    const csv = convertToCSV(rawRecords);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ecommerce_raw_data_messy.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Studio Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                Stage 2 Engine
              </span>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Power Query Data Cleaning Studio
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Interactive replication of Power Query Applied Steps: Deduping, Capitalize Each Word, Median Imputation, Outlier Capping, and Calculated Columns.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleDownloadRawCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition"
              title="Download original messy dataset"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Raw Messy CSV</span>
            </button>

            <button
              onClick={handleDownloadCleanCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition"
              title="Download cleaned Power Query output"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Download Cleaned CSV</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation Strip */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveSubTab('pipeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeSubTab === 'pipeline'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Applied Cleaning Steps ({metrics.duplicatesRemoved + metrics.negativePricesFixed + metrics.missingPricesFilled + metrics.outliersCapped} Fixes)</span>
            </button>

            <button
              onClick={() => setActiveSubTab('rawdata')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeSubTab === 'rawdata'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Raw Dataset Inspector ({rawRecords.length.toLocaleString()} Rows)</span>
            </button>

            <button
              onClick={() => setActiveSubTab('mcode')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeSubTab === 'mcode'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Power Query M-Script</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-slate-400">Scorecard:</span>
            <span className="font-bold text-emerald-400">{metrics.dataQualityScore}% Quality</span>
          </div>
        </div>
      </div>

      {/* VIEW 1: Interactive Applied Steps Pipeline */}
      {activeSubTab === 'pipeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Step Controls */}
          <div className="lg:col-span-7 space-y-3">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-400" />
                  <span>Applied Cleaning Steps (Power Query Ribbon Equivalent)</span>
                </h3>
                <span className="text-xs text-slate-400">Toggle steps to observe impact</span>
              </div>

              <div className="space-y-3">
                {/* Step 1: Remove Duplicates */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">1. Remove Duplicates</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {metrics.duplicatesRemoved} purged
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Table.Distinct across Order ID, Customer ID, Product Name. Fixes artificial order inflation.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={pipelineConfig.removeDuplicates}
                    onChange={e => {
                      setPipelineConfig(prev => ({ ...prev, removeDuplicates: e.target.checked }));
                      onApplyPipeline();
                    }}
                    className="mt-1 h-4 w-4 accent-amber-500 rounded"
                  />
                </div>

                {/* Step 2: Fix Inconsistent Region Casing */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">2. Capitalize Each Word (Region Casing)</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        {metrics.regionsNormalized} normalized
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Transform → Format → Capitalize Each Word ("north" → "North", "EAST" → "East").
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={pipelineConfig.standardizeRegionCasing}
                    onChange={e => {
                      setPipelineConfig(prev => ({ ...prev, standardizeRegionCasing: e.target.checked }));
                      onApplyPipeline();
                    }}
                    className="mt-1 h-4 w-4 accent-amber-500 rounded"
                  />
                </div>

                {/* Step 3: Handle Missing Unit Price */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">3. Missing Unit Price Imputation (Median)</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {metrics.missingPricesFilled} imputed ($49.99 median)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Replaces null values with median unit price instead of dropping orders, protecting revenue totals.
                    </p>
                  </div>
                  <select
                    value={pipelineConfig.handleMissingUnitPrice}
                    onChange={e => {
                      setPipelineConfig(prev => ({ ...prev, handleMissingUnitPrice: e.target.value as any }));
                      onApplyPipeline();
                    }}
                    className="mt-1 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-[11px] text-slate-200"
                  >
                    <option value="median">Replace with Median</option>
                    <option value="filter">Filter Rows Out</option>
                    <option value="none">Leave Null ($0)</option>
                  </select>
                </div>

                {/* Step 4: Fix Negative Prices */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">4. Fix Negative Prices (Absolute Value)</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-500/10 text-rose-300 border border-rose-500/30">
                        {metrics.negativePricesFixed} inverted (Math.abs)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Transform → Number Column → Absolute Value. Corrects entry errors (e.g. -45.0 → 45.0).
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={pipelineConfig.fixNegativePrices}
                    onChange={e => {
                      setPipelineConfig(prev => ({ ...prev, fixNegativePrices: e.target.checked }));
                      onApplyPipeline();
                    }}
                    className="mt-1 h-4 w-4 accent-amber-500 rounded"
                  />
                </div>

                {/* Step 5: Cap Outlier Quantities */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">5. Cap Outlier Quantities</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        {metrics.outliersCapped} bulk orders capped
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Detects extreme wholesale spikes (120, 250, 500) and caps at max retail limit ({pipelineConfig.maxQuantityCap}).
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={5}
                      max={50}
                      value={pipelineConfig.maxQuantityCap}
                      onChange={e => {
                        setPipelineConfig(prev => ({ ...prev, maxQuantityCap: parseInt(e.target.value, 10) || 10 }));
                        onApplyPipeline();
                      }}
                      className="w-14 px-1.5 py-1 bg-slate-900 border border-slate-700 rounded text-center text-xs text-white"
                    />
                    <input
                      type="checkbox"
                      checked={pipelineConfig.capOutlierQuantities}
                      onChange={e => {
                        setPipelineConfig(prev => ({ ...prev, capOutlierQuantities: e.target.checked }));
                        onApplyPipeline();
                      }}
                      className="h-4 w-4 accent-amber-500 rounded"
                    />
                  </div>
                </div>

                {/* Step 6: Standardize Order Date */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">6. Standardize Order Date Column</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {metrics.datesStandardized} parsed to ISO
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Parses mixed DD-MM-YYYY and YYYY-MM-DD text strings into uniform ISO Date objects.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={pipelineConfig.standardizeDates}
                    onChange={e => {
                      setPipelineConfig(prev => ({ ...prev, standardizeDates: e.target.checked }));
                      onApplyPipeline();
                    }}
                    className="mt-1 h-4 w-4 accent-amber-500 rounded"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Audit Metrics & Calculated Columns Summary */}
          <div className="lg:col-span-5 space-y-4">
            {/* Calculated Columns Panel (Step 7 in Guide) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Calculated Columns Created (Step 7)</span>
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="font-mono text-amber-300 font-bold text-[11px]">Net Revenue</div>
                  <div className="text-slate-400 font-mono text-[10px] mt-0.5">
                    (Quantity * Unit Price) * (1 - [Discount %]/100)
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="font-mono text-amber-300 font-bold text-[11px]">Total Cost</div>
                  <div className="text-slate-400 font-mono text-[10px] mt-0.5">
                    Quantity * Cost Price
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="font-mono text-amber-300 font-bold text-[11px]">Profit</div>
                  <div className="text-slate-400 font-mono text-[10px] mt-0.5">
                    [Net Revenue] - [Total Cost]
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="font-mono text-amber-300 font-bold text-[11px]">Profit Margin %</div>
                  <div className="text-slate-400 font-mono text-[10px] mt-0.5">
                    ([Profit] / [Net Revenue]) * 100
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="font-mono text-amber-300 font-bold text-[11px]">Order Month</div>
                  <div className="text-slate-400 font-mono text-[10px] mt-0.5">
                    Date.MonthName([Order Date])
                  </div>
                </div>
              </div>
            </div>

            {/* Quality Comparison Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Pipeline Health Summary
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Raw Input Records:</span>
                  <span className="font-bold text-white">{metrics.rawRowCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Cleaned Output Records:</span>
                  <span className="font-bold text-emerald-400">{metrics.cleanedRowCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Duplicates Removed:</span>
                  <span className="font-bold text-amber-400">{metrics.duplicatesRemoved}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Negative Prices Corrected:</span>
                  <span className="font-bold text-cyan-400">{metrics.negativePricesFixed}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Missing Values Imputed:</span>
                  <span className="font-bold text-slate-200">
                    {metrics.missingPricesFilled + metrics.missingQuantitiesFilled + metrics.missingPaymentsFilled}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Outlier Quantities Capped:</span>
                  <span className="font-bold text-slate-200">{metrics.outliersCapped}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Raw Dataset Inspector Table */}
      {activeSubTab === 'rawdata' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={dataSearch}
                onChange={e => { setDataSearch(e.target.value); setPage(1); }}
                placeholder="Search Order ID, product, region..."
                className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 w-64"
              />

              <select
                value={anomalyFilter}
                onChange={e => { setAnomalyFilter(e.target.value as any); setPage(1); }}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="all">Show All Rows</option>
                <option value="negative">Anomaly: Negative Unit Price (~8)</option>
                <option value="missing">Anomaly: Missing Fields (~75)</option>
                <option value="outlier">Anomaly: Outlier Quantities (&gt;10)</option>
                <option value="duplicate">Anomaly: Duplicated Rows (~65)</option>
              </select>
            </div>

            <div className="text-xs text-slate-400">
              Showing {(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filteredRaw.length)} of {filteredRaw.length} matches
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Row</th>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Order Date</th>
                  <th className="py-2.5 px-3">Region</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Quantity</th>
                  <th className="py-2.5 px-3 text-right">Discount</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {currentRows.map(r => {
                  const isNegPrice = (r.unitPrice || 0) < 0;
                  const isMissingPrice = r.unitPrice === null;
                  const isOutlierQty = (r.quantity || 0) > 10;
                  const isMissingPayment = !r.paymentMethod;

                  return (
                    <tr key={r.row} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 text-slate-500">{r.row}</td>
                      <td className="py-2 px-3 text-white font-semibold">{r.orderId}</td>
                      <td className="py-2 px-3 text-slate-300">{r.orderDate}</td>
                      <td className="py-2 px-3 text-slate-300">{r.region}</td>
                      <td className="py-2 px-3 text-slate-200 font-sans">{r.category}</td>
                      <td className="py-2 px-3 text-right">
                        {isNegPrice ? (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
                            ${r.unitPrice?.toFixed(2)} (Entry Err)
                          </span>
                        ) : isMissingPrice ? (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                            [NULL]
                          </span>
                        ) : (
                          <span className="text-slate-200">${r.unitPrice?.toFixed(2)}</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {isOutlierQty ? (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                            {r.quantity} (Outlier)
                          </span>
                        ) : r.quantity === null ? (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                            [NULL]
                          </span>
                        ) : (
                          <span className="text-slate-200">{r.quantity}</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-400">{r.discountPct}%</td>
                      <td className="py-2 px-3">
                        {isMissingPayment ? (
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 italic">
                            [BLANK]
                          </span>
                        ) : (
                          <span className="text-slate-300">{r.paymentMethod}</span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold ${
                          r.orderStatus === 'Returned'
                            ? 'bg-rose-500/10 text-rose-400'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {r.orderStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-slate-800 text-slate-300 rounded text-xs disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs text-slate-400">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 bg-slate-800 text-slate-300 rounded text-xs disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* VIEW 3: Power Query M-Code */}
      {activeSubTab === 'mcode' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-amber-400" />
                <span>Power Query M-Code Script (Advanced Editor Ready)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Paste directly into Power BI Desktop: Home → Transform Data → Advanced Editor.
              </p>
            </div>

            <button
              onClick={handleCopyMCode}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
            >
              {copiedMCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedMCode ? 'Copied to Clipboard!' : 'Copy M-Code Script'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-amber-300 overflow-x-auto leading-relaxed">
            {generatePowerQueryMCode()}
          </pre>
        </div>
      )}
    </div>
  );
};
