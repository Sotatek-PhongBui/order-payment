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
import { useFieldArray, useForm } from "react-hook-form";
import {
  type CreateOrder,
  type Order,
  createOrderSchema,
} from "../types/order";
import { formatCurrency } from "../utils/formatters";
import { PRODUCTS } from "../data/mockProduct";
import { zodResolver } from "@hookform/resolvers/zod";

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCreating: boolean;
  onCreateOrder: (order: CreateOrder) => Promise<Order>;
}

export function CreateOrderModal({
  isOpen,
  onClose,
  isCreating,
  onCreateOrder,
}: CreateOrderModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateOrder>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      userId: "1",
      items: [{ productId: PRODUCTS[0].id, quantity: 1 }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });
  const handleCreateOrder = async (order: CreateOrder) => {
    await onCreateOrder(order);
    onClose();
    reset();
  };

  const total = fields.reduce((sum, item) => {
    const product = PRODUCTS.find((p) => p.id === item.productId);
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit(handleCreateOrder)}>
          <DialogHeader>
            <DialogTitle>Tạo đơn hàng mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin để tạo đơn hàng mới
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="userId">User Id</Label>
              <Input id="userId" {...register("userId", { required: true })} />
              {errors.userId && (
                <p className="text-sm text-red-500">{errors.userId.message}</p>
              )}
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Sản phẩm</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    append({ productId: PRODUCTS[0].id, quantity: 1 });
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm sản phẩm
                </Button>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 mb-2">
                  <div className="col-span-6">
                    <Select
                      value={field.productId}
                      onValueChange={(value) =>
                        setValue(`items.${index}.productId`, value)
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
                      {...register(`items.${index}.quantity`, {
                        valueAsNumber: true,
                        min: 1,
                      })}
                    />
                    {errors.items?.[index]?.quantity && (
                      <p className="text-sm text-red-500">
                        {errors.items?.[index]?.quantity?.message}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
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
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Đang tạo..." : "Tạo đơn hàng"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
