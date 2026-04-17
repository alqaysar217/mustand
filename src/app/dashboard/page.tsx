
"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/card";
import { 
  FileText, 
  Users, 
  History, 
  ArrowUpRight, 
  CheckCircle2,
  Clock,
  TrendingUp
} from "lucide-react";

const stats = [
  { label: 'اختبارات رفعت اليوم', value: '24', icon: FileText, color: 'bg-blue-500', trend: '+12%' },
  { label: 'إجمالي الملفات', value: '1,248', icon: CheckCircle2, color: 'bg-green-500', trend: '+5%' },
  { label: 'المستخدمين النشطين', value: '86', icon: Users, color: 'bg-purple-500', trend: '+2%' },
  { label: 'سعة التخزين', value: '14 GB', icon: TrendingUp, color: 'bg-orange-500', trend: '70%' },
];

const recentActivity = [
  { id: 1, action: 'رفع اختبار جديد', student: 'أحمد محمود', subject: 'رياضيات 1', time: 'منذ 5 دقائق' },
  { id: 2, action: 'تعديل بيانات', student: 'سارة خالد', subject: 'فيزياء عامة', time: 'منذ 15 دقيقة' },
  { id: 3, action: 'أرشفة ملف', student: 'خالد وليد', subject: 'برمجة 2', time: 'منذ ساعة' },
  { id: 4, action: 'رفع اختبار جديد', student: 'ليلى مراد', subject: 'اللغة العربية', time: 'منذ ساعتين' },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Navbar />
      
      <main className="mr-0 md:mr-64 p-6 md:p-10 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-1">الرئيسية</h1>
            <p className="text-muted-foreground">ملخص سريع لنشاط النظام اليوم</p>
          </div>
          <div className="bg-primary/5 px-4 py-2 rounded-2xl flex items-center gap-2 border border-primary/10">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary">{new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <Card key={i} className="p-6 border-none shadow-xl rounded-3xl group hover:-translate-y-1 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl ${stat.color} text-white shadow-lg`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-[10px] font-bold">
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.trend}
                </div>
              </div>
              <h3 className="text-muted-foreground text-sm font-medium mb-1">{stat.label}</h3>
              <p className="text-3xl font-black text-primary">{stat.value}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 p-8 border-none shadow-xl rounded-3xl bg-white">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <History className="w-5 h-5" />
                آخر النشاطات
              </h2>
              <button className="text-sm text-secondary font-bold hover:underline">عرض الكل</button>
            </div>
            
            <div className="space-y-6">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary font-bold">
                    {item.id}
                  </div>
                  <div className="flex-1">
                    <p className="text-primary font-bold">{item.action}: <span className="text-secondary">{item.subject}</span></p>
                    <p className="text-xs text-muted-foreground">الطالب: {item.student}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground font-medium">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-8 border-none shadow-xl rounded-3xl gradient-blue text-white relative overflow-hidden">
             <div className="relative z-10">
              <h2 className="text-xl font-bold mb-4">نصيحة اليوم</h2>
              <p className="text-white/80 text-sm leading-relaxed mb-6">
                استخدم ميزة "التحليل التلقائي" لتوفير وقتك. نظام الذكاء الاصطناعي لدينا أصبح أسرع بنسبة 40% في استخراج بيانات الطلاب.
              </p>
              <button className="bg-white text-primary px-6 py-2.5 rounded-xl text-sm font-bold shadow-xl hover:scale-105 transition-transform">
                تجربة الآن
              </button>
             </div>
             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
             <div className="absolute top-0 right-0 p-4 opacity-20">
              <TrendingUp className="w-24 h-24" />
             </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
