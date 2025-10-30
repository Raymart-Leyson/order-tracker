"use client";

import Sidebar from "../../components/sidebar";
import React, { useState } from "react";

interface Order {
  client: string;
  product: string;
  quantity: string;
  price: string;
  date: string;
}

export default function CreateOrder() {
  const today = new Date().toISOString().split("T")[0];

  const [client, setClient] = useState("");
  const [product, setProduct] = useState("");
  const [date, setDate] = useState(today);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);

  // ✅ Add product entry locally
  const handleAddProduct = () => {
    if (!client || !product || !quantity) {
      alert("Please fill out client, product, and quantity.");
      return;
    }

    const existingIndex = orders.findIndex(
      (o) => o.client === client && o.product === product && o.date === date
    );

    if (existingIndex >= 0) {
      // merge quantity if same client + product + date
      const updated = [...orders];
      updated[existingIndex].quantity = (
        parseInt(updated[existingIndex].quantity) + parseInt(quantity)
      ).toString();

      if (price) updated[existingIndex].price = price;
      setOrders(updated);
    } else {
      setOrders([
        ...orders,
        { client, product, quantity, price: price || "N/A", date },
      ]);
    }

    // reset only product fields
    setProduct("");
    setQuantity("");
    setPrice("");
  };

  // ✅ Submit all orders to backend
  const handleSubmit = async () => {
    if (orders.length === 0) {
      alert("No orders to submit.");
      return;
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orders),
        cache: "no-store",
      });

      const result = await response.json();
      if (response.ok) {
        alert("Orders submitted successfully!");
        setOrders([]);
        setClient("");
      } else {
        alert("Failed to submit orders: " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while submitting orders.");
    }
  };

  // ✅ Helper to group orders by client + date
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const groupedOrders = orders.reduce((acc: Record<string, Order[]>, order) => {
    const key = `${order.client} (${formatDate(order.date)})`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(order);
    return acc;
  }, {});

  // ✅ Handle local deletion (optional)
  const handleRemoveLocal = (client: string, product: string, date: string) => {
    setOrders((prev) =>
      prev.filter(
        (o) =>
          !(
            o.client === client &&
            o.product === product &&
            o.date === date
          )
      )
    );
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar active="Create Order" />

      <div className="flex-1 p-12">
        <h1 className="text-xl font-semibold mb-8">Create Order</h1>

        {/* 🧾 Input Form */}
        <form
          className="grid grid-cols-5 gap-y-4 gap-x-8 max-w-2xl"
          onSubmit={(e) => e.preventDefault()}
        >
          <label className="col-span-2 font-medium flex items-center">Date</label>
          <input
            className="col-span-3 border rounded px-3 py-2"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <label className="col-span-2 font-medium flex items-center">
            Client Name
          </label>
          <input
            className="col-span-3 border rounded px-3 py-2"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            placeholder="e.g. Jasmin"
          />

          <label className="col-span-2 font-medium flex items-center">
            Product Name
          </label>
          <input
            className="col-span-3 border rounded px-3 py-2"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="e.g. Aster"
          />

          <label className="col-span-2 font-medium flex items-center">
            Quantity
          </label>
          <input
            className="col-span-3 border rounded px-3 py-2"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
          />

          <label className="col-span-2 font-medium flex items-center">
            Price
          </label>
          <input
            className="col-span-3 border rounded px-3 py-2"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="N/A"
          />
        </form>

        <button
          type="button"
          className="mt-4 mb-8 float-right bg-black text-white px-5 py-2 rounded hover:bg-gray-900"
          onClick={handleAddProduct}
        >
          Add Product
        </button>

        {/* 📋 Orders Preview */}
        <div className="clear-both mt-12">
          <div className="bg-white rounded shadow p-6 w-full mx-auto">
            {orders.length === 0 ? (
              <p className="text-gray-500 text-center">No products added yet.</p>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-2">Client & Product</th>
                    <th className="text-right pb-2">Quantity</th>
                    <th className="text-right pb-2">Price</th>
                    <th className="text-right pb-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedOrders).map(([clientDate, clientOrders], idx) => (
                    <React.Fragment key={idx}>
                      <tr className="bg-gray-100">
                        <td colSpan={4} className="font-semibold py-2">
                          {clientDate}
                        </td>
                      </tr>
                      {clientOrders.map((order, i) => (
                        <tr key={i}>
                          <td className="pl-4 py-1 text-gray-700">{order.product}</td>
                          <td className="text-right py-1">{order.quantity}</td>
                          <td className="text-right py-1">{order.price}</td>
                          <td className="text-right py-1">
                            <button
                              className="text-red-600 hover:underline"
                              onClick={() =>
                                handleRemoveLocal(order.client, order.product, order.date)
                              }
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* 📤 Submit Button */}
        <div className="flex justify-end mt-8">
          <button
            type="button"
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-900"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
