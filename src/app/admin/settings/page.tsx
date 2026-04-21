
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * تم إلغاء هذه الصفحة بناءً على طلب المستخدم.
 * تقوم الصفحة الآن بإعادة التوجيه التلقائي للوحة التحكم.
 */
export default function RemovedSettingsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard");
  }, [router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-primary">
      <Loader2 className="w-12 h-12 animate-spin opacity-20" />
      <p className="font-black text-xl">جاري إعادة توجيهك...</p>
    </div>
  );
}
