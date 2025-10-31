"use client";

import Sidebar from "../../../../components/sidebar";
import { useParams } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
// @ts-ignore
import domtoimage from "dom-to-image-more";

interface Order {
  _id?: string;
  client: string;
  product: string;
  quantity: string;
  price: string;
  date: string;
  isEditing?: boolean;
}

export default function ClientDetails() {
  const params = useParams();
  const dateParam = Array.isArray(params?.date) ? params.date[0] : params?.date || "";
  const clientParam = Array.isArray(params?.client) ? params.client[0] : params?.client || "";

  const decodedDate = decodeURIComponent(dateParam);
  const decodedClient = decodeURIComponent(clientParam);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders", { cache: "no-store" });
        const allOrders: Order[] = await res.json();
        const filtered: Order[] = allOrders.filter(
          (o: Order) => o.client === decodedClient && o.date === decodedDate
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

  const toggleEditingMode = () => setIsEditingMode(!isEditingMode);

  const handleEditToggle = (index: number) => {
    const updated = [...orders];
    updated[index].isEditing = !updated[index].isEditing;
    setOrders(updated);
  };

  const handleChange = (index: number, field: 'product' | 'quantity' | 'price', value: string) => {
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

  const handleSaveAsImage = async () => {
  if (!printRef.current) return;

  try {
    // Clone the element
    const node = printRef.current.cloneNode(true) as HTMLElement;

    // Apply clean styles
    node.style.overflow = "visible";
    node.style.padding = "20px";
    node.style.backgroundColor = "#ffffff";
    node.style.fontFamily = "'Helvetica Neue', Arial, sans-serif";
    node.style.color = "#222";
    node.style.width = "auto";
    node.style.maxHeight = "none";

    // Clean child elements
    (node.querySelectorAll("*") as NodeListOf<HTMLElement>).forEach((el) => {
      el.style.border = "none";
      el.style.boxShadow = "none";
      el.style.borderRadius = "0";
      el.style.padding = "0";
      el.style.margin = "0";
      el.style.fontSize = "14px";
      el.style.lineHeight = "1.5";
      el.style.maxHeight = "none";
      el.style.overflow = "visible";
    });

    // Style the table
    const table = node.querySelector("table");
    if (table) {
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";
      table.querySelectorAll("th, td").forEach((cell) => {
        const c = cell as HTMLElement;
        c.style.borderBottom = "1px solid #ccc";
        c.style.padding = "8px 12px";
        c.style.textAlign = c.tagName === "TH" ? "center" : "left";
      });
    }

    // Style header
    const header = node.querySelector("h2");
    if (header) {
      header.style.textAlign = "center";
      header.style.fontSize = "18px";
      header.style.fontWeight = "600";
      header.style.marginBottom = "8px";
    }

    const subtitle = node.querySelector("p");
    if (subtitle) {
      subtitle.style.textAlign = "center";
      subtitle.style.fontSize = "12px";
      subtitle.style.color = "#555";
      subtitle.style.marginBottom = "16px";
    }

    // Temporarily attach the node to body so dom-to-image can measure full size
    node.style.position = "absolute";
    node.style.top = "-9999px";
    document.body.appendChild(node);

    // Capture full node as PNG
    const dataUrl = await domtoimage.toPng(node, {
      bgcolor: "#ffffff",
      width: node.scrollWidth,
      height: node.scrollHeight,
      style: {
        transform: "scale(1)",
        transformOrigin: "top left",
        overflow: "visible",
      },
    });

    // Remove temporary node
    document.body.removeChild(node);

    // Trigger download
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${decodedClient}_${decodedDate}.png`;
    link.click();
  } catch (err) {
    console.error("Failed to save image:", err);
    alert("Failed to save receipt as image.");
  }
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
        <div className="flex justify-between items-center mb-4 no-print space-x-2">
          <div>
            <h1 className="text-3xl font-bold print:text-xl">{decodedClient}</h1>
            <p className="text-gray-600 print:text-sm">{decodedDate}</p>
          </div>
          <div className="flex space-x-2 no-print">
            <button
              onClick={handleSaveAsImage}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
            >
              💾 Save Receipt
            </button>
            <button
              onClick={toggleEditingMode}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              ✏️ Edit
            </button>
          </div>
        </div>

        <div ref={printRef}>
          <h2 className="text-center font-semibold text-lg print:text-base">Receipt</h2>
          <p className="text-center text-gray-500 text-sm print:text-xs">
            Client: {decodedClient} — Date: {decodedDate}
          </p>

          <div className="bg-white p-6 rounded-2xl shadow-md mt-4 overflow-x-auto print:shadow-none print:rounded-none print:p-0">
            <table className="w-full text-left text-sm border-collapse print:text-xs">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="py-2">Product</th>
                  <th className="py-2 text-center">Quantity</th>
                  <th className="py-2 text-center">Price</th>
                  {isEditingMode && <th className="py-2 text-center no-print">Actions</th>}
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
                    {isEditingMode && (
                      <td className="py-2 text-center space-x-2 no-print">
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
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between font-semibold text-sm border-t pt-4 mt-4 print:text-xs">
              <span>Total</span>
              <span>₱{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
