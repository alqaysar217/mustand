
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Briefcase, Settings2, Loader2, ArrowRight, User, Lock, LogIn } from "lucide-react";

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
    // محاكاة تسجيل الدخول بناءً على الدور
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
        <div className="relative w-40 h-40 mb-6 flex items-center justify-center">
           <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl animate-pulse" />
           <div className="w-32 h-32 bg-white rounded-[10px] flex items-center justify-center border-2 border-white/20 relative z-10 shadow-2xl animate-fade-in overflow-hidden">
              <Image src="/logo-sand.png" alt="Logo" fill className="object-cover" priority />
           </div>
        </div>
        <h1 className="text-4xl font-black mb-2 tracking-tight">مستند</h1>
        <p className="text-white/70 mb-8 font-bold">مستقبلك الرقمي يبدأ هنا</p>
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  if (stage === 'role') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background animate-fade-in text-right" dir="rtl">
        <div className="mb-10 text-center">
          <div className="relative w-24 h-24 mx-auto mb-4 bg-white rounded-[10px] shadow-xl flex items-center justify-center border-2 border-primary/10 overflow-hidden">
            <Image src="/logo-sand.png" alt="Logo" fill className="object-cover" />
          </div>
          <h1 className="text-3xl font-black text-primary">نظام مستند</h1>
        </div>
        <h2 className="text-xl font-bold text-muted-foreground mb-8 text-center">اختر نوع المستخدم للبدء</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
          {[
            { id: 'employee', label: 'موظف أرشفة', icon: Briefcase, desc: 'إدارة ورفع الملفات وتصحيح البيانات' },
            { id: 'manager', label: 'مدير نظام', icon: Settings2, desc: 'إدارة الصلاحيات، الكليات، والتقارير' }
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
              <p className="text-muted-foreground text-center text-sm font-bold">{role.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background animate-fade-in text-right" dir="rtl">
      <Card className="w-full max-w-md p-8 shadow-2xl rounded-3xl bg-white border-none relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-6 right-6 rounded-xl hover:bg-primary/5"
          onClick={() => setStage('role')}
          title="الرجوع"
        >
          <ArrowRight className="w-6 h-6 text-primary" />
        </Button>

        <div className="text-center mb-10">
          <div className="relative mx-auto bg-primary/5 rounded-[10px] mb-4 border border-primary/10 overflow-hidden w-24 h-24">
            <Image src="/logo-sand.png" alt="Logo" fill className="object-cover" />
          </div>
          <h2 className="text-2xl font-black text-primary">تسجيل الدخول - {selectedRole === 'manager' ? 'الإدارة' : 'الأرشفة'}</h2>
          <p className="text-muted-foreground mt-1 font-bold">أهلاً بك مرة أخرى في نظام الأرشفة</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold pr-1 text-primary">اسم المستخدم</label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="text" 
                className="w-full h-12 pr-10 pl-4 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-bold"
                placeholder="اسم المستخدم الخاص بك"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold pr-1 text-primary">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="password" 
                className="w-full h-12 pr-10 pl-4 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground font-bold">
              <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
              <span>تذكرني</span>
            </label>
            <button type="button" className="text-sm text-secondary font-bold hover:underline">نسيت كلمة المرور؟</button>
          </div>

          <Button 
            disabled={loading}
            className="w-full h-12 rounded-xl text-lg font-black gradient-blue shadow-lg gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin ml-2" /> : <LogIn className="w-5 h-5" />}
            دخول النظام
          </Button>
        </form>
      </Card>
    </div>
  );
}
