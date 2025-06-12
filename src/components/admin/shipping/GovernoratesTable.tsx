import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Governorate {
  id: string;
  name_ar: string;
  name_en: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function GovernoratesTable() {
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentGovernorate, setCurrentGovernorate] = useState<Partial<Governorate>>({
    name_ar: '',
    name_en: '',
    is_active: true
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchGovernorates();
  }, []);

  const fetchGovernorates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('governorates')
        .select('*')
        .order('name_ar', { ascending: true });
      
      if (error) throw error;
      setGovernorates(data || []);
    } catch (error) {
      console.error('Error fetching governorates:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء جلب بيانات المحافظات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (governorate?: Governorate) => {
    if (governorate) {
      setCurrentGovernorate(governorate);
      setIsEditing(true);
    } else {
      setCurrentGovernorate({
        name_ar: '',
        name_en: '',
        is_active: true
      });
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentGovernorate(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setCurrentGovernorate(prev => ({
      ...prev,
      is_active: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    
    try {
      if (isEditing) {
        const { error } = await supabase
          .from('governorates')
          .update({
            name_ar: currentGovernorate.name_ar,
            name_en: currentGovernorate.name_en,
            is_active: currentGovernorate.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentGovernorate.id);
        
        if (error) throw error;
        
        toast({
          title: 'تم التحديث',
          description: 'تم تحديث المحافظة بنجاح',
        });
      } else {
        const { error } = await supabase
          .from('governorates')
          .insert({
            name_ar: currentGovernorate.name_ar,
            name_en: currentGovernorate.name_en,
            is_active: currentGovernorate.is_active,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (error) throw error;
        
        toast({
          title: 'تمت الإضافة',
          description: 'تم إضافة المحافظة بنجاح',
        });
      }
      
      setOpenDialog(false);
      fetchGovernorates();
    } catch (error) {
      console.error('Error saving governorate:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ بيانات المحافظة',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    setActionLoading(true);
    try {
      // أولاً نتحقق من وجود مدن مرتبطة بهذه المحافظة
      const { data: cities, error: citiesError } = await supabase
        .from('cities')
        .select('id')
        .eq('governorate_id', deleteId);
      
      if (citiesError) throw citiesError;
      
      if (cities && cities.length > 0) {
        toast({
          title: 'لا يمكن الحذف',
          description: 'لا يمكن حذف المحافظة لأنها تحتوي على مدن مرتبطة بها',
          variant: 'destructive',
        });
        setDeleteConfirmOpen(false);
        setActionLoading(false);
        return;
      }
      
      const { error } = await supabase
        .from('governorates')
        .delete()
        .eq('id', deleteId);
      
      if (error) throw error;
      
      toast({
        title: 'تم الحذف',
        description: 'تم حذف المحافظة بنجاح',
      });
      
      setDeleteConfirmOpen(false);
      fetchGovernorates();
    } catch (error) {
      console.error('Error deleting governorate:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حذف المحافظة',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">المحافظات</h2>
        <Button onClick={() => handleOpenDialog()} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          <span>إضافة محافظة</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم (عربي)</TableHead>
                <TableHead className="text-right">الاسم (إنجليزي)</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {governorates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                    لا توجد محافظات مضافة
                  </TableCell>
                </TableRow>
              ) : (
                governorates.map((governorate) => (
                  <TableRow key={governorate.id}>
                    <TableCell>{governorate.name_ar}</TableCell>
                    <TableCell>{governorate.name_en}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${governorate.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {governorate.is_active ? 'نشط' : 'غير نشط'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(governorate)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(governorate.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* إضافة/تعديل محافظة */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[425px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'تعديل محافظة' : 'إضافة محافظة جديدة'}</DialogTitle>
            <DialogDescription>
              قم بإدخال بيانات المحافظة بشكل صحيح
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name_ar" className="text-right col-span-1">
                  الاسم (عربي)
                </Label>
                <Input
                  id="name_ar"
                  name="name_ar"
                  value={currentGovernorate.name_ar || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name_en" className="text-right col-span-1">
                  الاسم (إنجليزي)
                </Label>
                <Input
                  id="name_en"
                  name="name_en"
                  value={currentGovernorate.name_en || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="is_active" className="text-right col-span-1">
                  نشط
                </Label>
                <div className="col-span-3 flex items-center">
                  <Switch
                    id="is_active"
                    checked={currentGovernorate.is_active || false}
                    onCheckedChange={handleSwitchChange}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-between sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenDialog(false)}
                disabled={actionLoading}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  'حفظ'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* تأكيد الحذف */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>هل أنت متأكد من حذف هذه المحافظة؟</p>
            <p className="text-sm text-gray-500 mt-2">
              لا يمكن التراجع عن هذا الإجراء.
            </p>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={actionLoading}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                'حذف'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
