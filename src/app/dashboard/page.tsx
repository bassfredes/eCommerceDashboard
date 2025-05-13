"use client";
import * as React from "react";
import type { DateRange } from "react-day-picker";
import { AppHeader } from "@/components/layout/app-header";
import { PeriodSelector } from "@/components/dashboard/period-selector";
import { KpiCard, KpiCardProps, KpiCardSkeleton } from "@/components/dashboard/kpi-card";
import { DetailMetricsDisplay, DetailMetricsDisplaySkeleton } from "@/components/dashboard/detail-metrics-display";
import { OrderTrendChart, OrderTrendChartSkeleton } from "@/components/dashboard/charts/order-trend-chart";
import { ConversionRateChart, ConversionRateChartSkeleton } from "@/components/dashboard/charts/conversion-rate-chart";
import { SalesFunnel, SalesFunnelSkeleton } from "@/components/dashboard/sales-funnel";
import { TopProducts, TopProductsSkeleton } from "@/components/dashboard/top-products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";

import {
  getKpiData,
  getTrendDataForPeriod,
  getTopProductsData,
  getSalesFunnelData,
  detailMetricsData as staticDetailMetricsData, // This can remain static or be made dynamic
  Kpi as KpiType,
  Product as ProductType,
  SalesFunnelStep,
  DateRangeType,
  getDefaultDateRange,
  getComparisonDateRange,
} from "@/data/mock-data";

interface TrendChartDataType {
  dates: string[];
  currentPeriodOrders: number[];
  previousPeriodOrders: number[];
  currentPeriodConv: number[];
  previousPeriodConv: number[];
}

// Define a type for the data structure that kpiCardsData will hold, including the 'key' for React.
interface KpiCardDataForRender extends KpiCardProps {
  key: string; // The identifier like "revenue", "avg_ticket"
}


const kpiDescriptions: Record<string, string> = {
  revenue: "Total income from sales before deducting costs. It indicates the overall financial performance and market demand for your products/services within the selected period. A rising revenue trend is generally positive, while a decline may signal a need for strategic adjustments.",
  avg_ticket: "Average amount spent by a customer in a single order (Revenue / Orders). A higher average ticket can signify successful upselling, cross-selling strategies, or increased purchases of higher-value products. Analyzing this helps optimize pricing and product bundling.",
  orders: "Total number of completed transactions or purchases. This metric reflects customer demand and the effectiveness of your sales process during the chosen timeframe. An increase in orders usually indicates business growth and successful marketing efforts.",
  sessions: "Total number of visits to your online store. Each session represents a period of interaction by a user. This is a key indicator of website traffic, marketing reach, and brand visibility. More sessions can lead to more conversion opportunities."
};

const MAX_DATE_FOR_PICKER = new Date(); // Today

export default function DashboardPage() {
  const [isLoading, setIsLoading] = React.useState(true);

  // State for period selection
  const [selectedPeriodKey, setSelectedPeriodKey] = React.useState("last28");
  const [customPeriod, setCustomPeriod] = React.useState<DateRange | undefined>(undefined);

  // State for comparison selection
  const [selectedComparisonKey, setSelectedComparisonKey] = React.useState("previous_period");
  const [customComparisonPeriod, setCustomComparisonPeriod] = React.useState<DateRange | undefined>(undefined);

  // Derived current and comparison ranges
  const getCurrentDateRange = React.useCallback((): DateRangeType => {
    if (selectedPeriodKey === "custom" && customPeriod?.from && customPeriod?.to) {
      return { from: customPeriod.from, to: customPeriod.to };
    }
    return getDefaultDateRange(selectedPeriodKey);
  }, [selectedPeriodKey, customPeriod]);

  const getEffectiveComparisonDateRange = React.useCallback((): DateRangeType => {
    const currentRange = getCurrentDateRange();
    let customComparisonRange: DateRangeType | undefined = undefined;
    if (
      selectedComparisonKey === "custom" &&
      customComparisonPeriod &&
      customComparisonPeriod.from &&
      customComparisonPeriod.to
    ) {
      customComparisonRange = {
        from: customComparisonPeriod.from,
        to: customComparisonPeriod.to,
      };
    }
    return getComparisonDateRange(currentRange, selectedComparisonKey, customComparisonRange);
  }, [getCurrentDateRange, selectedComparisonKey, customComparisonPeriod]);


  // Data states
  const [currentKpiData, setCurrentKpiData] = React.useState<KpiType[]>([]);
  const [currentTrendData, setCurrentTrendData] = React.useState<TrendChartDataType>({
    dates: [], currentPeriodOrders: [], previousPeriodOrders: [], currentPeriodConv: [], previousPeriodConv: []
  });
  const [currentTopProducts, setCurrentTopProducts] = React.useState<ProductType[]>([]);
  const [currentSalesFunnelData, setCurrentSalesFunnelData] = React.useState<SalesFunnelStep[]>([]);


  React.useEffect(() => {
    setIsLoading(true);
    const currentRange = getCurrentDateRange();
    const comparisonRange = getEffectiveComparisonDateRange();

    // Validate custom ranges before fetching
    if (selectedPeriodKey === "custom" && (!currentRange.from || !currentRange.to)) {
      setIsLoading(false); // Or show a message to complete selection
      setCurrentKpiData([]);
      setCurrentTrendData({ dates: [], currentPeriodOrders: [], previousPeriodOrders: [], currentPeriodConv: [], previousPeriodConv: [] });
      setCurrentTopProducts([]);
      setCurrentSalesFunnelData([]);
      return;
    }
     if (selectedComparisonKey === "custom" && (!comparisonRange.from || !comparisonRange.to)) {
      setIsLoading(false); // Or show a message to complete selection
      // Potentially only freeze comparison data if main period is valid
      // For simplicity, we might refetch with a default comparison or just show current
      // For now, if custom comparison is incomplete, we might not want to fetch or show an error/warning
      // This logic might need refinement based on desired UX for incomplete custom comparison.
      return;
    }


    const timer = setTimeout(() => {
      setCurrentKpiData(getKpiData(currentRange, comparisonRange));
      setCurrentTrendData(getTrendDataForPeriod(currentRange, comparisonRange));
      setCurrentTopProducts(getTopProductsData(currentRange));
      setCurrentSalesFunnelData(getSalesFunnelData(currentRange));
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [getCurrentDateRange, getEffectiveComparisonDateRange, selectedPeriodKey, selectedComparisonKey]); 

  const kpiCardsData: KpiCardDataForRender[] = currentKpiData.map(kpi => ({
    title: kpi.label,
    value: kpi.value,
    unit: kpi.unit,
    pctChange: kpi.pct_change,
    key: kpi.key, // This 'key' (e.g., "revenue") is used for React's key prop
    description: kpiDescriptions[kpi.key] || "Key Performance Indicator for your business."
  }));

  const handlePeriodKeyChange = (key: string) => {
    setSelectedPeriodKey(key);
    if (key !== 'custom') {
      setCustomPeriod(undefined); 
    }
  };

  const handleComparisonKeyChange = (key: string) => {
    setSelectedComparisonKey(key);
    if (key !== 'custom') {
      setCustomComparisonPeriod(undefined); 
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <PeriodSelector
            selectedPeriodKey={selectedPeriodKey}
            onPeriodKeyChange={handlePeriodKeyChange}
            customPeriod={customPeriod}
            onCustomPeriodChange={setCustomPeriod}
            selectedComparisonKey={selectedComparisonKey}
            onComparisonKeyChange={handleComparisonKeyChange}
            customComparisonPeriod={customComparisonPeriod}
            onCustomComparisonPeriodChange={setCustomComparisonPeriod}
            maxDate={MAX_DATE_FOR_PICKER}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => <KpiCardSkeleton key={index} />)
            : kpiCardsData.map(kpiItem => {
                const { key, ...restKpiProps } = kpiItem;
                return <KpiCard key={key} {...restKpiProps} isLoading={false} />;
              })
          }
        </div>

        {isLoading ? <DetailMetricsDisplaySkeleton /> : <DetailMetricsDisplay />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg rounded-xl h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">Order Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent className="h-[220px] md:h-[340px] flex flex-col justify-between">
              {isLoading ? <OrderTrendChartSkeleton /> : <OrderTrendChart data={currentTrendData} />}
            </CardContent>
          </Card>
          <Card className="shadow-lg rounded-xl h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">
                Conversion Rate <span className="text-sm text-muted-foreground">(Online store only)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[220px] md:h-[340px] flex flex-col justify-between">
              {isLoading ? <ConversionRateChartSkeleton /> : <ConversionRateChart data={currentTrendData} />}
            </CardContent>
          </Card>
        </div>

        {/* Panel de productos debajo de los gráficos, ocupando todo el ancho */}
        <div className="w-full">
          {isLoading ? <TopProductsSkeleton /> : <TopProducts products={currentTopProducts} />}
        </div>

        {isLoading ? <SalesFunnelSkeleton /> : <SalesFunnel data={currentSalesFunnelData} />}
      </main>
      <Toaster />
    </div>
  );
}
