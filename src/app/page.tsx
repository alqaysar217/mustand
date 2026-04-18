
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, Briefcase, Settings2, Loader2 } from "lucide-react";

export default function Home() {
  const [stage, setStage] = useState<'splash' | 'role' | 'login'>('splash');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setStage('role');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setStage('login');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate login based on role
    setTimeout(() => {
      if (selectedRole === 'manager') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    }, 1500);
  };

  if (stage === 'splash') {
    return (
      <div className="fixed inset-0 gradient-blue flex flex-col items-center justify-center text-white z-50">
        <div className="relative w-32 h-32 mb-6 animate-pulse">
           <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse" />
           <Image 
            src={PlaceHolderImages[0].imageUrl} 
            alt="Logo" 
            width={128} 
            height={128} 
            className="rounded-full relative border-4 border-white/30"
            data-ai-hint="archive logo"
          />
        </div>
        <h1 className="text-4xl font-bold mb-2 tracking-tight">نظام الأرشفة الذكي</h1>
        <p className="text-white/70 mb-8 font-light">مستقبلك الرقمي يبدأ هنا</p>
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  if (stage === 'role') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background animate-fade-in">
        <h2 className="text-3xl font-bold text-primary mb-12 text-center">اختر نوع المستخدم</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          {[
            { id: 'student', label: 'طالب', icon: GraduationCap, desc: 'الوصول لملفاتك الأكاديمية' },
            { id: 'employee', label: 'موظف', icon: Briefcase, desc: 'إدارة ورفع الملفات' },
            { id: 'manager', label: 'مدير', icon: Settings2, desc: 'إدارة النظام والتقارير' }
          ].map((role) => (
            <Card 
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
              className="p-8 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 hover:shadow-2xl border-2 border-transparent hover:border-primary group bg-white shadow-xl rounded-3xl"
            >
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <role.icon className="w-10 h-10 text-primary group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-2">{role.label}</h3>
              <p className="text-muted-foreground text-center text-sm">{role.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background animate-fade-in">
      <Card className="w-full max-w-md p-8 shadow-2xl rounded-3xl bg-white border-none">
        <div className="text-center mb-10">
          <div className="inline-block p-4 bg-primary/5 rounded-full mb-4">
            <Image 
              src={PlaceHolderImages[0].imageUrl} 
              alt="Logo" 
              width={64} 
              height={64} 
              className="rounded-full"
            />
          </div>
          <h2 className="text-2xl font-bold text-primary">تسجيل الدخول - {selectedRole === 'manager' ? 'الإدارة' : selectedRole === 'employee' ? 'الموظفين' : 'الطلاب'}</h2>
          <p className="text-muted-foreground mt-1">أهلاً بك مرة أخرى في نظام الأرشفة</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium pr-1 text-primary">اسم المستخدم أو رقم القيد</label>
            <input 
              type="text" 
              className="w-full h-12 px-4 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="مثال: admin"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium pr-1 text-primary">كلمة المرور</label>
            <input 
              type="password" 
              className="w-full h-12 px-4 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground">
              <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
              <span>تذكرني</span>
            </label>
            <button type="button" className="text-sm text-secondary hover:underline">نسيت كلمة المرور؟</button>
          </div>

          <Button 
            disabled={loading}
            className="w-full h-12 rounded-xl text-lg font-bold gradient-blue"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin ml-2" /> : null}
            تسجيل الدخول
          </Button>
        </form>
      </Card>
    </div>
  );
}
