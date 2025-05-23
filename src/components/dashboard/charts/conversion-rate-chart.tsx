"use client"

import * as React from "react"
import { Line, LineChart, CartesianGrid, Dot, Tooltip, XAxis, YAxis, Legend } from "recharts"
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

interface ConversionRateChartProps {
  data: {
    dates: string[];
    currentPeriodConv: number[];
    previousPeriodConv: number[];
  };
}

const chartConfig = {
  currentPeriodConv: {
    label: "Current Period", 
    color: "hsl(var(--primary))", 
  },
  previousPeriodConv: {
    label: "Previous Period",
    color: "hsl(var(--chart-2))", 
  },
} satisfies ChartConfig

export function ConversionRateChart({ data }: ConversionRateChartProps) {
  const chartData = data.dates.map((dateString, index) => {
    return {
      date: dateString,
      displayDate: format(new Date(dateString), 'dd/MM'),
      currentPeriodConv: data.currentPeriodConv[index],
      previousPeriodConv: data.previousPeriodConv[index],
    };
  });

  const yAxisTicks = [0, 0.003, 0.006, 0.009, 0.012]; 

  return (
    <ChartContainer config={chartConfig} className="w-full h-[220px] md:h-[320px]">
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
          strokeDasharray="3 3"
          stroke="#e5e7eb" // gris claro tailwind slate-200
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
          domain={[0, 0.012]}
          ticks={yAxisTicks}
          tickFormatter={(value) => `${(value * 100).toFixed(1)}%`}
        />
        <ChartTooltipPrimitive
          cursor={{ stroke: "hsl(var(--border))", strokeDasharray: "3 3" }}
          shared={true}
          trigger="hover"
          content={(props: any) => {
            // Ordenar tooltip: primero previousPeriodConv, luego currentPeriodConv
            const orderedPayload = props?.payload ? [...props.payload] : [];
            orderedPayload.sort((a: any, b: any) => {
              if (a.dataKey === "previousPeriodConv") return -1;
              if (b.dataKey === "previousPeriodConv") return 1;
              return 0;
            });
            return (
              <ChartTooltipContent
                {...props}
                payload={orderedPayload}
                indicator="dot"
                labelFormatter={(label: any, payload: any[]) => {
                  if (
                    payload &&
                    payload.length > 0 &&
                    payload[0].payload.date
                  ) {
                    return format(new Date(payload[0].payload.date), "PPP");
                  }
                  return label;
                }}
                formatter={(value: any, name: any, props: any) => {
                  const configKey = props.dataKey as keyof typeof chartConfig;
                  const config = chartConfig[configKey];
                  // Forzar color gris claro para previousPeriodConv en el tooltip
                  const colorValue =
                    configKey === "previousPeriodConv"
                      ? "#b0b0b0"
                      : config?.color;
                  const formattedValue =
                    typeof value === "number"
                      ? `${(value * 100).toFixed(2)}%`
                      : `${value}%`;
                  return (
                    <span style={{ display: "flex", alignItems: "center" }}>
                      <span
                        className="mr-2 h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: colorValue }}
                      />
                      <span>
                        {config?.label || name}: {formattedValue}
                      </span>
                    </span>
                  );
                }}
              />
            );
          }}
        />
        <Legend
          verticalAlign="top"
          align="center"
          wrapperStyle={{ top: 0, right: 0, left: 0, padding: 0, margin: 0, lineHeight: '20px', width: '100%' }}
          content={(props) => {
            // Ordenar leyenda: primero previousPeriodConv, luego currentPeriodConv
            const items = props.payload ? [...props.payload] : [];
            items.sort((a, b) => {
              if (a.dataKey === "previousPeriodConv") return -1;
              if (b.dataKey === "previousPeriodConv") return 1;
              return 0;
            });
            return <ChartLegendContent payload={items} />;
          }}
        />
        <Line
          dataKey="currentPeriodConv"
          name={chartConfig.currentPeriodConv.label}
          type="monotone"
          stroke="var(--color-currentPeriodConv)"
          strokeWidth={2}
          dot={({ key, ...restProps }) => (
            <Dot
              key={key}
              {...restProps}
              r={4}
              fill="var(--color-currentPeriodConv)"
              stroke="hsl(var(--card))"
              strokeWidth={1}
            />
          )}
          activeDot={{ r: 6, strokeWidth: 1, stroke: "hsl(var(--card))" }}
        />
        <Line
          dataKey="previousPeriodConv"
          name={chartConfig.previousPeriodConv.label}
          type="monotone"
          stroke="#b0b0b0"
          strokeWidth={1}
          dot={false}
          activeDot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}

export function ConversionRateChartSkeleton() {
  return <Skeleton className="h-[300px] w-full rounded-md" />;
}

