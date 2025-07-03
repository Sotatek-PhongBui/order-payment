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
}: OrderDetailModalProps) {
  if (!order) return null;

  const handleCancelOrder = () => {
    onCancelOrder(order.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết đơn hàng {order.id}</DialogTitle>
          <DialogDescription>Thông tin chi tiết về đơn hàng</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Khách hàng</Label>
              <p className="text-sm">{order.customerName}</p>
              <p className="text-sm text-muted-foreground">
                {order.customerEmail}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Trạng thái</Label>
              <div className="mt-1">
                <Badge className={statusColors[order.status]}>
                  {statusLabels[order.status]}
                </Badge>
              </div>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">Địa chỉ giao hàng</Label>
            <p className="text-sm">{order.shippingAddress}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Sản phẩm</Label>
            <div className="mt-2 space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-2 border rounded"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Số lượng: {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <p className="font-medium">
                    {formatCurrency(item.quantity * item.price)}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center pt-4 border-t">
            <span className="font-medium">Tổng tiền:</span>
            <span className="text-lg font-bold">
              {formatCurrency(order.total)}
            </span>
          </div>
          <div>
            <Label className="text-sm font-medium">Ngày tạo</Label>
            <p className="text-sm">{formatDate(order.createdAt)}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          {order.status !== "cancelled" && order.status !== "deliveried" && (
            <Button variant="destructive" onClick={handleCancelOrder}>
              Hủy đơn hàng
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
