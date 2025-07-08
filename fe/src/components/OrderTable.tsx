"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, Eye, MoreHorizontal, X } from "lucide-react";
import type { Order, SortBy } from "../types/order";
import { statusColors, statusLabels } from "../utils/constants";
import { formatDate } from "../utils/formatters";

interface OrderTableProps {
  orders: Order[];
  isCancelling: boolean;
  onSort: (field: SortBy) => void;
  onViewOrder: (order: Order) => void;
  onCancelOrder: (orderId: string) => void;
}

export function OrderTable({
  orders,
  isCancelling,
  onSort,
  onViewOrder,
  onCancelOrder,
}: OrderTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center align-middle">
              <Button
                variant="ghost"
                onClick={() => onSort("id")}
                className="h-auto p-0 font-semibold"
              >
                ID đơn hàng
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-center align-middle">
              <Button
                variant="ghost"
                onClick={() => onSort("status")}
                className="h-auto p-0 font-semibold"
              >
                Trạng thái
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-center align-middle">
              <Button
                variant="ghost"
                onClick={() => onSort("createdAt")}
                className="h-auto p-0 font-semibold"
              >
                Ngày tạo
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                Không tìm thấy đơn hàng nào
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>
                  <Badge className={statusColors[order.status]}>
                    {statusLabels[order.status]}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Mở menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onViewOrder(order)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Xem chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {order.status !== "cancelled" &&
                        order.status !== "deliveried" && (
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            onClick={() => onCancelOrder(order.id)}
                            disabled={isCancelling}
                            className="text-red-600"
                          >
                            <X className="mr-2 h-4 w-4" />
                            {isCancelling ? "Đang hủy..." : "Hủy đơn hàng"}
                          </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
