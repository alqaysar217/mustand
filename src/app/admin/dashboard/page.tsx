
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  FileText, 
  Archive, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  GraduationCap
} from "lucide-react";
import { 
  Bar, 
  BarChart, 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { cn } from "@/lib/utils";

const stats = [
  { label: 'إجمالي الطلاب', value: '4,520', icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-100', trend: '+12%', isUp: true },
  { label: 'إجمالي الاختبارات', value: '12,840', icon: FileText, color: 'text-green-600', bg: 'bg-green-100', trend: '+8%', isUp: true },
  { label: 'ملفات اليوم', value: '156', icon: Archive, color: 'text-purple-600', bg: 'bg-purple-100', trend: '+24%', isUp: true },
  { label: 'عدد الموظفين', value: '32', icon: Users, color: 'text-orange-600', bg: 'bg-orange-100', trend: '-2%', isUp: false },
];

const examData = [
  { name: 'يناير', value: 400 },
  { name: 'فبراير', value: 600 },
  { name: 'مارس', value: 800 },
  { name: 'أبريل', value: 700 },
  { name: 'مايو', value: 1200 },
  { name: 'يونيو', value: 1500 },
];

const subjectData = [
  { name: 'برمجة 1', value: 120 },
  { name: 'رياضيات', value: 98 },
  { name: 'فيزياء', value: 86 },
  { name: 'كيمياء', value: 72 },
  { name: 'قواعد بيانات', value: 110 },
];

const deptData = [
  { name: 'تقنية معلومات', value: 45 },
  { name: 'علوم حاسوب', value: 30 },
  { name: 'هندسة برمجيات', value: 25 },
];

const COLORS = ['#0B3C5D', '#328CC1', '#D9E3F0'];

export default function AdminDashboard() {
  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div>
        <h1 className="text-3xl font-black text-primary mb-1">لوحة تحكم النظام</h1>
        <p className="text-muted-foreground font-bold">نظرة شاملة على أداء المؤسسة التعليمية</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6 border-none shadow-xl rounded-3xl bg-white hover:-translate-y-1 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} shadow-sm`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black",
                stat.isUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
              )}>
                {stat.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <h3 className="text-muted-foreground text-xs font-bold mb-1">{stat.label}</h3>
            <p className="text-3xl font-black text-primary">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8 border-none shadow-xl rounded-3xl bg-white">
          <h2 className="text-lg font-bold text-primary mb-6">نمو الأرشفة (شهرياً)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={examData}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="value" stroke="#328CC1" strokeWidth={4} dot={{ r: 6, fill: '#328CC1', strokeWidth: 0 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-8 border-none shadow-xl rounded-3xl bg-white">
          <h2 className="text-lg font-bold text-primary mb-6">أكثر المواد أرشفة</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6', radius: 10 }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#0B3C5D" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 p-8 border-none shadow-xl rounded-3xl bg-white flex flex-col items-center justify-center">
          <h2 className="text-lg font-bold text-primary mb-6 w-full text-right">توزيع التخصصات</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {deptData.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></span>
                <span className="text-xs font-bold text-muted-foreground">{d.name}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2 p-8 border-none shadow-xl rounded-3xl bg-white">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-primary">آخر العمليات على النظام</h2>
            <Button variant="ghost" className="text-secondary font-bold rounded-xl">عرض الكل</Button>
          </div>
          <div className="space-y-6">
            {[
              { user: 'محمد علي', action: 'رفع اختبار', target: 'برمجة 1', time: 'منذ دقيقتين', color: 'bg-green-500' },
              { user: 'سارة خالد', action: 'تعديل طالب', target: 'أحمد محمود', time: 'منذ 15 دقيقة', color: 'bg-blue-500' },
              { user: 'أحمد وليد', action: 'حذف ملف', target: 'فيزياء عامة', time: 'منذ ساعة', color: 'bg-red-500' },
              { user: 'ليلى مراد', action: 'إضافة مادة', target: 'الذكاء الاصطناعي', time: 'منذ ساعتين', color: 'bg-purple-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/30 transition-colors border border-transparent hover:border-border">
                <div className={`w-2 h-10 rounded-full ${item.color}`}></div>
                <div className="flex-1 text-right">
                  <p className="text-primary font-bold">{item.user} <span className="text-muted-foreground font-medium">{item.action}:</span> {item.target}</p>
                  <p className="text-[10px] text-muted-foreground font-bold flex items-center justify-end gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
