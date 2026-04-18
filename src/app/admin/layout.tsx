
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminNavbar } from "@/components/admin/AdminNavbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F4F7FB]">
      <AdminSidebar />
      <div className="flex flex-col">
        <AdminNavbar />
        <main className="mr-0 md:mr-64 p-6 md:p-10 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
