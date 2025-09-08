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
      <div className="lg:ml-64">
        <div className="lg:hidden h-16" /> {/* Spacer for mobile menu button */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}