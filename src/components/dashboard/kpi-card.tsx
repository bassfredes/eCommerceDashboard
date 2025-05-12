
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface KpiCardProps {
  title: string;
  value: number;
  unit?: string | null;
  pctChange: number;
  isLoading?: boolean;
  description?: string; 
  // key: string; // Removed: This was conflicting with React's special key prop.
}

export function KpiCard({ title, value, unit, pctChange, isLoading = false, description }: KpiCardProps) {
  if (isLoading) {
    return <KpiCardSkeleton />;
  }

  const isPositive = pctChange >= 0;
  
  let formattedValue: string;
  if (unit === "EUR") {
    formattedValue = `€${value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (unit === "ARS") { 
    formattedValue = `ARS ${value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else {
    formattedValue = value.toLocaleString('de-DE'); 
  }


  return (
    <Card className="shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {description && (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" aria-label={`${title} information`} className="ml-1.5 text-muted-foreground hover:text-foreground transition-colors">
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs p-2 bg-popover text-popover-foreground shadow-md rounded-md">
                  <p>{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold text-foreground">{formattedValue}</div>
        <p className={`text-xs ${isPositive ? "text-[hsl(var(--positive))]" : "text-destructive"} flex items-center mt-1`}>
          {isPositive ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
          {Math.abs(pctChange).toFixed(2)}%
          <span className="text-muted-foreground ml-1">vs previous period</span>
        </p>
      </CardContent>
    </Card>
  );
}

export function KpiCardSkeleton() {
  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-4 ml-1.5" /> 
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-1/2 mb-2" />
        <Skeleton className="h-4 w-1/3" />
      </CardContent>
    </Card>
  );
}

