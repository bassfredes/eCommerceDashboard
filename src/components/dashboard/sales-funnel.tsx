import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { SalesFunnelStep } from "@/data/mock-data";
import { HelpCircle, TrendingDown, TrendingUp } from "lucide-react";

interface SalesFunnelProps {
  data: SalesFunnelStep[];
}

export function SalesFunnel({ data }: SalesFunnelProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="shadow-lg rounded-xl">
        <CardHeader className="pb-4">
          <div className="flex items-baseline justify-between">
            <div className="flex items-center">
              <CardTitle className="text-xl font-semibold text-foreground">Sales Funnel</CardTitle>
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" aria-label="Sales funnel information" className="ml-1.5 text-muted-foreground hover:text-foreground transition-colors">
                      <HelpCircle className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>This visualization shows the customer journey through key stages of your online store, from initial visit to final purchase. Each bar represents a stage, and its height indicates the percentage of users who reached that stage relative to the total initial sessions. The tooltips provide detailed metrics for each stage, including absolute numbers, conversion from the previous stage, and performance comparison against the prior period. Analyzing drop-off points helps identify areas for conversion rate optimization.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-xs text-muted-foreground">(Online store only)</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No sales funnel data available.</p>
        </CardContent>
      </Card>
    );
  }

  const totalSessions = data[0]?.count || 0;

  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader className="pb-4">
        <div className="flex items-baseline justify-between">
          <div className="flex items-center">
            <CardTitle className="text-xl font-semibold text-foreground">Sales Funnel</CardTitle>
            <span className="ml-2 text-xs text-muted-foreground font-normal">Online store only</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2 pb-0 px-0">
        <div className="relative flex items-end justify-between bg-muted/40 rounded-lg overflow-hidden border border-border/60 py-4 space-x-1">
          {data.map((step, index) => {
            const isFirst = index === 0;
            const isLast = index === data.length - 1;
            const isPositive = step.delta_pp >= 0;
            const barHeight = isFirst ? 200 : Math.max(16, (step.pct / 100) * 200);
            return (
              <div key={step.step} className={`flex flex-col items-center w-full relative ${!isLast ? 'border-r border-border/60' : ''}`} style={{ minWidth: 0 }}>
                <div className="mb-1 text-xs font-medium text-foreground whitespace-nowrap" style={{ minHeight: 20 }}>
                  {isFirst ? '100%' : `${step.pct.toFixed(1)}%`}
                </div>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="flex flex-col items-center justify-end w-full group cursor-pointer"
                        style={{ minWidth: 0 }}
                      >
                        <div
                          className="w-8 sm:w-10 md:w-12 bg-primary/20 group-hover:bg-primary/30 transition-colors duration-200 rounded-t-md relative"
                          style={{ height: `${barHeight}px`, minHeight: 16, maxHeight: 200 }}
                          role="progressbar"
                          aria-valuenow={step.count}
                          aria-valuemin={0}
                          aria-valuemax={data[0]?.count || 1}
                          aria-label={`${step.step} count: ${step.count.toLocaleString('en-US')}`}
                        >
                          {!isLast && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-200" style={{ zIndex: 1 }} />
                          )}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-popover text-popover-foreground shadow-xl rounded-md p-2 text-xs max-w-xs">
                      <p className="font-semibold">{step.step}</p>
                      <p>Users: {step.count.toLocaleString('en-US')}</p>
                      <p>Global conversion: {step.pct.toFixed(1)}%</p>
                      {index > 0 && (
                        <p>Conversion from previous stage: {((step.count / data[index-1].count) * 100).toFixed(1)}%</p>
                      )}
                      {index > 0 && (
                        <p className="flex items-center">
                          Perf. vs previous period:
                          <span className={`ml-1 flex items-center ${step.delta_pp < 0 ? "text-destructive" : "text-[hsl(var(--positive))]"}`}>
                            {step.delta_pp < 0 ? <TrendingDown className="h-3 w-3 mr-0.5" /> : <TrendingUp className="h-3 w-3 mr-0.5" />}
                            {step.delta_pp.toFixed(2)} p.p.
                          </span>
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="text-base text-muted-foreground mt-2 font-medium">
                  {step.count.toLocaleString('en-US')}
                </div>
                {index > 0 && (
                  <div className={`text-xs flex items-center mb-1 ${isPositive ? 'text-[hsl(var(--positive))]' : 'text-destructive'}`}> 
                    {isPositive ? '+' : ''}{step.delta_pp.toFixed(2)} p.p.
                    <span className="ml-1">{isPositive ? '▲' : '▼'}</span>
                  </div>
                )}
                <div className="text-xs text-muted-foreground min-h-[18px]">{!isFirst && 'vs. previous period'}</div>
                <div className="text-xs text-muted-foreground mt-2 text-center h-10 flex items-center justify-center">
                  {step.step}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function SalesFunnelSkeleton() {
  const [skeletonHeights, setSkeletonHeights] = React.useState<string[]>([]);

  React.useEffect(() => {
    // Generate random heights only on the client-side after initial mount
    const heights = Array.from({ length: 6 }).map(() => `${Math.random() * 80 + 20}%`);
    setSkeletonHeights(heights);
  }, []);

  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader className="pb-4">
        <div className="flex items-baseline justify-between">
          <div className="flex items-center">
            <Skeleton className="h-6 w-24" /> {/* Title "Sales Funnel" */}
            <Skeleton className="h-4 w-4 ml-1.5" /> {/* Icon */}
          </div>
          <Skeleton className="h-3 w-28" /> {/* Subtitle "(Online store only)" */}
        </div>
      </CardHeader>
      <CardContent className="px-0 sm:px-2 md:px-4 pt-4">
        <div className="relative flex items-end justify-around h-[350px] border-b border-border pb-4 space-x-1">
          {skeletonHeights.length > 0 
            ? skeletonHeights.map((height, index) => (
                <div key={index} className="flex flex-col items-center justify-end h-full w-full max-w-[100px]">
                  <Skeleton className="w-full bg-muted/50 rounded-t-md" style={{ height }} />
                  <Skeleton className="h-4 w-3/4 mt-2" />
                </div>
              ))
            : Array.from({ length: 6 }).map((_, index) => ( // Fallback for initial server render / before useEffect
                <div key={index} className="flex flex-col items-center justify-end h-full w-full max-w-[100px]">
                  <Skeleton className="w-full bg-muted/50 rounded-t-md" style={{ height: '50%' }} /> 
                  <Skeleton className="h-4 w-3/4 mt-2" />
                </div>
              ))
          }
        </div>
      </CardContent>
    </Card>
  );
}
