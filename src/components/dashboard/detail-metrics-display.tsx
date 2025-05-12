
import { detailMetricsData } from '@/data/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DetailMetricsDisplay() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <Card className="shadow-sm rounded-lg">
            <CardContent className="p-4">
                <p className="text-muted-foreground">Popular products without stock</p>
                <p className="font-semibold text-lg text-foreground">{detailMetricsData.popularProductsWithoutStock}</p>
            </CardContent>
        </Card>
        <Card className="shadow-sm rounded-lg">
            <CardContent className="p-4">
                <p className="text-muted-foreground">Orders with payments in authorization</p>
                <p className="font-semibold text-lg text-foreground">{detailMetricsData.ordersWithPaymentsInAuthorization}</p>
            </CardContent>
        </Card>
        <Card className="shadow-sm rounded-lg">
            <CardContent className="p-4">
                <p className="text-muted-foreground">Orders in the last hour</p>
                <p className="font-semibold text-lg text-foreground">{detailMetricsData.ordersInLastHour}</p>
            </CardContent>
        </Card>
    </div>
  );
}

export function DetailMetricsDisplaySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="shadow-sm rounded-lg">
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
