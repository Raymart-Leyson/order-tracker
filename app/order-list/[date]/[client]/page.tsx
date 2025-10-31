"use client";

import Sidebar from "../../../../components/sidebar";
import { useParams } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";

interface Order {
  client: string;
  product: string;
  quantity: string;
  price: string;
  date: string;
}

interface EditableRow extends Order {
  isEditing?: boolean;
}

export default function ClientDetails() {
  const params = useParams();
  const dateParam = Array.isArray(params?.date) ? params.date[0] : params?.date || "";
  const clientParam = Array.isArray(params?.client) ? params.client[0] : params?.client || "";

  const decodedDate = decodeURIComponent(dateParam);
  const decodedClient = decodeURIComponent(clientParam);

  const [orders, setOrders] = useState<EditableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders", { cache: "no-store" });
        const allOrders: Order[] = await res.json();

        const filtered = allOrders.filter(
          (o) => o.client === decodedClient && o.date === decodedDate
        );
        setOrders(filtered);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch orders for this client and date.");
      } finally {
        setLoading(false);
      }
    };

    if (decodedDate && decodedClient) fetchOrders();
  }, [decodedDate, decodedClient]);

  const handleEditToggle = (index: number) => {
    const updated = [...orders];
    updated[index].isEditing = !updated[index].isEditing;
    setOrders(updated);
  };

  const handleChange = (index: number, field: keyof Order, value: string) => {
    const updated = [...orders];
    updated[index][field] = value;
    setOrders(updated);
  };

  const handleSave = async (index: number) => {
    try {
      const order = orders[index];
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });

      if (!res.ok) throw new Error("Failed to update order.");

      alert("Order updated successfully!");
      handleEditToggle(index);
    } catch (err) {
      console.error(err);
      alert("Failed to update order.");
    }
  };

  const handleDelete = async (index: number) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    try {
      const order = orders[index];
      const res = await fetch("/api/orders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });

      if (!res.ok) throw new Error("Failed to delete order.");

      setOrders((prev) => prev.filter((_, i) => i !== index));
      alert("Order deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete order.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading)
    return <div className="flex justify-center items-center h-screen">Loading...</div>;

  const total = orders.reduce((sum, item) => {
    const price = parseFloat(item.price);
    const qty = parseInt(item.quantity);
    return sum + (isNaN(price) || isNaN(qty) ? 0 : price * qty);
  }, 0);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar active="Order List…" />
      <main className="flex-1 p-10">
        <style jsx global>{`
          /* 🧾 Hide sidebar and buttons in print */
          @media print {
            aside,
            .no-print {
              display: none !important;
            }
            body {
              background: white;
            }
            main {
              padding: 0;
            }
            table {
              width: 100%;
              font-size: 12px;
            }
            th:last-child,
            td:last-child {
              display: none; /* hide Actions column */
            }
          }
        `}</style>

        <div className="flex justify-between items-center mb-4 no-print">
          <div>
            <h1 className="text-3xl font-bold">{decodedClient}</h1>
            <p className="text-gray-600">{decodedDate}</p>
          </div>
          <button
            onClick={handlePrint}
            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
          >
            🖨️ Print Receipt
          </button>
        </div>

        <div ref={printRef}>
          <h2 className="text-center font-semibold text-lg">Receipt</h2>
          <p className="text-center text-gray-500 text-sm">
            Client: {decodedClient} — Date: {decodedDate}
          </p>

          <div className="bg-white p-6 rounded-2xl shadow-md mt-4">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="py-2">Product</th>
                  <th className="py-2 text-center">Quantity</th>
                  <th className="py-2 text-center">Price</th>
                  <th className="py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((item, i) => (
                  <tr key={i} className="border-b last:border-none">
                    <td className="py-2">{item.product}</td>
                    <td className="py-2 text-center">
                      {item.isEditing ? (
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleChange(i, "quantity", e.target.value)}
                          className="border rounded px-2 py-1 w-16 text-center"
                        />
                      ) : (
                        item.quantity
                      )}
                    </td>
                    <td className="py-2 text-center">
                      {item.isEditing ? (
                        <input
                          type="text"
                          value={item.price}
                          onChange={(e) => handleChange(i, "price", e.target.value)}
                          className="border rounded px-2 py-1 w-20 text-center"
                        />
                      ) : (
                        item.price
                      )}
                    </td>
                    <td className="py-2 text-center space-x-2">
                      {item.isEditing ? (
                        <>
                          <button
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                            onClick={() => handleSave(i)}
                          >
                            Save
                          </button>
                          <button
                            className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                            onClick={() => handleEditToggle(i)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                            onClick={() => handleEditToggle(i)}
                          >
                            Edit
                          </button>
                          <button
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                            onClick={() => handleDelete(i)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between font-semibold text-sm border-t pt-4 mt-4">
              <span>Total</span>
              <span>₱{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
