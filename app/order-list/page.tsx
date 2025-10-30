"use client";
import Sidebar from "../../components/sidebar";
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Order {
  client: string;
  product: string;
  quantity: string;
  price: string;
  date: string;
}

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders", { cache: "no-store" });
        const data = await res.json();

        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          console.error("API did not return an array:", data);
          setOrders([]);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to fetch orders");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  // Group orders by date and calculate overall total
  const groupedByDate: Record<string, string> = {};

  orders.forEach((order) => {
    const quantityNum = parseInt(order.quantity);
    const priceNum = order.price === "N/A" ? NaN : parseFloat(order.price.replace(/[^\d.-]/g, ""));
    
    if (!groupedByDate[order.date]) groupedByDate[order.date] = "0";

    if (isNaN(priceNum)) {
      groupedByDate[order.date] = "N/A";
    } else if (groupedByDate[order.date] !== "N/A") {
      groupedByDate[order.date] = (
        parseFloat(groupedByDate[order.date]) + priceNum * (isNaN(quantityNum) ? 0 : quantityNum)
      ).toString();
    }
  });

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar active="Order List" />
      <main className="flex-1 p-12">
        <h1 className="text-3xl font-bold mb-8">Order List</h1>

        {Object.keys(groupedByDate).length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByDate).map(([date, total], idx) => (
              <Link
                key={idx}
                href={`/order-list/${encodeURIComponent(date)}`}
                className="bg-white rounded shadow p-6 flex justify-between items-center hover:ring-2 hover:ring-gray-800 transition cursor-pointer"
              >
                <p className="text-gray-500">{formatDate(date)}</p>
                <p className="text-gray-500">
                  OVERALL TOTAL: {total === "N/A" ? "N/A" : `₱${parseFloat(total).toLocaleString()}`}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
