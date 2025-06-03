import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface PickupSelectorProps {
  cityId: string;
  selectedBranch: string;
  onBranchChange: (branchId: string) => void;
}

interface Branch {
  id: string;
  name: string;
  address: string;
  city_id: string;
  is_active: boolean;
}

export default function PickupSelector({
  cityId,
  selectedBranch,
  onBranchChange
}: PickupSelectorProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cityId) {
      fetchBranches();
    } else {
      setBranches([]);
    }
  }, [cityId]);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('city_id', cityId)
        .eq('is_active', true)
        .order('name', { ascending: true });
      
      if (error) throw error;
      setBranches(data || []);
      
      // إذا كان هناك فرع واحد فقط، نقوم باختياره تلقائيًا
      if (data && data.length === 1) {
        onBranchChange(data[0].id);
      } else if (data && data.length > 0 && !selectedBranch) {
        // إذا كان هناك أكثر من فرع ولم يتم اختيار أي منهم، نختار الأول افتراضيًا
        onBranchChange(data[0].id);
      } else if (data && data.length === 0) {
        // إذا لم يكن هناك فروع، نقوم بإعادة تعيين الاختيار
        onBranchChange('');
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-20">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        لا توجد فروع متاحة في هذه المدينة
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label>اختر فرع الاستلام</Label>
      <RadioGroup value={selectedBranch} onValueChange={onBranchChange}>
        {branches.map((branch) => (
          <div key={branch.id} className="flex items-center space-x-2 space-x-reverse border p-3 rounded-md">
            <RadioGroupItem value={branch.id} id={`branch-${branch.id}`} />
            <Label htmlFor={`branch-${branch.id}`} className="flex-1 cursor-pointer">
              <div className="font-medium">{branch.name}</div>
              <div className="text-sm text-gray-500">{branch.address}</div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
