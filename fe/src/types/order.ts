import { z } from "zod";

export const createOrderSchema = z.object({
  userId: z.string().min(1, "User id is required"),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1, "Quantity must be greater than 0"),
    })
  ),
});

export interface Production {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  status: "created" | "confirmed" | "deliveried" | "cancelled";
  items: OrderItem[];
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  production: Production;
  quantity: number;
}

export type SortBy = "id" | "status" | "createdAt";
export type SortOrder = "asc" | "desc";
export type CreateOrder = z.infer<typeof createOrderSchema>;
