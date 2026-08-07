import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import Link from "next/link";
import { useRouter } from "next/router";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const { subscription } = useSubscription();
  const router = useRouter();

  return (
    <>
      {/* Backdrop, mobile only, closes the drawer on tap outside it */}
      {isOpen && (
        <div
          aria-hidden
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}

      <div
        className={`fixed left-0 top-0 z-40 flex h-full w-64 -translate-x-full flex-col border-r border-[#3A4D25] bg-[#26331B] p-4 text-gray-200 transition-transform duration-200 ease-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : ""
        }`}
      >
        <div className="flex-1">
          <Link
            href="/"
            onClick={onClose}
            className="mb-8 flex items-center no-underline"
          >
            <h1 className="text-xl font-bold text-white">RegsGPT</h1>
          </Link>

          <nav className="space-y-2">
            <Link
              href="/chat"
              onClick={onClose}
              className={`flex items-center p-3 rounded-lg hover:bg-[#2F3D1C] transition-colors no-underline text-gray-200 ${
                router.pathname === "/chat" ? "bg-[#2F3D1C]" : ""
              }`}
            >
              Chat
            </Link>
            <Link
              href="/pricing"
              onClick={onClose}
              className={`flex items-center p-3 rounded-lg hover:bg-[#2F3D1C] transition-colors no-underline text-gray-200 ${
                router.pathname === "/pricing" ? "bg-[#2F3D1C]" : ""
              }`}
            >
              Pricing
            </Link>
            {user && (
              <Link
                href="/dashboard"
                onClick={onClose}
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
              href="/signin"
              onClick={onClose}
              className="block text-center p-2 bg-[#3A4D25] rounded-lg hover:bg-[#4A5D35] transition-colors no-underline text-white"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
