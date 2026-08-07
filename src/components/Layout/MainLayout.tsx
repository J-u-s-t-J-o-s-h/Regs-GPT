import { useState } from "react";
import Link from "next/link";
import Sidebar from "./Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#1F2D16]">
      {/* Mobile top bar: the sidebar is off-screen below md, so this is the
          only way to reach navigation on a phone. */}
      <div className="fixed inset-x-0 top-0 z-20 flex h-14 items-center justify-between border-b border-[#3A4D25] bg-[#26331B] px-4 md:hidden">
        <Link href="/" className="text-lg font-bold text-white no-underline">
          RegsGPT
        </Link>
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-200 hover:bg-[#2F3D1C]"
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="h-5 w-5"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="min-h-screen px-4 pb-4 pt-20 md:ml-64 md:p-4">
        {children}
      </main>
    </div>
  );
}
