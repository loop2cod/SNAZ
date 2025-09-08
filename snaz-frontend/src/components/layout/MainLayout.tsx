"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main content */}
      <div className="lg:ml-56">
        <div className="lg:hidden h-16" /> {/* Spacer for mobile menu button */}
        <main className="px-4 lg:px-6 py-4">
          {children}
        </main>
      </div>
    </div>
  );
}
