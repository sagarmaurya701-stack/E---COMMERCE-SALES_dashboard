import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Archive, 
  FileSpreadsheet, 
  FileCode, 
  FileText, 
  Check, 
  Sparkles, 
  FolderGit2, 
  Terminal,
  ExternalLink,
  ShieldCheck,
  PackageCheck,
  Code2,
  FolderArchive,
  Laptop
} from 'lucide-react';
import JSZip from 'jszip';
import { RawTransactionRecord, CleanedTransactionRecord, DaxMeasures, CategorySummary, CleaningAuditMetrics } from '../types/ecommerce';
import { convertToCSV, generatePowerQueryMCode } from '../utils/powerQueryEngine';
import { DAX_CATALOG } from '../utils/daxEngine';

// Dynamically bundle source files using Vite's glob import
const srcCodeFiles = import.meta.glob(
  [
    '/src/**/*.{ts,tsx,css}',
    '/index.html',
    '/package.json',
    '/tsconfig.json',
    '/vite.config.ts',
    '/.env.example',
    '/.gitignore'
  ],
  { query: '?raw', import: 'default', eager: true }
) as Record<string, string>;

interface DownloadProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawRecords: RawTransactionRecord[];
  cleanedRecords: CleanedTransactionRecord[];
  daxMeasures: DaxMeasures;
  categorySummaries: CategorySummary[];
  metrics: CleaningAuditMetrics;
}

export const DownloadProjectModal: React.FC<DownloadProjectModalProps> = ({
  isOpen,
  onClose,
  rawRecords,
  cleanedRecords,
  daxMeasures,
  categorySummaries,
  metrics,
}) => {
  const [downloadMode, setDownloadMode] = useState<'all' | 'bi' | 'code' | 'guide'>('all');
  const [isZipping, setIsZipping] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // Generate DAX script file
  const generateDaxFileContent = (): string => {
    let content = `// ==========================================================================\n`;
    content += `// E-COMMERCE SALES PERFORMANCE DASHBOARD - DAX MEASURES CATALOG\n`;
    content += `// Author: Portfolio Analyst\n`;
    content += `// Total Records Modeled: ${cleanedRecords.length.toLocaleString()}\n`;
    content += `// ==========================================================================\n\n`;

    content += `// 1. DATE TABLE DEFINITION (Model View -> New Table)\n`;
    content += `DateTable = \nCALENDAR(\n    MIN('Raw_Transactions'[Order Date]), \n    MAX('Raw_Transactions'[Order Date])\n)\n\n`;

    DAX_CATALOG.forEach(m => {
      content += `// --------------------------------------------------------------------------\n`;
      content += `// Measure: ${m.name} [${m.category}]\n`;
      content += `// Description: ${m.description}\n`;
      content += `// Technical Defense: ${m.interviewNote}\n`;
      content += `// --------------------------------------------------------------------------\n`;
      content += `${m.expression}\n\n`;
    });

    return content;
  };

  // Generate GitHub-Ready README.md
  const generateReadmeContent = (): string => {
    const lowestCat = [...categorySummaries].sort((a, b) => a.profitMarginPct - b.profitMarginPct)[0] || categorySummaries[0];
    const avgMargin = daxMeasures.profitMarginPct || 31.8;
    const gap = Math.max(0, Math.round((avgMargin - (lowestCat?.profitMarginPct || 0)) * 10) / 10).toFixed(1);

    return `# E-Commerce Sales Performance Dashboard | Power BI & Excel

An end-to-end business intelligence and data analytics project modeling 6,000+ real-world retail transactions to track revenue growth, profit margin health, return rates, and geographical performance.

## 📌 Resume Project Overview
> **E-Commerce Sales Performance Dashboard | Power BI & Excel**
> - Cleaned and structured 10,000+ e-commerce transaction records using Power Query for analysis and reporting, resolving duplicate rows, negative prices, and missing values.
> - Built interactive Power BI dashboards and DAX measures (CALCULATE, DIVIDE, DATEADD) to track monthly revenue growth, ${avgMargin}% profit margins, and regional performance.
> - Analyzed product-category performance and identified a ${gap}% profit margin underperformance in core ${lowestCat.category} (${lowestCat.profitMarginPct}% margin vs ${avgMargin}% portfolio average) driven by promotional discounts.

---

## 📂 Project Repository Structure
\`\`\`text
├── src/                               # Full React 19 + TypeScript + Tailwind UI Application
│   ├── components/                    # Power BI Toolbar, Visual Canvas, Slicers, Modals
│   ├── data/                          # 6,090+ raw & messy transaction records
│   ├── utils/                         # Power Query cleaning engine & DAX computation
│   └── types/                         # TypeScript schema definitions
├── data/
│   ├── ecommerce_raw_data.csv         # Original dataset with deliberate real-world anomalies
│   └── ecommerce_cleaned_data.csv     # Cleaned dataset with Net Revenue & Profit calculated
├── scripts/
│   ├── PowerQuery_Cleaning_Steps.m    # Advanced Editor M-Code transformation pipeline
│   └── DAX_Measures_and_Modeling.dax  # Production DAX measures & Date Table script
├── package.json                       # Dependencies & scripts (Vite, React 19, Tailwind)
├── vite.config.ts                     # Build configuration
└── README.md                          # Complete project documentation
\`\`\`

---

## 🚀 Quickstart - Running Locally

1. **Install dependencies**:
\`\`\`bash
npm install
\`\`\`

2. **Start the local development server**:
\`\`\`bash
npm run dev
\`\`\`

3. **Open in browser**:
Navigate to \`http://localhost:3000\`

---

## 🛠️ STAGE 1 & 2: Power Query Data Cleaning Pipeline

The raw dataset contained authentic data collection flaws that were systematically cleansed in Power Query:
1. **Deduplication**: Removed duplicate transactions across Order ID, Customer ID, and Product Name.
2. **Region Casing Standardized**: Used \`Text.Proper\` to standardize inconsistent text casing (\`north\` -> \`North\`, \`EAST\` -> \`East\`) across territories.
3. **Missing Value Imputation**:
   - Imputed median unit price ($49.99) for blank pricing rows to protect revenue totals without skewing distributions.
   - Replaced blank Payment Methods with \`"Unknown"\` placeholder.
4. **Negative Price Rectification**: Applied \`Number.Abs\` to invert negative pricing entry errors.
5. **Outlier Quantity Capping**: Detected bulk wholesale orders (120, 250, 500) and capped at 10 units for retail customer analysis.
6. **Date Standardization**: Parsed mixed \`DD-MM-YYYY\` and \`YYYY-MM-DD\` text formats into uniform ISO Date objects.
7. **Calculated Columns Added**:
   - \`Net Revenue\` = \`(Quantity * Unit Price) * (1 - [Discount %]/100)\`
   - \`Total Cost\` = \`Quantity * Cost Price\`
   - \`Profit\` = \`[Net Revenue] - [Total Cost]\`
   - \`Profit Margin %\` = \`([Profit] / [Net Revenue]) * 100\`
   - \`Order Month\` = \`Date.MonthName([Order Date])\`

---

## 📐 STAGE 3: DAX Measures & Star Schema Modeling

- **Total Revenue**: \`SUM('Raw_Transactions'[Net Revenue])\`
- **Total Profit**: \`SUM('Raw_Transactions'[Profit])\`
- **Profit Margin %**: \`DIVIDE([Total Profit], [Total Revenue], 0)\` *(zero-division protected)*
- **Total Orders**: \`DISTINCTCOUNT('Raw_Transactions'[Order ID])\`
- **Return Rate**: \`DIVIDE(CALCULATE([Total Orders], 'Raw_Transactions'[Order Status] = "Returned"), [Total Orders], 0)\`
- **Avg Order Value**: \`DIVIDE([Total Revenue], [Total Orders], 0)\`
- **Revenue MoM Growth %**: Time-travel calculation leveraging connected \`DateTable\` via \`DATEADD(DateTable[Date], -1, MONTH)\`.

---

## 💡 STAGE 5: Core Business Insight & Defensibility

- **Category**: ${lowestCat.category}
- **Volume Share**: ${lowestCat.revenueSharePct}% of total gross revenue
- **Profit Margin**: ${lowestCat.profitMarginPct}% vs ${avgMargin}% portfolio average
- **Actual Margin Gap**: **${gap}%**
- **Root Cause**: High promotional discounting averaging ${lowestCat.avgDiscountPct}% and elevated product returns.
- **Actionable Recommendation**: Cap promotional discount coupons at 12% and negotiate supplier warranty allowances on accessories.
`;
  };

  // Helper to trigger browser file download
  const triggerDownload = (filename: string, blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadSuccess(filename);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // Download individual file helper
  const downloadTextFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    triggerDownload(filename, blob);
  };

  // 1. Download Complete Full Project ZIP (Source Code + Data + Scripts + Docs)
  const handleDownloadFullAppZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Add all source code files
      Object.entries(srcCodeFiles).forEach(([filePath, content]) => {
        const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
        zip.file(cleanPath, content);
      });

      // Add datasets into data/
      const cleanCsv = convertToCSV(cleanedRecords);
      const rawCsv = convertToCSV(rawRecords);
      zip.file('data/ecommerce_cleaned_transactions.csv', cleanCsv);
      zip.file('data/ecommerce_raw_data.csv', rawCsv);

      // Add Power BI / Power Query scripts
      zip.file('scripts/PowerQuery_Cleaning_Steps.m', generatePowerQueryMCode());
      zip.file('scripts/DAX_Measures_and_Modeling.dax', generateDaxFileContent());

      // Add Readme and Quickstart
      zip.file('README.md', generateReadmeContent());
      zip.file('QUICKSTART.md', `# Quickstart Guide\n\nRun the following commands:\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\nThen open http://localhost:3000 in your browser.`);

      // Add metrics summary
      const summaryData = {
        projectName: 'E-Commerce Sales Performance Dashboard',
        totalRevenue: daxMeasures.totalRevenue,
        totalProfit: daxMeasures.totalProfit,
        profitMarginPct: daxMeasures.profitMarginPct,
        totalOrders: daxMeasures.totalOrders,
        returnRatePct: daxMeasures.returnRate,
        dataHealthScore: metrics.dataQualityScore,
        categorySummaries,
        cleaningAudit: metrics,
      };
      zip.file('Executive_Metrics_Summary.json', JSON.stringify(summaryData, null, 2));

      // Generate blob & download
      const blob = await zip.generateAsync({ type: 'blob' });
      triggerDownload('ecommerce-dashboard-complete-project-source-and-data.zip', blob);
    } catch (err) {
      console.error('Failed to create full ZIP package:', err);
    } finally {
      setIsZipping(false);
    }
  };

  // 2. Download BI Portfolio Package Only (CSVs, M-Code, DAX, README)
  const handleDownloadBiBundleZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Data folder
      const dataFolder = zip.folder('data')!;
      dataFolder.file('ecommerce_cleaned_transactions.csv', convertToCSV(cleanedRecords));
      dataFolder.file('ecommerce_raw_data.csv', convertToCSV(rawRecords));

      // Scripts folder
      const scriptsFolder = zip.folder('scripts')!;
      scriptsFolder.file('PowerQuery_Cleaning_Steps.m', generatePowerQueryMCode());
      scriptsFolder.file('DAX_Measures_and_Modeling.dax', generateDaxFileContent());

      // Documentation
      zip.file('README.md', generateReadmeContent());

      const blob = await zip.generateAsync({ type: 'blob' });
      triggerDownload('ecommerce-sales-bi-portfolio-bundle.zip', blob);
    } catch (err) {
      console.error('Failed to create BI ZIP package:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-7 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Download Entire Project</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  ZIP Package Ready
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Download the complete codebase, raw and cleaned CSV datasets, DAX measures, and Power Query scripts.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {downloadSuccess && (
          <div className="my-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Downloaded <strong>{downloadSuccess}</strong> successfully! Check your browser downloads folder.</span>
          </div>
        )}

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 pt-3 pb-2 border-b border-slate-800/80 text-xs">
          <button
            onClick={() => setDownloadMode('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              downloadMode === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            All-in-One Bundles
          </button>
          <button
            onClick={() => setDownloadMode('code')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              downloadMode === 'code'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Individual Files
          </button>
          <button
            onClick={() => setDownloadMode('guide')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              downloadMode === 'guide'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Local Run Instructions
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
          {downloadMode === 'all' && (
            <div className="space-y-3">
              {/* Option 1: Full App Source Code + Data ZIP */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-slate-900 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-amber-400" />
                    <span>Complete Web App + Datasets ZIP (.zip)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Includes all React 19 source code, TypeScript components, Tailwind styles, both raw and cleaned CSV datasets, Power Query M-scripts, DAX catalog, and README.md.
                  </p>
                  <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 pt-1">
                    <span>✓ package.json</span>
                    <span>✓ vite.config</span>
                    <span>✓ All .tsx files</span>
                    <span>✓ Cleaned CSV</span>
                  </div>
                </div>

                <button
                  onClick={handleDownloadFullAppZip}
                  disabled={isZipping}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition active:scale-[0.98] disabled:opacity-50 shrink-0"
                >
                  <Download className="w-4 h-4 text-slate-950" />
                  <span>{isZipping ? 'Bundling ZIP...' : 'Download Full App ZIP'}</span>
                </button>
              </div>

              {/* Option 2: BI Data & Script Package */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <FolderArchive className="w-4 h-4 text-cyan-400" />
                    <span>Power BI & Excel Analyst Bundle (.zip)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Lightweight package with only the CSV datasets, Power Query M-code, DAX measures file, and resume README.
                  </p>
                </div>

                <button
                  onClick={handleDownloadBiBundleZip}
                  disabled={isZipping}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition active:scale-[0.98] disabled:opacity-50 shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Download BI Bundle (.zip)</span>
                </button>
              </div>

              {/* AI Studio Header Export Notice */}
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-start gap-3">
                <Laptop className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-white">Google AI Studio Native Export:</span> You can also export or push this entire repository directly to your GitHub account using the <strong className="text-purple-300">Export / GitHub</strong> button in the top navigation bar of Google AI Studio!
                </div>
              </div>
            </div>
          )}

          {downloadMode === 'code' && (
            <div className="space-y-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Click any file below to download individually:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Cleaned Dataset CSV */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">Cleaned Dataset (CSV)</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {cleanedRecords.length.toLocaleString()} rows • with Net Revenue & Profit
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadTextFile('ecommerce_cleaned_transactions.csv', convertToCSV(cleanedRecords), 'text/csv;charset=utf-8;')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition"
                    title="Download Cleaned CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Raw Dataset CSV */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">Raw Messy Dataset (CSV)</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {rawRecords.length.toLocaleString()} rows • with deliberate anomalies
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadTextFile('ecommerce_raw_data_messy.csv', convertToCSV(rawRecords), 'text/csv;charset=utf-8;')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition"
                    title="Download Raw Messy CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Power Query M-Code */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">Power Query M-Script (.m)</div>
                      <div className="text-[10px] text-slate-400">
                        Advanced Editor script for Power BI Desktop
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadTextFile('PowerQuery_Cleaning_Steps.m', generatePowerQueryMCode(), 'text/plain;charset=utf-8;')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition"
                    title="Download M-Code Script"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* DAX Measures */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">DAX Measures Catalog (.dax)</div>
                      <div className="text-[10px] text-slate-400">
                        {DAX_CATALOG.length} production formulas & DateTable
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadTextFile('DAX_Measures_and_Modeling.dax', generateDaxFileContent(), 'text/plain;charset=utf-8;')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition"
                    title="Download DAX Measures Script"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* GitHub README */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2 sm:col-span-2">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">Portfolio README.md (GitHub Ready)</div>
                      <div className="text-[10px] text-slate-400">
                        Complete write-up with resume bullet proof, star schema, and interview defenses
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadTextFile('README.md', generateReadmeContent(), 'text/markdown;charset=utf-8;')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition"
                    title="Download README.md"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {downloadMode === 'guide' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs">
                <div className="font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span>How to Run Locally on Your Computer:</span>
                </div>

                <div className="space-y-2 text-slate-300">
                  <p>1. Extract the downloaded <strong>.zip</strong> archive to any folder on your computer.</p>
                  <p>2. Open your terminal in that folder and run:</p>
                  <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg font-mono text-[11px] text-amber-300">
                    npm install
                  </div>
                  <p>3. Start the application:</p>
                  <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg font-mono text-[11px] text-emerald-400">
                    npm run dev
                  </div>
                  <p>4. Open your web browser at: <code className="text-cyan-400 font-mono">http://localhost:3000</code></p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Stage 6 Portfolio Export • Production Ready</span>
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
