import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import type { Order } from "../types/order";
// import { formatCurrency } from "../utils/formatters";

interface OrderStatsProps {
  meta: {
    total: number;
    cancelled: number;
    deliveried: number;
    // totalRevenue: number;
  };
}

export function OrderStats({ meta }: OrderStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{meta.total}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Đã hủy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{meta.cancelled}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Đã giao</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{meta.deliveried}</div>
        </CardContent>
      </Card>
      {/* <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totalRevenue)}
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
