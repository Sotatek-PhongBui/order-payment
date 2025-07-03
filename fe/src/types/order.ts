export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  status: "created" | "confirmed" | "deliveried" | "cancelled";
  total: number;
  items: OrderItem[];
  createdAt: string;
  shippingAddress: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export type SortBy = "id" | "status" | "createdAt";
export type SortOrder = "asc" | "desc";
