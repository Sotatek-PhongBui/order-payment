"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import type { Order, OrderItem } from "../types/order";
import { formatCurrency } from "../utils/formatters";

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateOrder: (order: Order) => void;
}

interface NewOrderForm {
  userId: string;
  items: OrderItem[];
}

const PRODUCTS = [
  {
    id: "405e4872-4b40-4c71-8e93-c0536249393b",
    name: "ga ran",
    description: "gan ran siu ngol",
    price: 200000,
  },
  {
    id: "89e2968f-d18d-4450-a8a9-b320f242f7d1",
    name: "coca",
    description: "coca siu ngol",
    price: 15000,
  },
  {
    id: "b5744947-7613-407e-8c3a-467640015d63",
    name: "khoai tay chien",
    description: "khoai tay chien siu ngol",
    price: 50000,
  },
];

export function CreateOrderModal({
  isOpen,
  onClose,
  onCreateOrder,
}: CreateOrderModalProps) {
  const [newOrder, setNewOrder] = useState<NewOrderForm>({
    userId: "",
    items: [{ productId: PRODUCTS[0].id, quantity: 1 } as OrderItem],
  });

  const handleCreateOrder = () => {
    const order: Order = {
      userId: newOrder.userId,
      status: "created",
      items: newOrder.items.map((item) => ({
        ...item,
      })) as OrderItem[],
      createdAt: new Date().toISOString(),
    } as Order;

    onCreateOrder(order);
    onClose();
    setNewOrder({
      userId: "",
      items: [{ productId: PRODUCTS[0].id, quantity: 1 } as OrderItem],
    });
  };

  const addOrderItem = () => {
    setNewOrder({
      ...newOrder,
      items: [
        ...newOrder.items,
        { productId: PRODUCTS[0].id, quantity: 1 } as OrderItem,
      ],
    });
  };

  const removeOrderItem = (index: number) => {
    setNewOrder({
      ...newOrder,
      items: newOrder.items.filter((_, i) => i !== index),
    });
  };

  const updateOrderItem = (
    index: number,
    field: keyof (typeof newOrder.items)[0],
    value: string | number
  ) => {
    const updatedItems = newOrder.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setNewOrder({ ...newOrder, items: updatedItems });
  };

  const total = newOrder.items.reduce((sum, item) => {
    const product = PRODUCTS.find((p) => p.id === item.productId);
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo đơn hàng mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin để tạo đơn hàng mới
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="userId">User Id</Label>
            <Input
              id="userId"
              value={newOrder.userId}
              onChange={(e) =>
                setNewOrder({ ...newOrder, userId: e.target.value })
              }
              placeholder="Nhập User Id"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Sản phẩm</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOrderItem}
              >
                <Plus className="h-4 w-4 mr-1" />
                Thêm sản phẩm
              </Button>
            </div>
            {newOrder.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                <div className="col-span-6">
                  <Select
                    value={item.productId}
                    onValueChange={(value) =>
                      updateOrderItem(index, "productId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn sản phẩm" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCTS.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({formatCurrency(product.price)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-4">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateOrderItem(
                        index,
                        "quantity",
                        Number.parseInt(e.target.value) || 1
                      )
                    }
                  />
                </div>
                <div className="col-span-2">
                  {newOrder.items.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOrderItem(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="text-right">
            <strong>Tổng tiền: {formatCurrency(total)}</strong>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleCreateOrder}>Tạo đơn hàng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
