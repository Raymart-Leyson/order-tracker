"use client";
import React, { useState } from "react";
import Link from "next/link";

interface SidebarProps {
  active: string;
}

const items = [
  { name: "Home", href: "/", icon: "🏠" },
  { name: "Order List…", href: "/order-list", icon: "📋" },
  { name: "Create Order", href: "/create-order", icon: "📦" },
];

const Sidebar: React.FC<SidebarProps> = ({ active }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-black text-white p-2 rounded"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 bg-white shadow p-5 flex flex-col z-50
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:h-auto
        `}
      >
        <h2 className="text-2xl font-bold mb-6">Tracker</h2>
        <nav className="flex-1">
          <ul>
            {items.map((item) => (
              <li className="mb-2" key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center p-2 rounded font-semibold ${
                    active === item.name ? "bg-gray-100" : "hover:bg-gray-100"
                  }`}
                  onClick={() => setIsOpen(false)} // Close menu on click
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
