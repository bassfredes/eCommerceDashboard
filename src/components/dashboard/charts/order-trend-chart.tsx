"use client"

import React from "react"
import { Area, Line, LineChart, CartesianGrid, Dot, Tooltip, XAxis, YAxis, Legend, ReferenceLine } from "recharts"
import { format } from 'date-fns';
import {
  ChartContainer,
  ChartTooltip as ChartTooltipPrimitive,
  ChartTooltipContent,
  ChartLegend, 
  ChartLegendContent, 
  type ChartConfig,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"

interface OrderTrendChartProps {
  data: {
    dates: string[];
    currentPeriodOrders: number[];
    previousPeriodOrders: number[];
  };
}

const chartConfig = {
  currentPeriodOrders: {
    label: "Orders (Current Period)",
    color: "hsl(var(--primary))", 
  },
  previousPeriodOrders: {
    label: "Orders (Previous Period)",
    color: "hsl(var(--chart-2))", 
  }
} satisfies ChartConfig

export function OrderTrendChart({ data }: OrderTrendChartProps) {
  const chartData = data.dates.map((dateString, index) => {
    return {
        date: dateString,
        displayDate: format(new Date(dateString), 'dd/MM'),
        currentPeriodOrders: data.currentPeriodOrders[index],
        previousPeriodOrders: data.previousPeriodOrders[index],
    };
  });

  const yAxisTicks = [0, 250, 500, 750, 1000];

  return (
    <ChartContainer config={chartConfig} className="w-full h-full min-h-[180px] sm:min-h-[220px] md:min-h-[320px]">
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 0,
          right: 0,
          top: 24,
          bottom: 10,
        }}
        width={undefined}
        height={undefined}
      >
        <CartesianGrid
          vertical={true}
          horizontal={true}
          stroke="#e5e7eb" // gris claro tailwind slate-200
          strokeDasharray="3 3"
        />
        <XAxis
          dataKey="displayDate"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickCount={8}
          interval="preserveStartEnd"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          domain={[0, 1000]}
          ticks={yAxisTicks}
          tickFormatter={(value) => Number(value).toFixed(0)}
        />
        <ChartTooltipPrimitive
          cursor={{ stroke: "hsl(var(--border))", strokeDasharray: "3 3" }}
          shared={true}
          trigger="hover"
          content={
            <ChartTooltipContent
              indicator="dot"
              labelFormatter={(label, payload) => {
                if (payload && payload.length > 0 && payload[0].payload.date) {
                  return format(new Date(payload[0].payload.date), "PPP");
                }
                return label;
              }}
              formatter={(value, name, props) => {
                const configKey = props.dataKey as keyof typeof chartConfig;
                const config = chartConfig[configKey];
                // Forzar color gris claro para previousPeriodOrders en el tooltip
                const colorValue =
                  configKey === "previousPeriodOrders"
                    ? "#b0b0b0"
                    : config?.color;
                return (
                  <div className="flex items-center">
                    <span
                      className="mr-2 h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: colorValue }}
                    />
                    <span>
                      {config?.label || name}: {Number(value).toLocaleString()}
                    </span>
                  </div>
                );
              }}
            />
          }
        />
        <Legend
          verticalAlign="top"
          align="center"
          wrapperStyle={{ top: 0, right: 0, left: 0, lineHeight: "20px", width: "100%", padding: 0, margin: 0 }}
          content={<ChartLegendContent />}
        />
        <Line
          dataKey="previousPeriodOrders"
          name={chartConfig.previousPeriodOrders.label}
          type="monotone"
          stroke="#888888" // gris visible
          strokeWidth={2}
          dot={false}
          activeDot={false}
          strokeDasharray="4 2"
        />
        <Line
          dataKey="currentPeriodOrders"
          name={chartConfig.currentPeriodOrders.label}
          type="monotone"
          stroke="var(--color-currentPeriodOrders)"
          strokeWidth={2}
          dot={({ key, ...restProps }) => (
            <Dot
              key={key}
              {...restProps}
              r={4}
              fill="var(--color-currentPeriodOrders)"
              stroke="hsl(var(--card))"
              strokeWidth={1}
            />
          )}
          activeDot={{ r: 6, strokeWidth: 1, stroke: "hsl(var(--card))" }}
        />
        <ReferenceLine
          y={0}
          stroke="hsl(var(--chart-grid-color))"
          strokeDasharray="3 3"
          ifOverflow="visible"
        />
      </LineChart>
    </ChartContainer>
  );
}

export function OrderTrendChartSkeleton() {
  return <Skeleton className="h-[300px] w-full rounded-md" />;
}

