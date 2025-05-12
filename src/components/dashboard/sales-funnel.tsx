
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
      <CardContent className="px-0 sm:px-2 md:px-4 pt-4">
        <TooltipProvider delayDuration={100}>
          <div className="relative flex items-end justify-around h-[350px] border-b border-border pb-4 space-x-1">
            {data.map((step, index) => {
              const barHeightPercentage = totalSessions > 0 ? (step.count / totalSessions) * 100 : 0;
              const displayBarHeight = Math.max(5, barHeightPercentage); // Minimum height for visibility
              
              let conversionFromPrevStage = 0;
              if (index > 0 && data[index-1] && data[index-1].count > 0) {
                  conversionFromPrevStage = (step.count / data[index-1].count) * 100;
              }

              return (
                <Tooltip key={step.step}>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center justify-end h-full w-full max-w-[100px] cursor-default group">
                      <div 
                        className="w-full bg-primary/20 hover:bg-primary/30 transition-colors duration-200 rounded-t-md relative"
                        style={{ height: `${displayBarHeight}%` }}
                        role="progressbar"
                        aria-valuenow={step.count}
                        aria-valuemin={0}
                        aria-valuemax={totalSessions}
                        aria-label={`${step.step} count: ${step.count.toLocaleString('de-DE')}`}
                      >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-foreground whitespace-nowrap">
                          {step.pct.toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2 text-center h-10 flex items-center justify-center">
                        {step.step}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-popover text-popover-foreground shadow-xl rounded-md p-2 text-xs max-w-xs">
                    <p className="font-semibold">{step.step}</p>
                    <p>Users: {step.count.toLocaleString('de-DE')}</p>
                    <p>Overall Conversion: {step.pct.toFixed(1)}%</p>
                    {index > 0 && conversionFromPrevStage > 0 && (
                        <p>Conversion from prev. stage: {conversionFromPrevStage.toFixed(1)}%</p>
                    )}
                    <p className="flex items-center">
                        Perf. vs prev. period: 
                        <span className={`ml-1 flex items-center ${step.delta_pp < 0 ? "text-destructive" : "text-[hsl(var(--positive))]"}`}>
                            {step.delta_pp < 0 ? <TrendingDown className="h-3 w-3 mr-0.5" /> : <TrendingUp className="h-3 w-3 mr-0.5" />}
                            {step.delta_pp.toFixed(2)} p.p.
                        </span>
                    </p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
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
