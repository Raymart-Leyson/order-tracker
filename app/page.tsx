"use client";
import Sidebar from "../components/sidebar";
import React, { useEffect, useState } from "react";

interface Order {
  client: string;
  product: string;
  quantity: string;
  price: string;
  date: string;
}

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders", { cache: "no-store" });
        const data = await res.json();
        if (Array.isArray(data)) setOrders(data);
        else setOrders([]);
      } catch (err) {
        console.error(err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Helper to parse price and quantity
  const getOrderValue = (order: Order) => {
    if (order.price === "N/A") return 0;
    const priceNum = parseFloat(order.price.replace(/[^\d.-]/g, ""));
    const quantityNum = parseInt(order.quantity);
    if (isNaN(priceNum) || isNaN(quantityNum)) return 0;
    return priceNum * quantityNum;
  };

  // Calculate month and week totals
  const now = new Date();
  const monthTotal = orders
    .filter((o) => {
      const d = new Date(o.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, o) => sum + getOrderValue(o), 0);

  const weekTotal = orders
    .filter((o) => {
      const d = new Date(o.date);
      const diff = now.getTime() - d.getTime();
      const daysAgo = diff / (1000 * 60 * 60 * 24);
      return daysAgo <= 7;
    })
    .reduce((sum, o) => sum + getOrderValue(o), 0);

  // Group orders by client
  const groupedOrders: Record<string, Order[]> = {};
  orders.forEach((order) => {
    if (!groupedOrders[order.client]) groupedOrders[order.client] = [];
    groupedOrders[order.client].push(order);
  });

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar active="Home" />

      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <a
            href="/create-order"
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900"
          >
            Create Order
          </a>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded shadow flex flex-col">
            <div className="text-lg text-gray-700">Month</div>
            <div className="text-3xl font-bold">₱{monthTotal.toLocaleString()}</div>
          </div>
          <div className="bg-white p-6 rounded shadow flex flex-col">
            <div className="text-lg text-gray-700">Week</div>
            <div className="text-3xl font-bold">₱{weekTotal.toLocaleString()}</div>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        {loading ? (
          <div>Loading orders...</div>
        ) : Object.keys(groupedOrders).length === 0 ? (
          <div>No orders yet</div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {Object.entries(groupedOrders).map(([clientName, clientOrders], idx) => (
              <OrderTable key={idx} clientName={clientName} orders={clientOrders} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderTable({ clientName, orders }: { clientName: string; orders: Order[] }) {
  const total = orders.reduce((sum, o) => {
    if (o.price !== "N/A") {
      const priceNum = parseFloat(o.price.replace(/[^\d.-]/g, ""));
      const quantityNum = parseInt(o.quantity);
      if (!isNaN(priceNum) && !isNaN(quantityNum)) sum += priceNum * quantityNum;
    }
    return sum;
  }, 0);

  return (
    <div className="bg-white rounded shadow p-4">
      <div className="font-semibold mb-2">{clientName}</div>
      <table className="w-full text-sm">
        <tbody>
          {orders.map((row, idx) => (
            <tr key={idx}>
              <td className="px-2 py-1">{row.product}</td>
              <td className="px-2 py-1 text-right">{row.quantity}</td>
              <td className="px-2 py-1 text-right">{row.price}</td>
            </tr>
          ))}
          <tr className="font-bold border-t mt-2">
            <td className="px-2 py-2">TOTAL</td>
            <td className="px-2 py-2 text-right" colSpan={2}>
              ₱{total.toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
