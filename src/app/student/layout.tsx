import { redirect } from 'next/navigation';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // إلغاء تفعيل واجهة الطالب وتوجيه الجميع للصفحة الرئيسية
  redirect('/');
  return null;
}
