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
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import type { Order, OrderItem } from "../types/order";
import { formatCurrency } from "../utils/formatters";

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateOrder: (order: Order) => void;
  nextOrderId: string;
}

interface NewOrderForm {
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  items: Omit<OrderItem, "id">[];
}

export function CreateOrderModal({
  isOpen,
  onClose,
  onCreateOrder,
  nextOrderId,
}: CreateOrderModalProps) {
  const [newOrder, setNewOrder] = useState<NewOrderForm>({
    customerName: "",
    customerEmail: "",
    shippingAddress: "",
    items: [{ name: "", quantity: 1, price: 0 }],
  });

  const handleCreateOrder = () => {
    const total = newOrder.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order: Order = {
      id: nextOrderId,
      customerName: newOrder.customerName,
      customerEmail: newOrder.customerEmail,
      status: "created",
      total,
      items: newOrder.items.map((item, index) => ({
        id: String(index + 1),
        ...item,
      })),
      createdAt: new Date().toISOString(),
      shippingAddress: newOrder.shippingAddress,
    };

    onCreateOrder(order);
    onClose();
    setNewOrder({
      customerName: "",
      customerEmail: "",
      shippingAddress: "",
      items: [{ name: "", quantity: 1, price: 0 }],
    });
  };

  const addOrderItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { name: "", quantity: 1, price: 0 }],
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
    field: keyof Omit<OrderItem, "id">,
    value: unknown
  ) => {
    const updatedItems = newOrder.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setNewOrder({ ...newOrder, items: updatedItems });
  };

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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName">Tên khách hàng</Label>
              <Input
                id="customerName"
                value={newOrder.customerName}
                onChange={(e) =>
                  setNewOrder({ ...newOrder, customerName: e.target.value })
                }
                placeholder="Nhập tên khách hàng"
              />
            </div>
            <div>
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={newOrder.customerEmail}
                onChange={(e) =>
                  setNewOrder({ ...newOrder, customerEmail: e.target.value })
                }
                placeholder="Nhập email"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="shippingAddress">Địa chỉ giao hàng</Label>
            <Textarea
              id="shippingAddress"
              value={newOrder.shippingAddress}
              onChange={(e) =>
                setNewOrder({ ...newOrder, shippingAddress: e.target.value })
              }
              placeholder="Nhập địa chỉ giao hàng"
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
                <div className="col-span-5">
                  <Input
                    placeholder="Tên sản phẩm"
                    value={item.name}
                    onChange={(e) =>
                      updateOrderItem(index, "name", e.target.value)
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="SL"
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
                <div className="col-span-4">
                  <Input
                    type="number"
                    placeholder="Giá"
                    min="0"
                    value={item.price}
                    onChange={(e) =>
                      updateOrderItem(
                        index,
                        "price",
                        Number.parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div className="col-span-1">
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
            <strong>
              Tổng tiền:{" "}
              {formatCurrency(
                newOrder.items.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0
                )
              )}
            </strong>
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
