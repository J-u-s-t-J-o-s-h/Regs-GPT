import Sidebar from './Sidebar';
import { useRouter } from 'next/router';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const showSidebar = router.pathname !== '/login' && router.pathname !== '/signup';

  return (
    <div className="min-h-screen bg-[#1F2D16]">
      {showSidebar && <Sidebar />}
      <main className={`${showSidebar ? 'ml-64' : ''} p-4`}>
        {children}
      </main>
    </div>
  );
} 