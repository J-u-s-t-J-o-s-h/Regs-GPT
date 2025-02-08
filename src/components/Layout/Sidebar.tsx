import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { subscription } = useSubscription();
  const router = useRouter();

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-[#26331B] text-gray-200 p-4 flex flex-col">
      <div className="flex-1">
        <Link href="/" className="flex items-center mb-8">
          <h1 className="text-xl font-bold">RegsGPT</h1>
        </Link>

        <nav className="space-y-2">
          <Link 
            href="/chat"
            className={`flex items-center p-3 rounded-lg hover:bg-[#2F3D1C] transition-colors ${
              router.pathname === '/chat' ? 'bg-[#2F3D1C]' : ''
            }`}
          >
            <span>New Chat</span>
          </Link>
          
          {subscription?.isActive && (
            <Link 
              href="/history"
              className={`flex items-center p-3 rounded-lg hover:bg-[#2F3D1C] transition-colors ${
                router.pathname === '/history' ? 'bg-[#2F3D1C]' : ''
              }`}
            >
              <span>History</span>
            </Link>
          )}
        </nav>
      </div>

      <div className="border-t border-[#3A4D25] pt-4">
        {user ? (
          <div className="flex items-center justify-between">
            <span className="text-sm">{user.email}</span>
            <button 
              onClick={logout}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link 
            href="/login"
            className="block text-center p-2 bg-[#3A4D25] rounded-lg hover:bg-[#4A5D35] transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
} 