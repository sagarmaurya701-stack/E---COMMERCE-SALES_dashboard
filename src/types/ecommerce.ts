export interface RawTransactionRecord {
  row: number;
  orderId: string;
  orderDate: string;
  customerId: string;
  category: string;
  productName: string;
  quantity: number | null;
  unitPrice: number | null;
  discountPct: number;
  costPrice: number;
  region: string;
  city: string;
  paymentMethod: string | null;
  orderStatus: 'Delivered' | 'Returned' | 'Cancelled';
  returnReason?: string | null;
}

export interface CleanedTransactionRecord {
  row: number;
  orderId: string;
  orderDate: string; // ISO standard YYYY-MM-DD
  orderMonth: string; // e.g. "January"
  orderMonthShort: string; // e.g. "Jan"
  orderYear: number;
  yearMonth: string; // e.g. "2024-03" or "2025-07"
  customerId: string;
  region: 'North' | 'South' | 'East' | 'West';
  city: string;
  category: string;
  productName: string;
  unitPrice: number;
  costPrice: number;
  quantity: number;
  discountPct: number;
  paymentMethod: string;
  orderStatus: 'Delivered' | 'Returned' | 'Cancelled';
  returnReason?: string | null;
  // Calculated columns added in Power Query
  netRevenue: number;
  totalCost: number;
  profit: number;
  profitMarginPct: number;
  // Audit flags
  wasDuplicate?: boolean;
  wasPriceFixed?: boolean;
  wasOutlierCapped?: boolean;
  wasMissingPriceImputed?: boolean;
}

export interface CleaningPipelineConfig {
  removeDuplicates: boolean;
  standardizeRegionCasing: boolean;
  handleMissingUnitPrice: 'median' | 'filter' | 'none';
  handleMissingQuantity: 'default_1' | 'filter' | 'none';
  handleMissingPaymentMethod: 'unknown' | 'filter' | 'none';
  fixNegativePrices: boolean;
  capOutlierQuantities: boolean;
  maxQuantityCap: number;
  standardizeDates: boolean;
}

export interface CleaningAuditMetrics {
  rawRowCount: number;
  cleanedRowCount: number;
  duplicatesRemoved: number;
  regionsNormalized: number;
  missingPricesFilled: number;
  missingQuantitiesFilled: number;
  missingPaymentsFilled: number;
  negativePricesFixed: number;
  outliersCapped: number;
  datesStandardized: number;
  dataQualityScore: number;
}

export interface DaxMeasures {
  totalRevenue: number;
  totalProfit: number;
  profitMarginPct: number;
  totalOrders: number;
  returnRate: number;
  avgOrderValue: number;
  revenueMomGrowthPct: number;
  totalUnitsSold: number;
  returnedOrdersCount: number;
}

export interface FilterState {
  searchQuery: string;
  selectedRegions: string[];
  selectedCities: string[];
  selectedCategories: string[];
  selectedStatuses: string[];
  selectedPaymentMethods: string[];
  selectedMonth: string; // 'all' or 'YYYY-MM'
  dateRange: { start: string; end: string };
  onlyUnderperforming: boolean;
}

export interface CategorySummary {
  category: string;
  revenue: number;
  revenueSharePct: number;
  profit: number;
  profitMarginPct: number;
  orders: number;
  units: number;
  avgDiscountPct: number;
  returnRatePct: number;
  avgOrderValue: number;
  isUnderperforming: boolean;
  underperformanceGapPct: number;
}

export interface MonthlyTrend {
  yearMonth: string;
  monthName: string;
  revenue: number;
  profit: number;
  profitMarginPct: number;
  orders: number;
  momGrowthPct: number;
  prevRevenue: number;
}

export interface RegionSummary {
  region: string;
  revenue: number;
  profit: number;
  profitMarginPct: number;
  orders: number;
  returnRatePct: number;
}

export interface CitySummary {
  city: string;
  region: string;
  revenue: number;
  orders: number;
  profit: number;
  profitMarginPct: number;
}
