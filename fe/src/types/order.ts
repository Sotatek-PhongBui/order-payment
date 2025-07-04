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
  productId: string;
  quantity: number;
}

export type SortBy = "id" | "status" | "createdAt";
export type SortOrder = "asc" | "desc";
