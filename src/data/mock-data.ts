
import {
  subDays,
  formatISO,
  parseISO,
  differenceInDays,
  startOfDay,
  endOfDay,
  isWithinInterval,
  eachDayOfInterval,
} from 'date-fns';


export type Kpi = {
  key: string;
  label: string;
  value: number;
  unit: string | null;
  pct_change: number;
};

export type DateRangeType = { from: Date; to: Date };

// Function to generate a date range ending on a specific date, in ascending order
const generateDateRange = (endDate: Date, days: number): string[] => {
  const dates: string[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(endDate);
    date.setDate(endDate.getDate() - (days - 1 - i));
    // dates.push(date.toLocaleDateString('en-CA')); // YYYY-MM-DD
    dates.push(formatISO(date, { representation: 'date' }));
  }
  return dates;
};

const TODAY = new Date();

// Generate data for the last year for trend charts as a base
const DATES_LAST_YEAR = generateDateRange(TODAY, 365 * 2); // Generate 2 years of data for robust previous year comparison

const generateRandomData = (count: number, min: number, max: number, volatilityFactor = 0.05) => {
  let lastValue = min + Math.random() * (max - min);
  return Array.from({ length: count }, () => {
    const change = (Math.random() - 0.5) * (max - min) * volatilityFactor;
    lastValue = Math.max(min, Math.min(max, lastValue + change));
    const finalValue = lastValue + (Math.random() - 0.5) * (max - min) * 0.01;
    return Math.round(finalValue);
  });
};

const generateRandomFloatData = (count: number, min: number, max: number, volatilityFactor = 0.05, decimals = 2) => {
  let lastValue = min + Math.random() * (max - min);
  return Array.from({ length: count }, () => {
    const change = (Math.random() - 0.5) * (max - min) * volatilityFactor;
    lastValue = Math.max(min, Math.min(max, lastValue + change));
    const finalValue = lastValue + (Math.random() - 0.5) * (max - min) * 0.01;
    return parseFloat(finalValue.toFixed(decimals));
  });
};

export const trendDataBase = {
  dates: DATES_LAST_YEAR,
  orders_last_period: generateRandomData(365 * 2, 100, 950, 0.3),
  conv_last_period: generateRandomFloatData(365 * 2, 0.5, 1.1, 0.3, 3), // Use 3 decimal for conversion for more precision before *100
};


const baseKpiValues = {
  revenue: 28_000_000, // Base for a 28-day period
  avg_ticket: 250,
  orders: 112_000,    // Base for a 28-day period
  sessions: 11_200_000 // Base for a 28-day period
};

// Helper function to calculate factor based on days in range
const calculateFactor = (daysInRange: number): number => {
  if (daysInRange <= 0) return 0;
  return daysInRange / 28; // Normalize to base 28-day period
};

export const getKpiData = (currentRange: DateRangeType, previousRange: DateRangeType): Kpi[] => {
  const daysInCurrentRange = differenceInDays(currentRange.to, currentRange.from) + 1;
  const currentFactor = calculateFactor(daysInCurrentRange);

  const daysInPreviousRange = differenceInDays(previousRange.to, previousRange.from) + 1;
  const previousFactor = calculateFactor(daysInPreviousRange);

  const randomFluctuation = () => 0.98 + Math.random() * 0.04; // Small fluctuation per calculation

  // Calculate values for current period
  const currentRevenue = parseFloat((baseKpiValues.revenue * currentFactor * randomFluctuation()).toFixed(2));
  const currentOrders = Math.round(baseKpiValues.orders * currentFactor * randomFluctuation());
  const currentSessions = Math.round(baseKpiValues.sessions * currentFactor * randomFluctuation());
  // Avg ticket is generally less dependent on period length for its absolute value, but can be influenced by seasonality over longer/shorter periods
  const currentAvgTicket = parseFloat((baseKpiValues.avg_ticket * (0.95 + Math.random() * 0.1)).toFixed(2));

  // Calculate values for previous period to determine pct_change
  const previousRevenue = parseFloat((baseKpiValues.revenue * previousFactor * randomFluctuation()).toFixed(2));
  const previousOrders = Math.round(baseKpiValues.orders * previousFactor * randomFluctuation());
  const previousSessions = Math.round(baseKpiValues.sessions * previousFactor * randomFluctuation());
  const previousAvgTicket = parseFloat((baseKpiValues.avg_ticket * (0.95 + Math.random() * 0.1)).toFixed(2));

  const calculatePctChange = (current: number, previous: number): number => {
    if (previous === 0) return current === 0 ? 0 : 100; // Avoid division by zero
    return parseFloat((((current - previous) / previous) * 100).toFixed(2));
  };

  return [
    { key: "revenue", label: "Revenue", value: currentRevenue, unit: "EUR", pct_change: calculatePctChange(currentRevenue, previousRevenue) },
    { key: "avg_ticket", label: "Average ticket", value: currentAvgTicket, unit: "EUR", pct_change: calculatePctChange(currentAvgTicket, previousAvgTicket) },
    { key: "orders", label: "Orders", value: currentOrders, unit: null, pct_change: calculatePctChange(currentOrders, previousOrders) },
    { key: "sessions", label: "Sessions", value: currentSessions, unit: null, pct_change: calculatePctChange(currentSessions, previousSessions) }
  ];
};


// Helper function to filter and map data for a given date range
const getDataForRange = (
  range: DateRangeType,
  allDates: string[],
  allOrders: number[],
  allConv: number[]
): { orders: number[]; conv: number[]; rangeDates: string[] } => {
  const rangeDatesStrings: string[] = [];
  const ordersInRange: number[] = [];
  const convInRange: number[] = [];

  const actualDatesInRange = eachDayOfInterval({ start: range.from, end: range.to });

  actualDatesInRange.forEach(dateInInterval => {
    const dateStr = formatISO(dateInInterval, { representation: 'date' });
    const index = allDates.indexOf(dateStr);
    if (index !== -1) {
      rangeDatesStrings.push(dateStr);
      ordersInRange.push(allOrders[index]);
      convInRange.push(allConv[index] / 100); // Convert to decimal for chart
    } else {
      // If data for a specific date in the range is missing in base, pad with 0 or a sensible default
      rangeDatesStrings.push(dateStr); // Still include the date for X-axis consistency
      ordersInRange.push(0);
      convInRange.push(0);
    }
  });

  return { orders: ordersInRange, conv: convInRange, rangeDates: rangeDatesStrings };
};


export const getTrendDataForPeriod = (
  currentPeriod: DateRangeType,
  comparisonPeriod: DateRangeType,
  base: typeof trendDataBase = trendDataBase
) => {

  const currentData = getDataForRange(
    currentPeriod,
    base.dates,
    base.orders_last_period,
    base.conv_last_period
  );

  const previousData = getDataForRange(
    comparisonPeriod,
    base.dates,
    base.orders_last_period,
    base.conv_last_period
  );
  
  // The X-axis dates should be from the current period.
  // Previous period data needs to be aligned to the current period's dates for comparison.
  // This simple alignment assumes both arrays represent consecutive data points for their respective ranges.
  // For more complex scenarios (e.g., comparing Monday to a Wednesday), a more sophisticated alignment might be needed.
  // Here, we assume we just need to pad/truncate to match the length of the current period's dates.

  const alignDataToLength = (dataArray: number[], targetLength: number, padValue = 0): number[] => {
    if (dataArray.length === targetLength) return dataArray;
    if (dataArray.length < targetLength) {
      // Pad at the beginning if shorter, assuming we want to align end dates
      return [...Array(targetLength - dataArray.length).fill(padValue), ...dataArray];
    }
    // Truncate from the beginning if longer
    return dataArray.slice(dataArray.length - targetLength);
  };
  
  const targetLength = currentData.rangeDates.length;

  return {
    dates: currentData.rangeDates, // Dates for the X-axis
    currentPeriodOrders: alignDataToLength(currentData.orders, targetLength),
    previousPeriodOrders: alignDataToLength(previousData.orders, targetLength),
    currentPeriodConv: alignDataToLength(currentData.conv, targetLength),
    previousPeriodConv: alignDataToLength(previousData.conv, targetLength),
  };
};


export const detailMetricsData = {
  popularProductsWithoutStock: Math.floor(Math.random() * 15) + 5,
  ordersWithPaymentsInAuthorization: Math.floor(Math.random() * 5),
  ordersInLastHour: Math.floor(166 * (0.8 + Math.random() * 0.4)), // Example: orders / 24 * fluctuation
};


export type SalesFunnelStep = {
  step: string;
  count: number;
  pct: number;
  conversionFromPrev?: number;
  delta_pp: number;
};

export const getSalesFunnelData = (currentRange: DateRangeType): SalesFunnelStep[] => {
  const daysInRange = differenceInDays(currentRange.to, currentRange.from) + 1;
  const factor = calculateFactor(daysInRange);
  const randomFluctuation = () => 0.98 + Math.random() * 0.04;

  const ordersForFunnel = Math.round(baseKpiValues.orders * factor * randomFluctuation());
  const sessionsForFunnel = Math.round(baseKpiValues.sessions * factor * randomFluctuation());
  const calculatedCRForFunnel = sessionsForFunnel > 0 ? parseFloat(((ordersForFunnel / sessionsForFunnel) * 100).toFixed(1)) : 0;

  const rawFunnelSteps = [
    { step: "Total sessions", count: sessionsForFunnel, delta_pp_base: 0 },
    { step: "Product page sessions", count: Math.round(sessionsForFunnel * (0.55 + Math.random() * 0.1)), delta_pp_base: 8 },
    { step: "Cart sessions", count: Math.round(sessionsForFunnel * (0.04 + Math.random() * 0.02)), delta_pp_base: 1 },
    { step: "Shipping sessions", count: Math.round(sessionsForFunnel * (0.020 + Math.random() * 0.01)), delta_pp_base: 0.5 },
    { step: "Payment sessions", count: Math.round(sessionsForFunnel * ((calculatedCRForFunnel / 100) * (1.1 + Math.random() * 0.2))), delta_pp_base: 0.3 },
    { step: "Orders", count: ordersForFunnel, delta_pp_base: 0.2 }
  ];

  return rawFunnelSteps.map((current, index, arr) => {
    const pct = arr[0].count > 0 ? (current.count / arr[0].count) * 100 : 0;
    let conversionFromPrev: number | undefined = undefined;
    if (index > 0 && arr[index - 1].count > 0) {
      conversionFromPrev = (current.count / arr[index - 1].count) * 100;
    }
    return {
      ...current,
      pct: parseFloat(pct.toFixed(1)),
      conversionFromPrev: conversionFromPrev ? parseFloat(conversionFromPrev.toFixed(1)) : undefined,
      delta_pp: parseFloat(((Math.random() - 0.5) * current.delta_pp_base).toFixed(2))
    };
  });
};


export type Product = {
  id: string;
  name: string;
  revenue: number;
  pct_change: number;
  img_url: string;
};

const baseTopProducts: Product[] = [
  {"id": "1", "name":"Consola PS5 Standard Digital Edition","revenue": 1_250_345.75,"pct_change": parseFloat(((Math.random() - 0.4) * 25).toFixed(2)),"img_url":"https://picsum.photos/40/40?random=1"},
  {"id": "2", "name":"Smart LED Google TV RCA 55\" UHD 4K","revenue": 880_112.50,"pct_change":parseFloat(((Math.random() - 0.4) * 25).toFixed(2)),"img_url":"https://picsum.photos/40/40?random=2"},
  {"id": "3", "name":"Smart LED Google TV TCL 55\" UHD 4K","revenue": 750_980.90,"pct_change":parseFloat(((Math.random() - 0.6) * 20).toFixed(2)),"img_url":"https://picsum.photos/40/40?random=3"},
  {"id": "4", "name":"iPhone 15 Pro Max 256GB Titanium Blue","revenue": 1_850_670.20,"pct_change":parseFloat(((Math.random() - 0.3) * 30).toFixed(2)),"img_url":"https://picsum.photos/40/40?random=4"},
  {"id": "5", "name":"Samsung Galaxy S24 Ultra 512GB","revenue": 1_675_320.00,"pct_change":parseFloat(((Math.random() - 0.6) * 15).toFixed(2)),"img_url":"https://picsum.photos/40/40?random=5"},
  {"id": "6", "name":"MacBook Air M3 Chip 13-inch","revenue": 1_100_850.30,"pct_change":parseFloat(((Math.random() - 0.4) * 20).toFixed(2)),"img_url":"https://picsum.photos/40/40?random=6"},
  {"id": "7", "name":"Logitech MX Master 3S Wireless Mouse","revenue": 95_234.80,"pct_change":parseFloat(((Math.random() - 0.5) * 10).toFixed(2)),"img_url":"https://picsum.photos/40/40?random=7"}
];

export const getTopProductsData = (currentRange: DateRangeType): Product[] => {
  const daysInRange = differenceInDays(currentRange.to, currentRange.from) + 1;
  const factor = calculateFactor(daysInRange);

  return baseTopProducts.map(p => ({
    ...p,
    revenue: parseFloat((p.revenue * factor * (0.95 + Math.random() * 0.1)).toFixed(2)),
    // For simplicity, pct_change is randomized here. A real scenario would compare to a previous period.
    pct_change: parseFloat(((Math.random() -0.5) * 30).toFixed(2))
  })).sort((a,b) => b.revenue - a.revenue);
};


export const periodOptions = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7", label: "Last 7 Days" },
  { value: "last28", label: "Last 28 Days" },
  { value: "last365", label: "Last Year" },
  { value: "custom", label: "Custom Range..." },
];

export const comparisonOptions = [
  { value: "previous_period", label: "Previous Period" },
  { value: "previous_year", label: "Previous Year" },
  { value: "custom", label: "Custom Range..." },
];

export function getDefaultDateRange(periodKey: string): DateRangeType {
  const today = new Date();
  let fromDate, toDate = endOfDay(today);

  switch (periodKey) {
    case 'today':
      fromDate = startOfDay(today);
      break;
    case 'yesterday':
      fromDate = startOfDay(subDays(today, 1));
      toDate = endOfDay(subDays(today, 1));
      break;
    case 'last7':
      fromDate = startOfDay(subDays(today, 6));
      break;
    case 'last365':
      fromDate = startOfDay(subDays(today, 364));
      break;
    case 'last28':
    default:
      fromDate = startOfDay(subDays(today, 27));
      break;
  }
  return { from: fromDate, to: toDate };
}

export function getComparisonDateRange(
  currentRange: DateRangeType,
  comparisonKey: string,
  customComparisonRange?: DateRangeType
): DateRangeType {
  const { from: currentFrom, to: currentTo } = currentRange;

  if (comparisonKey === "custom" && customComparisonRange) {
    return {
        from: startOfDay(customComparisonRange.from),
        to: endOfDay(customComparisonRange.to)
    };
  }

  if (comparisonKey === "previous_year") {
    return {
      from: startOfDay(subDays(currentFrom, 365)),
      to: endOfDay(subDays(currentTo, 365)),
    };
  }

  // Default to "previous_period"
  const duration = differenceInDays(currentTo, currentFrom); // duration is 0 for 1 day, 6 for 7 days.
  const prevTo = endOfDay(subDays(currentFrom, 1));
  const prevFrom = startOfDay(subDays(prevTo, duration));
  return { from: prevFrom, to: prevTo };
}
