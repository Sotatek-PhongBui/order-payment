export interface CreateOrder {
  id: string;
  userId: string;
  status: "created" | "confirmed" | "deliveried" | "cancelled";
  items: CreateOrderItem[];
  createdAt: string;
}

export interface Production {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface CreateOrderItem {
  productId: string;
  quantity: number;
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
