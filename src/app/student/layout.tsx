
import { StudentSidebar } from "@/components/student/StudentSidebar";
import { StudentNavbar } from "@/components/student/StudentNavbar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F4F7FB]">
      <StudentSidebar />
      <div className="flex flex-col">
        <StudentNavbar />
        <main className="mr-0 md:mr-64 p-4 md:p-8 animate-fade-in" dir="rtl">
          {children}
        </main>
      </div>
    </div>
  );
}
