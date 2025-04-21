"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar({ children }) {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Pages where we don't want to show the sidebar
  const hiddenPaths = ["/login", "/register"];

  // Detect screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true); // auto open on desktop
      } else {
        setIsOpen(false); // auto close on mobile
      }
    };

    handleResize(); // Run on initial load
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // If on login/register, skip sidebar layout
  if (hiddenPaths.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-gray-800 text-white p-6 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:flex-shrink-0`}
      >
        {/* Header */}
        <div className="flex flex-row items-center justify-center mb-6 gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-big-icon lucide-circle-check-big"><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></svg>
          <h2 className="text-2xl font-bold">ToDone</h2>
        </div>

        {/* Nav Links */}
        <nav className="space-y-4">
          <Link
            href="/todos"
            className={`block p-4 rounded-md ${
              pathname === "/todos"
                ? "bg-neutral-100 text-gray-800 font-semibold"
                : "hover:bg-neutral-100 hover:text-gray-800"
            }`}
          >
            Todo List
          </Link>
        </nav>
      </div>

      {/* Page Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Navbar */}
        <nav className="flex items-center justify-between bg-gray-900 text-white px-6 py-4 shadow">
          <div>
            <button
              className="text-white rounded cursor-pointer"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Menu size={24} />
            </button>
          </div>
          <div className="flex justify-center items-center gap-3">
            <div>
              {user?.username}
            </div>
            <button
              className="text-white py-1 rounded cursor-pointer"
              onClick={() => logout()}
            >
              <LogOut size={24} />
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-4">{children}</main>
      </div>
    </div>
  );
}
