"use client";

import React from "react";
import NavBar from "@/app/section/navbar";

const DashboardPage = () => {
  const menuItems = [
    { label: "Overview", link: "/dashboard/overview" },
    { label: "Profile", link: "/dashboard/profile" },
    { label: "Settings", link: "/dashboard/settings" },
    { label: "Logout", link: "/logout" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation bar */}
      <NavBar />

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-rose-100 p-6">
          <h2 className="text-lg font-bold text-rose-600 mb-4">Dashboard Menu</h2>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.link}>
                <a
                  href={item.link}
                  className="block text-gray-700 hover:bg-rose-200 hover:text-rose-600 rounded-lg px-3 py-2"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold text-gray-700">Welcome to your Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Use the menu on the left to navigate through different sections of your dashboard.
          </p>

          {/* Example cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-700">Statistics</h2>
              <p className="text-gray-500 mt-1">View your recent activity and performance.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-700">Messages</h2>
              <p className="text-gray-500 mt-1">Check your latest messages and notifications.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-700">Tasks</h2>
              <p className="text-gray-500 mt-1">Track your pending tasks and goals.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
