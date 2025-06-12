import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Edit, Loader2, MapPin, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Branch {
  id: string;
  name: string;
  address: string | null;
  city_id: string;
  is_active: boolean;
  lat: number | null;
  lng: number | null;
  pickup_slots: any | null;
  created_at?: string;
  updated_at?: string;
}

interface City {
  id: string;
  name_ar: string;
  name_en: string;
  governorate_id: string;
  is_active: boolean;
}

export default function BranchesTable() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [currentBranch, setCurrentBranch] = useState<Branch>({
    id: '',
    name: '',
    address: '',
    city_id: '',
    is_active: true,
    lat: null,
    lng: null,
    pickup_slots: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCities().then(() => fetchBranches());
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      if (!supabase) {
        throw new Error('لم يتم تهيئة اتصال Supabase');
      }

      const { data, error } = await supabase
        .from('branches')
        .select(`
          *,
          cities:city_id (id, name_ar, name_en)
        `)
        .order('name', { ascending: true });

      if (error) throw error;

      console.log('Branches data:', data);
      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast({
        title: "خطأ في جلب الفروع",
        description: error instanceof Error ? error.message : "حدث خطأ غير معروف",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      if (!supabase) {
        throw new Error('لم يتم تهيئة اتصال Supabase');
      }

      // إضافة تأخير صغير لتجنب مشاكل الاتصال المتزامن
      await new Promise(resolve => setTimeout(resolve, 100));

      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('is_active', true)
        .order('name_ar', { ascending: true });

      if (error) throw error;

      console.log('Cities data:', data);
      setCities(data || []);
      return data;
    } catch (error) {
      console.error('Error fetching cities:', error);
      toast({
        title: "خطأ في جلب المدن",
        description: error instanceof Error ? error.message : "حدث خطأ غير معروف",
        variant: "destructive"
      });
      return [];
    }
  };

  const handleOpenDialog = (branch?: Branch) => {
    if (branch) {
      setCurrentBranch(branch);
      setIsEditing(true);
    } else {
      setCurrentBranch({
        id: '',
        name: '',
        address: '',
        city_id: '',
        is_active: true,
        lat: null,
        lng: null,
        pickup_slots: null
      });
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentBranch(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setCurrentBranch(prev => ({
      ...prev,
      is_active: checked
    }));
  };

  const handleCityChange = (value: string) => {
    console.log('Selected city:', value);
    setCurrentBranch(prev => ({
      ...prev,
      city_id: value
    }));
  };

  const handleCoordinateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? null : parseFloat(value);
    setCurrentBranch(prev => ({
      ...prev,
      [name]: numValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      if (!supabase) {
        throw new Error('لم يتم تهيئة اتصال Supabase');
      }

      const now = new Date().toISOString();
      const branchData = {
        ...currentBranch,
        updated_at: now
      };

      if (isEditing) {
        // تحديث فرع موجود
        const { error } = await supabase
          .from('branches')
          .update(branchData)
          .eq('id', currentBranch.id);

        if (error) throw error;

        toast({
          title: "تم التحديث بنجاح",
          description: "تم تحديث بيانات الفرع بنجاح"
        });
      } else {
        // إضافة فرع جديد
        // نحذف حقل id عند إنشاء فرع جديد لأن Supabase سيقوم بإنشاء معرف UUID جديد تلقائيًا
        const { id, ...newBranchData } = branchData;
        const { error } = await supabase
          .from('branches')
          .insert({
            ...newBranchData,
            created_at: now
          });

        if (error) throw error;

        toast({
          title: "تمت الإضافة بنجاح",
          description: "تم إضافة الفرع الجديد بنجاح"
        });
      }

      setOpenDialog(false);
      fetchBranches();
    } catch (error) {
      console.error('Error saving branch:', error);
      toast({
        title: "خطأ في حفظ البيانات",
        description: error instanceof Error ? error.message : "حدث خطأ غير معروف",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setBranchToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!branchToDelete) return;
    setActionLoading(true);

    try {
      if (!supabase) {
        throw new Error('لم يتم تهيئة اتصال Supabase');
      }

      // التحقق من وجود طلبات مرتبطة بهذا الفرع
      const { data: relatedOrders, error: checkError } = await supabase
        .from('orders')
        .select('id')
        .eq('pickup_branch_id', branchToDelete)
        .limit(1);

      if (checkError) throw checkError;

      if (relatedOrders && relatedOrders.length > 0) {
        toast({
          title: "لا يمكن حذف الفرع",
          description: "هذا الفرع مرتبط بطلبات موجودة. قم بتعطيله بدلاً من حذفه.",
          variant: "destructive"
        });
        setDeleteConfirmOpen(false);
        setActionLoading(false);
        return;
      }

      // حذف الفرع إذا لم يكن مرتبطًا بأي طلبات
      const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', branchToDelete);

      if (error) throw error;

      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الفرع بنجاح"
      });

      fetchBranches();
    } catch (error) {
      console.error('Error deleting branch:', error);
      toast({
        title: "خطأ في حذف الفرع",
        description: error instanceof Error ? error.message : "حدث خطأ غير معروف",
        variant: "destructive"
      });
    } finally {
      setDeleteConfirmOpen(false);
      setActionLoading(false);
      setBranchToDelete(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">الفروع</h2>
        <Button onClick={() => handleOpenDialog()} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          <span>إضافة فرع</span>
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
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">العنوان</TableHead>
                <TableHead className="text-right">المدينة</TableHead>
                <TableHead className="text-right">الإحداثيات</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                    لا توجد فروع مضافة
                  </TableCell>
                </TableRow>
              ) : (
                branches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell>{branch.name}</TableCell>
                    <TableCell>{branch.address || 'غير محدد'}</TableCell>
                    <TableCell>
                      {/* @ts-ignore */}
                      {branch.cities?.name_ar || 'غير محدد'}
                    </TableCell>
                    <TableCell>
                      {branch.lat && branch.lng ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-xs">{`${branch.lat.toFixed(6)}, ${branch.lng.toFixed(6)}`}</span>
                        </div>
                      ) : (
                        'غير محدد'
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${branch.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {branch.is_active ? 'نشط' : 'غير نشط'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(branch)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(branch.id)}
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

      {/* إضافة/تعديل فرع */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[425px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'تعديل فرع' : 'إضافة فرع جديد'}</DialogTitle>
            <DialogDescription>
              قم بإدخال بيانات الفرع بشكل صحيح
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right col-span-1">
                  الاسم
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={currentBranch.name || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right col-span-1">
                  العنوان
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={currentBranch.address || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="city_id" className="text-right col-span-1">
                  المدينة
                </Label>
                <div className="col-span-3 space-y-2">
                  <select
                    id="city_id"
                    name="city_id"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={currentBranch.city_id || ""}
                    onChange={(e) => handleCityChange(e.target.value)}
                    required
                  >
                    <option value="" disabled>اختر المدينة</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name_ar}
                      </option>
                    ))}
                  </select>
                  
                  {/* عرض عدد المدن المتاحة */}
                  <div className="text-xs text-gray-500 mt-1">
                    عدد المدن المتاحة: {cities.length}
                  </div>
                  
                  {/* رسالة تحذيرية وزر إضافة مدينة */}
                  {cities.length === 0 && (
                    <div className="flex flex-col space-y-2">
                      <p className="text-xs text-red-500">لا توجد مدن مسجلة. يرجى إضافة مدن أولاً.</p>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs" 
                        onClick={() => {
                          setOpenDialog(false);
                          // الانتقال إلى تبويب المدن في صفحة الشحن
                          const tabElement = document.querySelector('[data-value="cities"]');
                          if (tabElement) {
                            (tabElement as HTMLElement).click();
                          }
                        }}
                      >
                        إضافة مدينة جديدة
                      </Button>
                    </div>
                  )}
                  
                  {/* زر تحديث قائمة المدن */}
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs mt-1" 
                    onClick={() => {
                      console.log('Refreshing cities list...');
                      fetchCities();
                    }}
                  >
                    تحديث قائمة المدن
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lat" className="text-right col-span-1">
                  خط العرض
                </Label>
                <Input
                  id="lat"
                  name="lat"
                  type="number"
                  step="0.000001"
                  value={currentBranch.lat || ''}
                  onChange={handleCoordinateChange}
                  className="col-span-3"
                  placeholder="مثال: 30.123456"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lng" className="text-right col-span-1">
                  خط الطول
                </Label>
                <Input
                  id="lng"
                  name="lng"
                  type="number"
                  step="0.000001"
                  value={currentBranch.lng || ''}
                  onChange={handleCoordinateChange}
                  className="col-span-3"
                  placeholder="مثال: 31.123456"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="is_active" className="text-right col-span-1">
                  نشط
                </Label>
                <div className="col-span-3 flex items-center">
                  <Switch
                    id="is_active"
                    checked={currentBranch.is_active || false}
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
            <p>هل أنت متأكد من حذف هذا الفرع؟</p>
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