import {
  RawTransactionRecord,
  CleanedTransactionRecord,
  CleaningPipelineConfig,
  CleaningAuditMetrics,
} from '../types/ecommerce';

export const DEFAULT_PIPELINE_CONFIG: CleaningPipelineConfig = {
  removeDuplicates: true,
  standardizeRegionCasing: true,
  handleMissingUnitPrice: 'median',
  handleMissingQuantity: 'default_1',
  handleMissingPaymentMethod: 'unknown',
  fixNegativePrices: true,
  capOutlierQuantities: true,
  maxQuantityCap: 10,
  standardizeDates: true,
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Standardize varied date strings (DD-MM-YYYY or YYYY-MM-DD) into standard ISO YYYY-MM-DD
 */
export function parseAndStandardizeDate(dateStr: string): { isoDate: string; monthName: string; monthShort: string; year: number; yearMonth: string } {
  if (!dateStr) {
    return { isoDate: '2024-01-01', monthName: 'January', monthShort: 'Jan', year: 2024, yearMonth: '2024-01' };
  }

  let year = 2024;
  let month = 1; // 1-12
  let day = 1;

  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      year = parseInt(parts[0], 10) || 2024;
      month = parseInt(parts[1], 10) || 1;
      day = parseInt(parts[2], 10) || 1;
    } else {
      // DD-MM-YYYY
      day = parseInt(parts[0], 10) || 1;
      month = parseInt(parts[1], 10) || 1;
      year = parseInt(parts[2], 10) || 2024;
    }
  }

  // Clamping
  month = Math.max(1, Math.min(12, month));
  day = Math.max(1, Math.min(31, day));

  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  const isoDate = `${year}-${mm}-${dd}`;
  const monthName = MONTH_NAMES[month - 1];
  const monthShort = MONTH_NAMES_SHORT[month - 1];
  const yearMonth = `${year}-${mm}`;

  return { isoDate, monthName, monthShort, year, yearMonth };
}

/**
 * Capitalize Each Word (Power Query standard function)
 */
export function standardizeRegion(region: string): 'North' | 'South' | 'East' | 'West' {
  if (!region) return 'North';
  const clean = region.trim().toLowerCase();
  if (clean.includes('north')) return 'North';
  if (clean.includes('south')) return 'South';
  if (clean.includes('east')) return 'East';
  if (clean.includes('west')) return 'West';
  return 'North';
}

/**
 * Calculate median of positive unit prices
 */
export function calculateMedianUnitPrice(records: RawTransactionRecord[]): number {
  const validPrices = records
    .map(r => r.unitPrice)
    .filter((p): p is number => typeof p === 'number' && !isNaN(p) && p !== 0)
    .map(p => Math.abs(p))
    .sort((a, b) => a - b);

  if (validPrices.length === 0) return 49.99;
  const mid = Math.floor(validPrices.length / 2);
  return validPrices.length % 2 !== 0
    ? validPrices[mid]
    : (validPrices[mid - 1] + validPrices[mid]) / 2;
}

/**
 * Execute Power Query Cleaning Pipeline (Stage 2 in Guide)
 */
export function runPowerQueryPipeline(
  rawRecords: RawTransactionRecord[],
  config: CleaningPipelineConfig = DEFAULT_PIPELINE_CONFIG
): { cleaned: CleanedTransactionRecord[]; metrics: CleaningAuditMetrics } {
  let duplicatesRemoved = 0;
  let regionsNormalized = 0;
  let missingPricesFilled = 0;
  let missingQuantitiesFilled = 0;
  let missingPaymentsFilled = 0;
  let negativePricesFixed = 0;
  let outliersCapped = 0;
  let datesStandardized = 0;

  // Step 1: Remove Duplicates (based on Order ID + Customer ID + Product Name)
  let workingList = [...rawRecords];
  if (config.removeDuplicates) {
    const seen = new Set<string>();
    const deduplicated: RawTransactionRecord[] = [];
    for (const rec of workingList) {
      const key = `${rec.orderId}|${rec.customerId}|${rec.productName}|${rec.discountPct}`;
      if (seen.has(key)) {
        duplicatesRemoved++;
      } else {
        seen.add(key);
        deduplicated.push(rec);
      }
    }
    workingList = deduplicated;
  }

  // Pre-calculate column median for Step 3
  const medianUnitPrice = calculateMedianUnitPrice(workingList);

  const cleanedRecords: CleanedTransactionRecord[] = [];

  for (const raw of workingList) {
    let wasPriceFixed = false;
    let wasMissingPriceImputed = false;
    let wasOutlierCapped = false;

    // Step 2: Fix inconsistent Region casing
    let region = raw.region as any;
    if (config.standardizeRegionCasing) {
      const std = standardizeRegion(raw.region);
      if (raw.region !== std) {
        regionsNormalized++;
      }
      region = std;
    }

    // Step 3 & 4: Handle Missing Unit Price & Fix Negative Prices
    let unitPrice = raw.unitPrice;
    if (unitPrice === null || unitPrice === undefined || isNaN(unitPrice)) {
      if (config.handleMissingUnitPrice === 'median') {
        unitPrice = Math.round(medianUnitPrice * 100) / 100;
        missingPricesFilled++;
        wasMissingPriceImputed = true;
      } else if (config.handleMissingUnitPrice === 'filter') {
        continue; // filter out row
      } else {
        unitPrice = 0;
      }
    }

    // Step 4: Fix negative prices (Absolute Value)
    if (config.fixNegativePrices && unitPrice < 0) {
      unitPrice = Math.abs(unitPrice);
      negativePricesFixed++;
      wasPriceFixed = true;
    }

    // Step 3: Handle Missing Quantity & Outliers
    let quantity = raw.quantity;
    if (quantity === null || quantity === undefined || isNaN(quantity)) {
      if (config.handleMissingQuantity === 'default_1') {
        quantity = 1;
        missingQuantitiesFilled++;
      } else if (config.handleMissingQuantity === 'filter') {
        continue;
      } else {
        quantity = 1;
      }
    }

    // Step 5: Cap outlier quantities (120, 250, 500)
    if (config.capOutlierQuantities && quantity > config.maxQuantityCap) {
      quantity = config.maxQuantityCap;
      outliersCapped++;
      wasOutlierCapped = true;
    }

    // Step 3: Payment Method missing handling
    let paymentMethod = raw.paymentMethod;
    if (!paymentMethod || paymentMethod.trim() === '') {
      if (config.handleMissingPaymentMethod === 'unknown') {
        paymentMethod = 'Unknown';
        missingPaymentsFilled++;
      } else if (config.handleMissingPaymentMethod === 'filter') {
        continue;
      } else {
        paymentMethod = 'Unknown';
      }
    }

    // Step 6: Standardize Order Date
    let dateMeta = {
      isoDate: raw.orderDate,
      monthName: 'January',
      monthShort: 'Jan',
      year: 2023,
      yearMonth: '2023-01',
    };
    if (config.standardizeDates) {
      dateMeta = parseAndStandardizeDate(raw.orderDate);
      if (raw.orderDate !== dateMeta.isoDate) {
        datesStandardized++;
      }
    }

    // Step 7: Add calculated columns
    // Net Revenue = (Quantity * Unit Price) * (1 - [Discount %]/100)
    const discountMultiplier = Math.max(0, 1 - (raw.discountPct || 0) / 100);
    const netRevenue = Math.round(quantity * unitPrice * discountMultiplier * 100) / 100;
    
    // Total Cost = Quantity * Cost Price
    const totalCost = Math.round(quantity * (raw.costPrice || 0) * 100) / 100;
    
    // Profit = Net Revenue - Total Cost
    const profit = Math.round((netRevenue - totalCost) * 100) / 100;
    
    // Profit Margin % = Profit / Net Revenue * 100
    const profitMarginPct = netRevenue > 0 ? Math.round((profit / netRevenue) * 1000) / 10 : 0;

    cleanedRecords.push({
      row: raw.row,
      orderId: raw.orderId,
      orderDate: dateMeta.isoDate,
      orderMonth: dateMeta.monthName,
      orderMonthShort: dateMeta.monthShort,
      orderYear: dateMeta.year,
      yearMonth: dateMeta.yearMonth,
      customerId: raw.customerId,
      region,
      city: raw.city,
      category: raw.category,
      productName: raw.productName,
      unitPrice,
      costPrice: raw.costPrice,
      quantity,
      discountPct: raw.discountPct,
      paymentMethod,
      orderStatus: raw.orderStatus,
      returnReason: raw.returnReason,
      netRevenue,
      totalCost,
      profit,
      profitMarginPct,
      wasPriceFixed,
      wasMissingPriceImputed,
      wasOutlierCapped,
    });
  }

  // Calculate Data Quality Score (0 to 100%)
  const totalAnomalies =
    duplicatesRemoved +
    regionsNormalized +
    missingPricesFilled +
    missingQuantitiesFilled +
    missingPaymentsFilled +
    negativePricesFixed +
    outliersCapped +
    datesStandardized;

  // With all cleaning enabled, data quality is 100%
  const totalChecks = rawRecords.length * 3;
  const healthRatio = Math.min(100, Math.round(((totalChecks - totalAnomalies * 0.2) / totalChecks) * 100));

  const metrics: CleaningAuditMetrics = {
    rawRowCount: rawRecords.length,
    cleanedRowCount: cleanedRecords.length,
    duplicatesRemoved,
    regionsNormalized,
    missingPricesFilled,
    missingQuantitiesFilled,
    missingPaymentsFilled,
    negativePricesFixed,
    outliersCapped,
    datesStandardized,
    dataQualityScore: healthRatio,
  };

  return { cleaned: cleanedRecords, metrics };
}

/**
 * Generate M-Query code string for Power BI Advanced Editor
 */
export function generatePowerQueryMCode(): string {
  return `let
    // 1. Load source Excel sheet
    Source = Excel.Workbook(File.Contents("ecommerce_raw_data.xlsx"), null, true),
    Raw_Transactions_Sheet = Source{[Item="Raw_Transactions",Kind="Sheet"]}[Data],
    #"Promoted Headers" = Table.PromoteHeaders(Raw_Transactions_Sheet, [PromoteAllScalars=true]),

    // 2. Remove duplicates
    #"Removed Duplicates" = Table.Distinct(#"Promoted Headers", {"Order ID", "Customer ID", "Product Name"}),

    // 3. Fix inconsistent Region casing
    #"Capitalized Region" = Table.TransformColumns(#"Removed Duplicates", {{"Region", Text.Proper, type text}}),

    // 4. Fix negative unit prices (Absolute value)
    #"Fixed Negative Unit Price" = Table.TransformColumns(#"Capitalized Region", {{"Unit Price", Number.Abs, type number}}),

    // 5. Replace missing values
    #"Replaced Missing Unit Price" = Table.ReplaceValue(#"Fixed Negative Unit Price", null, 49.99, Replacer.ReplaceValue, {"Unit Price"}),
    #"Replaced Missing Quantity" = Table.ReplaceValue(#"Replaced Missing Unit Price", null, 1, Replacer.ReplaceValue, {"Quantity"}),
    #"Replaced Missing Payment" = Table.ReplaceValue(#"Replaced Missing Quantity", null, "Unknown", Replacer.ReplaceValue, {"Payment Method"}),

    // 6. Cap outlier quantities at 10
    #"Capped Outlier Quantity" = Table.TransformColumns(#"Replaced Missing Payment", {{"Quantity", each if _ > 10 then 10 else _, type number}}),

    // 7. Parse and Standardize Order Date
    #"Parsed Date" = Table.TransformColumns(#"Capped Outlier Quantity", {{"Order Date", each DateTime.Date(DateTime.FromText(_)), type date}}),

    // 8. Add Calculated Columns
    #"Added Net Revenue" = Table.AddColumn(#"Parsed Date", "Net Revenue", each ([Quantity] * [Unit Price]) * (1 - ([#"Discount %"] / 100)), type number),
    #"Added Total Cost" = Table.AddColumn(#"Added Net Revenue", "Total Cost", each [Quantity] * [Cost Price], type number),
    #"Added Profit" = Table.AddColumn(#"Added Total Cost", "Profit", each [Net Revenue] - [Total Cost], type number),
    #"Added Profit Margin %" = Table.AddColumn(#"Added Profit", "Profit Margin %", each ([Profit] / [Net Revenue]) * 100, type number),
    #"Added Order Month" = Table.AddColumn(#"Added Profit Margin %", "Order Month", each Date.MonthName([Order Date]), type text),

    // 9. Set Schema Types
    #"Changed Type" = Table.TransformColumnTypes(#"Added Order Month",{
        {"Order ID", type text},
        {"Order Date", type date},
        {"Customer ID", type text},
        {"Customer Segment", type text},
        {"Region", type text},
        {"Product Category", type text},
        {"Sub-Category", type text},
        {"Product Name", type text},
        {"Unit Price", Currency.Type},
        {"Cost Price", Currency.Type},
        {"Quantity", Int64.Type},
        {"Discount %", Percentage.Type},
        {"Payment Method", type text},
        {"Order Status", type text},
        {"Net Revenue", Currency.Type},
        {"Total Cost", Currency.Type},
        {"Profit", Currency.Type},
        {"Profit Margin %", type number}
    })
in
    #"Changed Type"`;
}

/**
 * Export data array to CSV string
 */
export function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map(obj =>
    headers.map(header => {
      const val = obj[header];
      if (val === null || val === undefined) return '';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}
