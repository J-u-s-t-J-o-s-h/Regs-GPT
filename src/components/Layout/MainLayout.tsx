import Sidebar from "./Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#1F2D16]">
      <Sidebar />
      <main className="ml-64 p-4 min-h-screen">{children}</main>
    </div>
  );
}
