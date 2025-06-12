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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface City {
  id: string;
  name_ar: string;
  name_en: string;
  governorate_id: string;
  delivery_fee: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  delivery_days: string[] | null;
}

interface Governorate {
  id: string;
  name_ar: string;
  name_en: string;
  is_active: boolean;
}

export default function CitiesTable() {
  const [cities, setCities] = useState<City[]>([]);
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCity, setCurrentCity] = useState<Partial<City>>({
    name_ar: '',
    name_en: '',
    governorate_id: '',
    delivery_fee: 0,
    is_active: true,
    delivery_days: []
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    // استدعاء وظيفة جلب المحافظات أولاً، ثم جلب المدن بعد ذلك
    fetchGovernorates()
      .then(() => fetchCities())
      .catch(error => console.error('Error in initial data loading:', error));
  }, []);

  const fetchCities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cities')
        .select(`
          *,
          governorates (
            id,
            name_ar,
            name_en
          )
        `)
        .order('name_ar', { ascending: true });
      
      if (error) throw error;
      setCities(data || []);
    } catch (error) {
      console.error('Error fetching cities:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء جلب بيانات المدن',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGovernorates = async () => {
    console.log('Starting to fetch governorates...');
    try {
      // إضافة تأخير بسيط للتأكد من جاهزية الاتصال
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // التحقق من اتصال Supabase
      if (!supabase) {
        console.error('Supabase client is not initialized');
        throw new Error('Supabase client is not initialized');
      }
      
      console.log('Supabase client is ready, fetching governorates...');
      
      // جلب جميع المحافظات بدون أي شروط
      const { data, error } = await supabase
        .from('governorates')
        .select('*')
        .order('name_ar', { ascending: true });
      
      if (error) {
        console.error('Supabase error fetching governorates:', error);
        throw error;
      }
      
      // طباعة البيانات في وحدة التحكم للتحقق منها
      console.log('Fetched governorates successfully:', data);
      console.log('Number of governorates:', data?.length || 0);
      
      // التحقق من البيانات قبل تعيينها
      if (!data || data.length === 0) {
        console.warn('No governorates found in the database!');
      } else {
        // طباعة المحافظة الأولى للتحقق من هيكل البيانات
        console.log('First governorate:', data[0]);
      }
      
      // تحديث حالة المكون
      setGovernorates(data || []);
      
      // إعادة البيانات للاستخدام في مكان آخر
      return data || [];
    } catch (error) {
      console.error('Error fetching governorates:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء جلب بيانات المحافظات',
        variant: 'destructive',
      });
      return []; // إعادة مصفوفة فارغة في حالة حدوث خطأ
    }
  };

  const handleOpenDialog = (city?: City) => {
    if (city) {
      setCurrentCity(city);
      setIsEditing(true);
    } else {
      setCurrentCity({
        name_ar: '',
        name_en: '',
        governorate_id: '',
        delivery_fee: 0,
        is_active: true,
        delivery_days: []
      });
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'delivery_fee') {
      // تحويل القيمة إلى رقم
      const numValue = parseFloat(value);
      setCurrentCity(prev => ({
        ...prev,
        [name]: isNaN(numValue) ? 0 : numValue
      }));
    } else {
      setCurrentCity(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setCurrentCity(prev => ({
      ...prev,
      is_active: checked
    }));
  };

  const handleGovernorateChange = (value: string) => {
    console.log('Selected governorate ID:', value);
    
    // التحقق من أن المحافظة المختارة موجودة في قائمة المحافظات
    const selectedGovernorate = governorates.find(gov => gov.id === value);
    if (selectedGovernorate) {
      console.log('Found selected governorate:', selectedGovernorate.name_ar);
    } else {
      console.warn('Selected governorate not found in the list!');
    }
    
    // تحديث حالة المدينة الحالية
    setCurrentCity(prev => {
      const updated = {
        ...prev,
        governorate_id: value
      };
      console.log('Updated city state:', updated);
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    
    try {
      if (isEditing) {
        const { error } = await supabase
          .from('cities')
          .update({
            name_ar: currentCity.name_ar,
            name_en: currentCity.name_en,
            governorate_id: currentCity.governorate_id,
            delivery_fee: currentCity.delivery_fee,
            is_active: currentCity.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentCity.id);
        
        if (error) throw error;
        
        toast({
          title: 'تم التحديث',
          description: 'تم تحديث المدينة بنجاح',
        });
      } else {
        const { error } = await supabase
          .from('cities')
          .insert({
            name_ar: currentCity.name_ar,
            name_en: currentCity.name_en,
            governorate_id: currentCity.governorate_id,
            delivery_fee: currentCity.delivery_fee,
            is_active: currentCity.is_active,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (error) throw error;
        
        toast({
          title: 'تمت الإضافة',
          description: 'تم إضافة المدينة بنجاح',
        });
      }
      
      setOpenDialog(false);
      fetchCities();
    } catch (error) {
      console.error('Error saving city:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ بيانات المدينة',
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
      const { error } = await supabase
        .from('cities')
        .delete()
        .eq('id', deleteId);
      
      if (error) throw error;
      
      toast({
        title: 'تم الحذف',
        description: 'تم حذف المدينة بنجاح',
      });
      
      setDeleteConfirmOpen(false);
      fetchCities();
    } catch (error) {
      console.error('Error deleting city:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حذف المدينة',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(value);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">المدن</h2>
        <Button onClick={() => handleOpenDialog()} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          <span>إضافة مدينة</span>
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
                <TableHead className="text-right">المحافظة</TableHead>
                <TableHead className="text-right">رسوم الشحن</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                    لا توجد مدن مضافة
                  </TableCell>
                </TableRow>
              ) : (
                cities.map((city) => (
                  <TableRow key={city.id}>
                    <TableCell>{city.name_ar}</TableCell>
                    <TableCell>{city.name_en}</TableCell>
                    <TableCell>
                      {/* @ts-ignore */}
                      {city.governorates?.name_ar || 'غير محدد'}
                    </TableCell>
                    <TableCell dir="ltr" className="text-right">
                      {formatCurrency(city.delivery_fee)}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${city.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {city.is_active ? 'نشط' : 'غير نشط'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(city)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(city.id)}
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

      {/* إضافة/تعديل مدينة */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[425px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'تعديل مدينة' : 'إضافة مدينة جديدة'}</DialogTitle>
            <DialogDescription>
              قم بإدخال بيانات المدينة بشكل صحيح
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
                  value={currentCity.name_ar || ''}
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
                  value={currentCity.name_en || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="governorate_id" className="text-right col-span-1">
                  المحافظة
                </Label>
                <div className="col-span-3 space-y-2">
                  {/* استخدام قائمة منسدلة أساسية بدلاً من مكون Select */}
                  <select
                    id="governorate_id"
                    name="governorate_id"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={currentCity.governorate_id || ""}
                    onChange={(e) => handleGovernorateChange(e.target.value)}
                    required
                  >
                    <option value="" disabled>اختر المحافظة</option>
                    {governorates.map((governorate) => (
                      <option key={governorate.id} value={governorate.id}>
                        {governorate.name_ar}
                      </option>
                    ))}
                  </select>
                  
                  {/* عرض عدد المحافظات المتاحة */}
                  <div className="text-xs text-gray-500 mt-1">
                    عدد المحافظات المتاحة: {governorates.length}
                  </div>
                  
                  {/* رسالة تحذيرية وزر إضافة محافظة */}
                  {governorates.length === 0 && (
                    <div className="flex flex-col space-y-2">
                      <p className="text-xs text-red-500">لا توجد محافظات مسجلة. يرجى إضافة محافظات أولاً.</p>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs" 
                        onClick={() => {
                          setOpenDialog(false);
                          // الانتقال إلى تبويب المحافظات في صفحة الشحن
                          const tabElement = document.querySelector('[data-value="governorates"]');
                          if (tabElement) {
                            (tabElement as HTMLElement).click();
                          }
                        }}
                      >
                        إضافة محافظة جديدة
                      </Button>
                    </div>
                  )}
                  
                  {/* زر تحديث قائمة المحافظات */}
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs mt-1" 
                    onClick={() => {
                      console.log('Refreshing governorates list...');
                      fetchGovernorates();
                    }}
                  >
                    تحديث قائمة المحافظات
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="delivery_fee" className="text-right col-span-1">
                  رسوم الشحن
                </Label>
                <div className="col-span-3 relative">
                  <Input
                    id="delivery_fee"
                    name="delivery_fee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={currentCity.delivery_fee || 0}
                    onChange={handleInputChange}
                    className="pl-12"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none text-gray-500">
                    ج.م
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="is_active" className="text-right col-span-1">
                  نشط
                </Label>
                <div className="col-span-3 flex items-center">
                  <Switch
                    id="is_active"
                    checked={currentCity.is_active || false}
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
            <p>هل أنت متأكد من حذف هذه المدينة؟</p>
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
