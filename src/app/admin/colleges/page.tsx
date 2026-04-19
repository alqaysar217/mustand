
"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  School, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Building2,
  Calendar,
  ShieldCheck,
  Loader2,
  FileText
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// Firebase
import { useFirestore, useCollection } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function AdminCollegesPage() {
  const firestore = useFirestore();
  const collegesQuery = useMemo(() => firestore ? collection(firestore, "colleges") : null, [firestore]);
  const yearsQuery = useMemo(() => firestore ? collection(firestore, "academicYears") : null, [firestore]);

  const { data: colleges = [], loading: loadingColleges } = useCollection(collegesQuery);
  const { data: academicYears = [], loading: loadingYears } = useCollection(yearsQuery);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("colleges");
  const [submitting, setSubmitting] = useState(false);
  
  // States for Colleges
  const [isAddCollegeOpen, setIsAddCollegeOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState<any>(null);
  const [newCollege, setNewCollege] = useState({ name: '', code: '' });

  // States for Years
  const [isAddYearOpen, setIsAddYearOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<any>(null);
  const [newYear, setNewYear] = useState({ label: '' });

  const { toast } = useToast();

  const filteredColleges = useMemo(() => {
    return (colleges as any[]).filter(college => 
      college.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      college.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [colleges, searchTerm]);

  const filteredYears = useMemo(() => {
    return (academicYears as any[]).filter(year => 
      year.label?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [academicYears, searchTerm]);

  // College Handlers
  const handleAddCollege = () => {
    if (!firestore || !newCollege.name || !newCollege.code) return;
    setSubmitting(true);
    const ref = collection(firestore, "colleges");
    const data = { ...newCollege, createdAt: serverTimestamp() };
    addDoc(ref, data)
      .then(() => {
        setIsAddCollegeOpen(false);
        setNewCollege({ name: '', code: '' });
        toast({ title: "تم تفعيل الكلية" });
      })
      .finally(() => setSubmitting(false));
  };

  const handleUpdateCollege = () => {
    if (!firestore || !editingCollege) return;
    setSubmitting(true);
    const docRef = doc(firestore, "colleges", editingCollege.id);
    updateDoc(docRef, { name: editingCollege.name, code: editingCollege.code })
      .then(() => {
        setEditingCollege(null);
        toast({ title: "تم التحديث" });
      })
      .finally(() => setSubmitting(false));
  };

  // Year Handlers
  const handleAddYear = () => {
    if (!firestore || !newYear.label) return;
    setSubmitting(true);
    const ref = collection(firestore, "academicYears");
    const data = { ...newYear, createdAt: serverTimestamp() };
    addDoc(ref, data)
      .then(() => {
        setIsAddYearOpen(false);
        setNewYear({ label: '' });
        toast({ title: "تم إضافة العام الدراسي" });
      })
      .finally(() => setSubmitting(false));
  };

  const handleUpdateYear = () => {
    if (!firestore || !editingYear) return;
    setSubmitting(true);
    const docRef = doc(firestore, "academicYears", editingYear.id);
    updateDoc(docRef, { label: editingYear.label })
      .then(() => {
        setEditingYear(null);
        toast({ title: "تم تحديث العام" });
      })
      .finally(() => setSubmitting(false));
  };

  const handleDelete = async (collectionName: string, id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, collectionName, id));
      toast({ variant: "destructive", title: "تم الحذف" });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في الحذف" });
    }
  };

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary mb-1">إدارة الموارد الأساسية</h1>
          <p className="text-muted-foreground font-bold">التحكم في هيكلية الكليات والسنوات الدراسية</p>
        </div>
      </div>

      <Tabs defaultValue="colleges" onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white p-1 rounded-2xl h-14 shadow-sm border mb-8 flex items-stretch">
          <TabsTrigger value="colleges" className="flex-1 rounded-xl font-bold data-[state=active]:gradient-blue data-[state=active]:text-white">إدارة الكليات</TabsTrigger>
          <TabsTrigger value="years" className="flex-1 rounded-xl font-bold data-[state=active]:gradient-blue data-[state=active]:text-white">الأعوام الدراسية</TabsTrigger>
        </TabsList>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text"
              placeholder={activeTab === 'colleges' ? "البحث بالاسم أو الرمز..." : "البحث بالعام..."}
              className="w-full bg-white outline-none text-sm font-bold text-primary h-12 pr-12 pl-4 rounded-2xl border shadow-sm focus:border-primary/20 transition-all text-right"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => activeTab === 'colleges' ? setIsAddCollegeOpen(true) : setIsAddYearOpen(true)}
            className="rounded-2xl h-12 px-8 font-bold gradient-blue shadow-lg gap-2"
          >
            <Plus className="w-5 h-5" />
            {activeTab === 'colleges' ? 'إضافة كلية' : 'إضافة عام دراسي'}
          </Button>
        </div>

        <TabsContent value="colleges">
          <Card className="border-none shadow-xl rounded-2xl bg-white overflow-hidden">
            <Table className="text-right">
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-right font-bold">الكلية</TableHead>
                  <TableHead className="text-right font-bold">الرمز</TableHead>
                  <TableHead className="text-center font-bold w-32">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingColleges ? (
                  <TableRow><TableCell colSpan={3} className="h-40 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto opacity-20" /></TableCell></TableRow>
                ) : filteredColleges.map((college) => (
                  <TableRow key={college.id}>
                    <TableCell className="p-4 font-bold">{college.name}</TableCell>
                    <TableCell className="font-black text-secondary">{college.code}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setEditingCollege(college)} className="text-secondary hover:bg-secondary/10"><Edit2 className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete('colleges', college.id)} className="text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="years">
          <Card className="border-none shadow-xl rounded-2xl bg-white overflow-hidden">
            <Table className="text-right">
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-right font-bold">العام الجامعي</TableHead>
                  <TableHead className="text-right font-bold">تاريخ الإضافة</TableHead>
                  <TableHead className="text-center font-bold w-32">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingYears ? (
                  <TableRow><TableCell colSpan={3} className="h-40 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto opacity-20" /></TableCell></TableRow>
                ) : filteredYears.map((year) => (
                  <TableRow key={year.id}>
                    <TableCell className="p-4 font-black text-primary text-lg">{year.label}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{year.createdAt?.toDate ? year.createdAt.toDate().toLocaleDateString('en-GB') : '---'}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setEditingYear(year)} className="text-secondary hover:bg-secondary/10"><Edit2 className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete('academicYears', year.id)} className="text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* College Add Dialog */}
      <Dialog open={isAddCollegeOpen} onOpenChange={setIsAddCollegeOpen}>
        <DialogContent className="rounded-3xl border-none text-right" dir="rtl">
          <DialogHeader className="text-right"><DialogTitle className="text-2xl font-black">كلية جديدة</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>الاسم الرسمي</Label><Input value={newCollege.name} onChange={(e) => setNewCollege({...newCollege, name: e.target.value})} className="rounded-xl" /></div>
            <div className="space-y-2"><Label>الرمز المختصر</Label><Input value={newCollege.code} onChange={(e) => setNewCollege({...newCollege, code: e.target.value})} className="rounded-xl uppercase" /></div>
          </div>
          <DialogFooter className="flex-row gap-2">
            <Button onClick={handleAddCollege} disabled={submitting} className="flex-1 rounded-xl gradient-blue">{submitting ? <Loader2 className="animate-spin" /> : 'تفعيل'}</Button>
            <Button variant="outline" onClick={() => setIsAddCollegeOpen(false)} className="flex-1 rounded-xl">إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Year Add Dialog */}
      <Dialog open={isAddYearOpen} onOpenChange={setIsAddYearOpen}>
        <DialogContent className="rounded-3xl border-none text-right" dir="rtl">
          <DialogHeader className="text-right"><DialogTitle className="text-2xl font-black">عام دراسي جديد</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>تسمية العام</Label><Input placeholder="2023 / 2024" value={newYear.label} onChange={(e) => setNewYear({...newYear, label: e.target.value})} className="rounded-xl" /></div>
          </div>
          <DialogFooter className="flex-row gap-2">
            <Button onClick={handleAddYear} disabled={submitting} className="flex-1 rounded-xl gradient-blue">{submitting ? <Loader2 className="animate-spin" /> : 'إضافة'}</Button>
            <Button variant="outline" onClick={() => setIsAddYearOpen(false)} className="flex-1 rounded-xl">إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialogs (Simplified) */}
      <Dialog open={!!editingCollege} onOpenChange={(o) => !o && setEditingCollege(null)}>
        <DialogContent className="rounded-3xl text-right" dir="rtl">
           <DialogHeader className="text-right"><DialogTitle className="font-black">تعديل كلية</DialogTitle></DialogHeader>
           <div className="space-y-4 py-4">
              <Input value={editingCollege?.name} onChange={(e) => setEditingCollege({...editingCollege, name: e.target.value})} className="rounded-xl" />
              <Input value={editingCollege?.code} onChange={(e) => setEditingCollege({...editingCollege, code: e.target.value})} className="rounded-xl uppercase" />
           </div>
           <Button onClick={handleUpdateCollege} className="w-full rounded-xl gradient-blue">حفظ التغييرات</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingYear} onOpenChange={(o) => !o && setEditingYear(null)}>
        <DialogContent className="rounded-3xl text-right" dir="rtl">
           <DialogHeader className="text-right"><DialogTitle className="font-black">تعديل العام الدراسي</DialogTitle></DialogHeader>
           <div className="space-y-4 py-4">
              <Input value={editingYear?.label} onChange={(e) => setEditingYear({...editingYear, label: e.target.value})} className="rounded-xl" />
           </div>
           <Button onClick={handleUpdateYear} className="w-full rounded-xl gradient-blue">تحديث</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
