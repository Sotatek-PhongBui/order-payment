import axios from "axios";
import type { CreateOrder, Order } from "../types/order";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export async function fetchOrder(params: {
  status: string;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
}): Promise<{
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    cancelled: number;
    deliveried: number;
  };
}> {
  console.log(params);
  params.sortOrder = params.sortOrder.toUpperCase();
  const response = await axiosInstance.get<{
    statusCode: number;
    timestamp: string;
    path: string;
    data: {
      data: Order[];
      meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        cancelled: number;
        deliveried: number;
      };
    };
  }>("", { params });
  return response.data.data;
}

export async function fetchOrderDetail(id: string): Promise<Order> {
  const response = await axiosInstance.get<{
    statusCode: number;
    timestamp: string;
    path: string;
    data: Order;
  }>(`/${id}`);
  return response.data.data;
}

export async function createOrder(order: CreateOrder): Promise<Order> {
  const response = await axiosInstance.post<Order>("", order);
  return response.data;
}

export async function cancelOrder(id: string): Promise<void> {
  return axiosInstance.post(`${id}/cancel`);
}

export async function checkOrderStatus(id: string): Promise<string> {
  const response = await axiosInstance.get<{
    statusCode: number;
    timestamp: string;
    path: string;
    data: string;
  }>(`${id}/status`);
  return response.data.data;
}
