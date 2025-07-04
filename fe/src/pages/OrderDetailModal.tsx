"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { Order } from "../types/order";
import { statusColors, statusLabels } from "../utils/constants";
import { formatCurrency, formatDate } from "../utils/formatters";
// import { PRODUCTS } from "../data/mockProduct";
import { useQuery } from "@tanstack/react-query";
import { fetchOrderDetail } from "@/data/api";

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelOrder: (orderId: string) => void;
}

export function OrderDetailModal({
  order,
  isOpen,
  onClose,
  onCancelOrder,
}: // onCancelOrder,
OrderDetailModalProps) {
  const orderId = order?.id ?? "";
  const {
    data: orderDetail,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["order", orderId],
    enabled: !!orderId && isOpen,
    queryFn: () => fetchOrderDetail(orderId),
  });

  if (!order) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>Không có đơn hàng nào được chọn</DialogContent>
      </Dialog>
    );
  }

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>Loading...</DialogContent>
      </Dialog>
    );
  }

  if (isError || !orderDetail) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>Error loading order detail</DialogContent>
      </Dialog>
    );
  }

  const total = (orderDetail.items ?? []).reduce((sum, item) => {
    return sum + item.quantity * item.production.price;
  }, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết đơn hàng {orderDetail.id}</DialogTitle>
          <DialogDescription>Thông tin chi tiết về đơn hàng</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Khách hàng</Label>
              <p className="text-sm">{orderDetail.userId}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Trạng thái</Label>
              <div className="mt-1">
                <Badge className={statusColors[orderDetail.status]}>
                  {statusLabels[orderDetail.status]}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Sản phẩm</Label>
            <div className="mt-2 space-y-2">
              {(orderDetail.items ?? []).map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-2 border rounded"
                >
                  <div>
                    <p className="font-medium">{item.production.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.production.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Số lượng: {item.quantity} ×{" "}
                      {formatCurrency(item.production.price)}
                    </p>
                  </div>
                  <p className="font-medium">
                    {formatCurrency(item.quantity * item.production.price)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <span className="font-medium">Tổng tiền:</span>
            <span className="text-lg font-bold">{formatCurrency(total)}</span>
          </div>

          <div>
            <Label className="text-sm font-medium">Ngày tạo</Label>
            <p className="text-sm">{formatDate(orderDetail.createdAt)}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          {orderDetail.status !== "cancelled" &&
            orderDetail.status !== "deliveried" && (
              <Button
                variant="destructive"
                onClick={() => onCancelOrder(orderId)}
              >
                Hủy đơn hàng
              </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
