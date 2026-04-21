"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function RemovedSettingsPage() {
  const router = useRouter();

  useEffect(() => {
    // إعادة التوجيه التلقائي للوحة التحكم لأن الصفحة تم حذفها
    router.replace("/admin/dashboard");
  }, [router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-primary">
      <Loader2 className="w-12 h-12 animate-spin opacity-20" />
      <p className="font-black text-xl">جاري إعادة توجيهك...</p>
    </div>
  );
}
