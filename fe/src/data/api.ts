import axios from "axios";
import type { Order } from "../types/order";

const axiosInstance = axios.create({
  baseURL: "http://localhost:4001/order",
});

export async function fetchOrder(params: {
  status: string;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
}): Promise<{
  data: Order[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}> {
  console.log(params);
  params.sortOrder = params.sortOrder.toUpperCase();
  const response = await axiosInstance.get<{
    data: Order[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>("", { params });
  return response.data;
}

export async function createOrder(order: Order): Promise<Order> {
  const response = await axiosInstance.post<Order>("", order);
  return response.data;
}

export async function cancelOrder(id: string): Promise<void> {
  return axiosInstance.post(`${id}/cancel`);
}

export async function checkOrderStatus(id: string): Promise<string> {
  const response = await axiosInstance.get<string>(`${id}/status`);
  return response.data;
}
