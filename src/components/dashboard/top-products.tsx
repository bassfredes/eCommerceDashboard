
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/data/mock-data"; // Ensure Product type matches the one in mock-data
import { ArrowUp, ArrowDown } from 'lucide-react';

interface TopProductsProps {
  products: Product[];
}

export function TopProducts({ products }: TopProductsProps) {
  return (
    <Card className="shadow-lg rounded-xl h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">Top Highest Grossing Products</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-full p-6 pt-0"> 
          <ul className="space-y-1"> 
            {products.map((product, index) => {
              const isPositive = product.pct_change >= 0;
              return (
                <li key={product.id} className="rounded-md hover:bg-muted/60 transition-colors duration-150">
                  <div className="flex items-center space-x-3 p-2 min-h-[64px]"> 
                    <Image
                      src={product.img_url}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="rounded-md object-cover flex-shrink-0"
                      data-ai-hint="product item"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate" title={product.name}>
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        €{product.revenue.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className={`text-xs font-semibold ${isPositive ? "text-[hsl(var(--positive))]" : "text-destructive"} flex items-center whitespace-nowrap`}>
                      {isPositive ? <ArrowUp className="h-3 w-3 mr-0.5" /> : <ArrowDown className="h-3 w-3 mr-0.5" />}
                      {Math.abs(product.pct_change).toFixed(2)}%
                    </div>
                  </div>
                  {index < products.length - 1 && <Separator className="my-0 mx-2 border-border/60" />} 
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export function TopProductsSkeleton() {
  return (
    <Card className="shadow-lg rounded-xl h-full flex flex-col">
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-full p-6 pt-0">
          <ul className="space-y-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <li key={index}>
                <div className="flex items-center space-x-3 p-2 min-h-[64px]">
                  <Skeleton className="h-10 w-10 rounded-md flex-shrink-0" />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-3 w-3/5" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
                {index < 4 && <Separator className="my-0 mx-2" />}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
