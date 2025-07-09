"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import type { CreateOrder, Order } from "../types/order";
import { OrderStats } from "../components/OrderStats";
import { OrderFilters } from "../components/OrderFilters";
import { OrderTable } from "../components/OrderTable";
import { OrderDetailModal } from "./OrderDetailModal";
import { CreateOrderModal } from "./CreateOrderModal";
import { Pagination } from "../components/Pagination";
import { cancelOrder, createOrder, fetchOrder } from "../data/api";
import { io } from "socket.io-client";
import { toast } from "sonner";

const socket = io("http://localhost:4001/order");

export default function OrderDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const status = searchParams.get("status") || "all";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const itemsPerPage = 10;

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, isPending, isError } = useQuery({
    queryKey: ["orders", { status, sortBy, sortOrder, page: currentPage }],
    queryFn: () =>
      fetchOrder({
        status,
        page: currentPage,
        limit: itemsPerPage,
        sortBy,
        sortOrder,
      }),
  });
  useEffect(() => {
    // socket.connect();
    socket.off("notify change");
    socket.on("notify change", () => {
      console.log("notify change");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const updateParams = (update: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(update)) {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      updateParams({ sortOrder: sortOrder === "asc" ? "desc" : "asc" });
    } else {
      updateParams({
        sortBy: field,
        sortOrder: "asc",
        page: "1",
      });
    }
  };

  const handlePageChange = (page: number) => {
    updateParams({ page: String(page) });
  };

  const handleStatusChange = (newStatus: string) => {
    updateParams({ status: newStatus, page: "1" });
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const { mutateAsync: createOrderMutateAsync, isPending: isCreating } =
    useMutation({
      mutationFn: (order: CreateOrder) => createOrder(order),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["orders"] });
        toast.success("Đơn hàng đã được tạo thành công");
      },
    });

  const { mutateAsync: cancelOrderMutateAsync, isPending: isCancelling } =
    useMutation({
      mutationFn: (orderId: string) => cancelOrder(orderId),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["orders"] });
        toast.success("Đơn hàng đã được hủy thành công");
      },
    });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Quản lý đơn hàng</h1>
          <p className="text-muted-foreground">
            Quản lý và theo dõi tất cả đơn hàng của bạn
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo đơn hàng
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Stats */}
      <OrderStats
        meta={data?.meta || { total: 0, cancelled: 0, deliveried: 0 }}
      />

      <Card>
        <CardHeader>
          <CardTitle>Danh sách đơn hàng</CardTitle>
          <CardDescription>Quản lý và theo dõi tất cả đơn hàng</CardDescription>
        </CardHeader>
        <CardContent>
          <OrderFilters
            statusFilter={status}
            setStatusFilter={handleStatusChange}
          />

          {isPending && <div>Đang tải dữ liệu…</div>}
          {isError && <div>Lỗi khi tải dữ liệu!</div>}

          {!isPending && !isError && (
            <>
              <OrderTable
                orders={data?.data || []}
                isCancelling={isCancelling}
                onSort={handleSort}
                onViewOrder={handleViewOrder}
                onCancelOrder={cancelOrderMutateAsync}
              />

              <Pagination
                currentPage={data?.meta.page || 1}
                totalPages={data?.meta.totalPages || 1}
                startIndex={(data?.meta.page - 1) * data?.meta.limit}
                endIndex={Math.min(
                  (data?.meta.page || 1) * data?.meta.limit,
                  data?.meta.total || 0
                )}
                totalItems={data?.meta.total || 0}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </CardContent>
      </Card>

      <OrderDetailModal
        order={selectedOrder}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onCancelOrder={cancelOrderMutateAsync}
      />

      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        isCreating={isCreating}
        onCreateOrder={createOrderMutateAsync}
      />
    </div>
  );
}
