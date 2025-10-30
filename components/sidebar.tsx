"use client";
import React from "react";
import Link from "next/link";

interface SidebarProps {
  active: string;
}

const items = [
  { name: "Home", href: "/", icon: "🏠" },
  { name: "Order List…", href: "/order-list", icon: "📋" },
  { name: "Create Order", href: "/create-order", icon: "📦" },
];

const Sidebar: React.FC<SidebarProps> = ({ active }) => (
  <aside className="w-64 bg-white shadow flex flex-col p-5 h-screen sticky top-0">
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
            >
              <span className="mr-2">{item.icon}</span>
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  </aside>
);

export default Sidebar;
