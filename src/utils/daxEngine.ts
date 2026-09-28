import {
  CleanedTransactionRecord,
  DaxMeasures,
  FilterState,
  CategorySummary,
  MonthlyTrend,
  RegionSummary,
  CitySummary,
} from '../types/ecommerce';

export interface DaxFormulaMeta {
  name: string;
  expression: string;
  category: 'Core Financials' | 'Operational KPIs' | 'Time Intelligence';
  description: string;
  interviewNote: string;
}

export const DAX_CATALOG: DaxFormulaMeta[] = [
  {
    name: 'Total Revenue',
    expression: "Total Revenue = SUM('Raw_Transactions'[Net Revenue])",
    category: 'Core Financials',
    description: 'Calculates the sum of post-discount net revenue across all filtered transactions.',
    interviewNote: "Uses Net Revenue (accounting for quantity, unit price, and discount %) rather than gross price to reflect actual top-line inflow."
  },
  {
    name: 'Total Profit',
    expression: "Total Profit = SUM('Raw_Transactions'[Profit])",
    category: 'Core Financials',
    description: 'Calculates the total bottom-line profit after subtracting cost of goods sold from net revenue.',
    interviewNote: "Total Cost is evaluated at row-level: Quantity * Cost Price, and Net Revenue - Total Cost produces the true margin."
  },
  {
    name: 'Profit Margin %',
    expression: "Profit Margin % = DIVIDE([Total Profit], [Total Revenue], 0)",
    category: 'Core Financials',
    description: 'Computes overall profitability percentage with zero-division safety.',
    interviewNote: "DIVIDE() is preferred over the '/' operator because it intercepts division by zero errors and returns an alternate result (0), preventing broken card visuals."
  },
  {
    name: 'Total Orders',
    expression: "Total Orders = DISTINCTCOUNT('Raw_Transactions'[Order ID])",
    category: 'Operational KPIs',
    description: 'Counts distinct order numbers, ensuring multi-line item orders are not double-counted.',
    interviewNote: "DISTINCTCOUNT vs COUNTROWS: COUNTROWS would count line items, whereas DISTINCTCOUNT counts true unique purchase orders."
  },
  {
    name: 'Return Rate',
    expression: `Return Rate = 
DIVIDE(
    CALCULATE([Total Orders], 'Raw_Transactions'[Order Status] = "Returned"),
    [Total Orders], 0
)`,
    category: 'Operational KPIs',
    description: 'Computes the proportion of orders returned by customers.',
    interviewNote: "CALCULATE modifies the filter context to evaluate [Total Orders] strictly for returned orders, then divides by the unfiltered [Total Orders]."
  },
  {
    name: 'Avg Order Value (AOV)',
    expression: "Avg Order Value = DIVIDE([Total Revenue], [Total Orders], 0)",
    category: 'Operational KPIs',
    description: 'Measures the average revenue generated per transaction order.',
    interviewNote: "A critical e-commerce health indicator used to identify high-value customer baskets."
  },
  {
    name: 'Revenue MoM Growth %',
    expression: `Revenue MoM Growth % = 
VAR CurrentMonthRevenue = [Total Revenue]
VAR PreviousMonthRevenue = 
    CALCULATE([Total Revenue], DATEADD('DateTable'[Date], -1, MONTH))
RETURN
    DIVIDE(CurrentMonthRevenue - PreviousMonthRevenue, PreviousMonthRevenue, 0)`,
    category: 'Time Intelligence',
    description: 'Measures month-over-month revenue velocity using a connected Date Table.',
    interviewNote: "Requires a formal Date Table with continuous dates to allow DATEADD() to shift filter context back exactly one calendar month."
  }
];

export const INITIAL_FILTERS: FilterState = {
  searchQuery: '',
  selectedRegions: [],
  selectedCities: [],
  selectedCategories: [],
  selectedStatuses: [],
  selectedPaymentMethods: [],
  selectedMonth: 'all',
  dateRange: { start: '2024-01-01', end: '2025-12-31' },
  onlyUnderperforming: false,
};

/**
 * Filter records based on active slicer states
 */
export function applyFilters(records: CleanedTransactionRecord[], filters: FilterState): CleanedTransactionRecord[] {
  return records.filter(item => {
    // Search query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matches =
        item.orderId.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.customerId.toLowerCase().includes(q);
      if (!matches) return false;
    }

    // Regions
    if (filters.selectedRegions.length > 0 && !filters.selectedRegions.includes(item.region)) {
      return false;
    }

    // Cities
    if (filters.selectedCities && filters.selectedCities.length > 0 && !filters.selectedCities.includes(item.city)) {
      return false;
    }

    // Categories
    if (filters.selectedCategories.length > 0 && !filters.selectedCategories.includes(item.category)) {
      return false;
    }

    // Statuses
    if (filters.selectedStatuses.length > 0 && !filters.selectedStatuses.includes(item.orderStatus)) {
      return false;
    }

    // Payment Methods
    if (filters.selectedPaymentMethods.length > 0 && !filters.selectedPaymentMethods.includes(item.paymentMethod)) {
      return false;
    }

    // Month filter (YYYY-MM)
    if (filters.selectedMonth !== 'all' && item.yearMonth !== filters.selectedMonth) {
      return false;
    }

    // Date range
    if (filters.dateRange.start && item.orderDate < filters.dateRange.start) {
      return false;
    }
    if (filters.dateRange.end && item.orderDate > filters.dateRange.end) {
      return false;
    }

    // Underperforming filter
    if (filters.onlyUnderperforming && item.category !== 'Fashion' && item.category !== 'Sports & Fitness') {
      return false;
    }

    return true;
  });
}

/**
 * Calculate the core 4 DAX KPI Measures
 */
export function calculateDaxMeasures(records: CleanedTransactionRecord[], allRecords?: CleanedTransactionRecord[]): DaxMeasures {
  if (records.length === 0) {
    return {
      totalRevenue: 0,
      totalProfit: 0,
      profitMarginPct: 0,
      totalOrders: 0,
      returnRate: 0,
      avgOrderValue: 0,
      revenueMomGrowthPct: 0,
      totalUnitsSold: 0,
      returnedOrdersCount: 0,
    };
  }

  let totalRevenue = 0;
  let totalProfit = 0;
  let totalUnitsSold = 0;
  const distinctOrders = new Set<string>();
  const returnedOrders = new Set<string>();

  for (const r of records) {
    totalRevenue += r.netRevenue;
    totalProfit += r.profit;
    totalUnitsSold += r.quantity;
    distinctOrders.add(r.orderId);
    if (r.orderStatus === 'Returned') {
      returnedOrders.add(r.orderId);
    }
  }

  totalRevenue = Math.round(totalRevenue * 100) / 100;
  totalProfit = Math.round(totalProfit * 100) / 100;

  const totalOrders = distinctOrders.size;
  const profitMarginPct = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const returnRate = totalOrders > 0 ? (returnedOrders.size / totalOrders) * 100 : 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // MoM growth computation
  const monthly = getMonthlyTrends(allRecords || records);
  let revenueMomGrowthPct = 0;
  if (monthly.length >= 2) {
    const latest = monthly[monthly.length - 1];
    revenueMomGrowthPct = latest.momGrowthPct;
  }

  return {
    totalRevenue,
    totalProfit,
    profitMarginPct: Math.round(profitMarginPct * 10) / 10,
    totalOrders,
    returnRate: Math.round(returnRate * 10) / 10,
    avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    revenueMomGrowthPct: Math.round(revenueMomGrowthPct * 10) / 10,
    totalUnitsSold,
    returnedOrdersCount: returnedOrders.size,
  };
}

/**
 * Monthly trend time intelligence across 2024 and 2025
 */
export function getMonthlyTrends(records: CleanedTransactionRecord[]): MonthlyTrend[] {
  const monthMap = new Map<string, { revenue: number; profit: number; orders: Set<string>; monthName: string }>();

  // Pre-seed all months across 2024 and 2025
  const years = [2024, 2025];
  for (const yr of years) {
    for (let m = 1; m <= 12; m++) {
      const mm = String(m).padStart(2, '0');
      const key = `${yr}-${mm}`;
      const date = new Date(yr, m - 1, 1);
      const monthName = `${date.toLocaleString('default', { month: 'short' })} '${String(yr).slice(-2)}`;
      monthMap.set(key, { revenue: 0, profit: 0, orders: new Set(), monthName });
    }
  }

  for (const r of records) {
    if (monthMap.has(r.yearMonth)) {
      const entry = monthMap.get(r.yearMonth)!;
      entry.revenue += r.netRevenue;
      entry.profit += r.profit;
      entry.orders.add(r.orderId);
    }
  }

  const trends: MonthlyTrend[] = [];
  let prevRevenue = 0;

  const sortedKeys = Array.from(monthMap.keys()).sort();
  for (const key of sortedKeys) {
    const entry = monthMap.get(key)!;
    const revenue = Math.round(entry.revenue);
    const profit = Math.round(entry.profit);
    const orders = entry.orders.size;
    const profitMarginPct = revenue > 0 ? Math.round((profit / revenue) * 1000) / 10 : 0;
    
    let momGrowthPct = 0;
    if (prevRevenue > 0) {
      momGrowthPct = Math.round(((revenue - prevRevenue) / prevRevenue) * 1000) / 10;
    }

    trends.push({
      yearMonth: key,
      monthName: entry.monthName,
      revenue,
      profit,
      profitMarginPct,
      orders,
      momGrowthPct,
      prevRevenue,
    });

    prevRevenue = revenue;
  }

  return trends;
}

/**
 * Category level summary (Stage 4 & Stage 5 Analysis)
 */
export function getCategorySummaries(records: CleanedTransactionRecord[]): CategorySummary[] {
  const catMap = new Map<
    string,
    {
      revenue: number;
      profit: number;
      orders: Set<string>;
      returnedOrders: Set<string>;
      units: number;
      discounts: number[];
    }
  >();

  let overallRevenue = 0;
  let overallProfit = 0;

  for (const r of records) {
    overallRevenue += r.netRevenue;
    overallProfit += r.profit;

    if (!catMap.has(r.category)) {
      catMap.set(r.category, {
        revenue: 0,
        profit: 0,
        orders: new Set(),
        returnedOrders: new Set(),
        units: 0,
        discounts: [],
      });
    }

    const c = catMap.get(r.category)!;
    c.revenue += r.netRevenue;
    c.profit += r.profit;
    c.orders.add(r.orderId);
    c.units += r.quantity;
    c.discounts.push(r.discountPct);
    if (r.orderStatus === 'Returned') {
      c.returnedOrders.add(r.orderId);
    }
  }

  const overallMarginPct = overallRevenue > 0 ? (overallProfit / overallRevenue) * 100 : 0;

  const summaries: CategorySummary[] = [];

  for (const [category, data] of catMap.entries()) {
    const revenue = Math.round(data.revenue);
    const profit = Math.round(data.profit);
    const orders = data.orders.size;
    const units = data.units;
    const profitMarginPct = revenue > 0 ? Math.round((profit / revenue) * 1000) / 10 : 0;
    const returnRatePct = orders > 0 ? Math.round((data.returnedOrders.size / orders) * 1000) / 10 : 0;
    const revenueSharePct = overallRevenue > 0 ? Math.round((revenue / overallRevenue) * 1000) / 10 : 0;
    const avgOrderValue = orders > 0 ? Math.round((revenue / orders) * 100) / 100 : 0;
    const avgDiscountPct =
      data.discounts.length > 0
        ? Math.round((data.discounts.reduce((a, b) => a + b, 0) / data.discounts.length) * 10) / 10
        : 0;

    // Check underperformance against overall portfolio margin
    const underperformanceGapPct = Math.round((overallMarginPct - profitMarginPct) * 10) / 10;
    const isUnderperforming = profitMarginPct < overallMarginPct - 6;

    summaries.push({
      category,
      revenue,
      revenueSharePct,
      profit,
      profitMarginPct,
      orders,
      units,
      avgDiscountPct,
      returnRatePct,
      avgOrderValue,
      isUnderperforming,
      underperformanceGapPct: Math.max(0, underperformanceGapPct),
    });
  }

  // Sort descending by revenue
  return summaries.sort((a, b) => b.revenue - a.revenue);
}

/**
 * Regional Breakdown Summary (North, South, East, West)
 */
export function getRegionSummaries(records: CleanedTransactionRecord[]): RegionSummary[] {
  const regMap = new Map<string, { revenue: number; profit: number; orders: Set<string>; returned: Set<string> }>();

  for (const reg of ['North', 'South', 'East', 'West']) {
    regMap.set(reg, { revenue: 0, profit: 0, orders: new Set(), returned: new Set() });
  }

  for (const r of records) {
    const entry = regMap.get(r.region);
    if (entry) {
      entry.revenue += r.netRevenue;
      entry.profit += r.profit;
      entry.orders.add(r.orderId);
      if (r.orderStatus === 'Returned') {
        entry.returned.add(r.orderId);
      }
    }
  }

  const res: RegionSummary[] = [];
  for (const [region, data] of regMap.entries()) {
    const revenue = Math.round(data.revenue);
    const profit = Math.round(data.profit);
    const orders = data.orders.size;
    const profitMarginPct = revenue > 0 ? Math.round((profit / revenue) * 1000) / 10 : 0;
    const returnRatePct = orders > 0 ? Math.round((data.returned.size / orders) * 1000) / 10 : 0;
    res.push({ region, revenue, profit, profitMarginPct, orders, returnRatePct });
  }

  return res.sort((a, b) => b.revenue - a.revenue);
}

/**
 * City Breakdown Summary (16 Cities)
 */
export function getCitySummaries(records: CleanedTransactionRecord[]): CitySummary[] {
  const cityMap = new Map<string, { region: string; revenue: number; orders: Set<string>; profit: number }>();

  for (const r of records) {
    if (!cityMap.has(r.city)) {
      cityMap.set(r.city, { region: r.region, revenue: 0, orders: new Set(), profit: 0 });
    }
    const c = cityMap.get(r.city)!;
    c.revenue += r.netRevenue;
    c.profit += r.profit;
    c.orders.add(r.orderId);
  }

  const res: CitySummary[] = [];
  for (const [city, data] of cityMap.entries()) {
    const revenue = Math.round(data.revenue);
    const profit = Math.round(data.profit);
    const orders = data.orders.size;
    const profitMarginPct = revenue > 0 ? Math.round((profit / revenue) * 1000) / 10 : 0;
    res.push({ city, region: data.region, revenue, orders, profit, profitMarginPct });
  }

  return res.sort((a, b) => b.revenue - a.revenue);
}

/**
 * Order Status Breakdown
 */
export function getOrderStatusBreakdown(records: CleanedTransactionRecord[]) {
  const map: Record<string, number> = {
    Delivered: 0,
    Returned: 0,
    Cancelled: 0,
  };
  for (const r of records) {
    if (map[r.orderStatus] !== undefined) {
      map[r.orderStatus]++;
    }
  }
  return Object.entries(map).map(([status, count]) => ({ status, count }));
}

/**
 * Return Reason Breakdown (filtered strictly to Returned orders)
 */
export function getReturnReasonBreakdown(records: CleanedTransactionRecord[]) {
  const map: Record<string, number> = {};
  for (const r of records) {
    if (r.orderStatus === 'Returned' && r.returnReason) {
      map[r.returnReason] = (map[r.returnReason] || 0) + 1;
    }
  }
  return Object.entries(map)
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);
}
