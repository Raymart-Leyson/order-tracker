"use client";

import Sidebar from "../../../components/sidebar";
import { useParams } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface Order {
  client: string;
  product: string;
  quantity: string;
  price: string;
  date: string;
}

interface ClientData {
  client: string;
  details: { name: string; quantity: number; price: string }[];
  overallTotal: string;
}

const VIEW_DETAILS_THRESHOLD = 3;

export default function OrderListByDate() {
  const params = useParams();
  const dateParam = Array.isArray(params?.date) ? params.date[0] : params?.date || "";
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [grandTotal, setGrandTotal] = useState<string>("0");

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Unknown Date";
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders", { cache: "no-store" });
        const data: Order[] = await res.json();

        const filtered = data.filter(order => order.date === dateParam);

        const grouped: Record<string, ClientData> = {};
        filtered.forEach(order => {
          if (!grouped[order.client]) {
            grouped[order.client] = { client: order.client, details: [], overallTotal: "" };
          }
          grouped[order.client].details.push({
            name: order.product,
            quantity: parseInt(order.quantity),
            price: order.price,
          });
        });

        let grandSum = 0;
        let grandHasNA = false;

        Object.values(grouped).forEach(client => {
          let total = 0;
          let hasNA = false;
          for (const item of client.details) {
            if (item.price === "N/A") {
              hasNA = true;
              break;
            }
            const priceNum = parseFloat(item.price.replace(/[^\d.-]/g, ""));
            if (!isNaN(priceNum)) total += priceNum * item.quantity;
          }
          client.overallTotal = hasNA ? "N/A" : `₱${total.toLocaleString()}`;

          // add to grand total if not N/A
          if (!hasNA) grandSum += total;
          else grandHasNA = true;
        });

        setClients(Object.values(grouped));
        setGrandTotal(grandHasNA ? "N/A" : `₱${grandSum.toLocaleString()}`);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch orders for this date");
      } finally {
        setLoading(false);
      }
    };

    if (dateParam) fetchOrders();
  }, [dateParam]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar active="Order List…" />

      <main className="flex-1 p-10 bg-gray-100 min-h-screen">
        <h2 className="text-3xl font-bold mb-8">{formatDate(dateParam)}</h2>

        {clients.length === 0 ? (
          <p>No orders found for this date.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              {clients.map((client, index) => (
                <Link
                  key={index}
                  href={`/order-list/${encodeURIComponent(dateParam)}/${encodeURIComponent(client.client)}`}
                  className="group bg-white rounded-2xl p-6 shadow-md transition hover:shadow-lg cursor-pointer"
                >
                  <h3 className="text-lg font-semibold mb-4">{client.client}</h3>

                  <table className="w-full text-sm border-t border-gray-300">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th>Name</th>
                        <th>Quantity</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {client.details.slice(0, VIEW_DETAILS_THRESHOLD).map((item, i) => (
                        <tr key={i} className="border-t">
                          <td className="py-2">{item.name}</td>
                          <td>{item.quantity}</td>
                          <td>{item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="text-right mt-3 text-gray-700">
                    Overall Total: {client.overallTotal}
                  </div>

                  {/* Hover overlay */}
                  {client.details.length > VIEW_DETAILS_THRESHOLD && (
                    <div className="opacity-0 group-hover:opacity-100 text-right mt-2 text-blue-600 text-sm transition-all">
                      View Details →
                    </div>
                  )}
                </Link>
              ))}
            </div>

            <div className="bg-white p-4 rounded-xl shadow-md text-right font-semibold">
              Grand Total: {grandTotal}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
