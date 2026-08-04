import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { subscription } = useSubscription();
  const router = useRouter();

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-[#26331B] text-gray-200 p-4 flex flex-col border-r border-[#3A4D25]">
      <div className="flex-1">
        <Link href="/" className="flex items-center mb-8 no-underline">
          <h1 className="text-xl font-bold text-white">RegsGPT</h1>
        </Link>

        <nav className="space-y-2">
          <Link
            href="/chat"
            className={`flex items-center p-3 rounded-lg hover:bg-[#2F3D1C] transition-colors no-underline text-gray-200 ${
              router.pathname === "/chat" ? "bg-[#2F3D1C]" : ""
            }`}
          >
            Chat
          </Link>
          <Link
            href="/pricing"
            className={`flex items-center p-3 rounded-lg hover:bg-[#2F3D1C] transition-colors no-underline text-gray-200 ${
              router.pathname === "/pricing" ? "bg-[#2F3D1C]" : ""
            }`}
          >
            Pricing
          </Link>
          {user && (
            <Link
              href="/dashboard"
              className={`flex items-center p-3 rounded-lg hover:bg-[#2F3D1C] transition-colors no-underline text-gray-200 ${
                router.pathname === "/dashboard" ? "bg-[#2F3D1C]" : ""
              }`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {user && (
          <p className="mt-6 text-xs text-gray-400 px-1">
            Plan: {subscription?.isActive ? "Premium" : "Free"}
          </p>
        )}
      </div>

      <div className="border-t border-[#3A4D25] pt-4">
        {user ? (
          <div className="space-y-2">
            <span className="block text-sm truncate">{user.email}</span>
            <button
              onClick={logout}
              className="w-full text-sm bg-transparent border border-[#3A4D25] text-gray-300 hover:bg-[#2F3D1C] hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            href="/"
            className="block text-center p-2 bg-[#3A4D25] rounded-lg hover:bg-[#4A5D35] transition-colors no-underline text-white"
          >
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}
