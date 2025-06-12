import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Truck, Store, MapPin } from 'lucide-react';

export type DeliveryMethod = 'shipping' | 'branch' | 'pickup_point';

interface DeliveryMethodSelectorProps {
  selectedMethod: DeliveryMethod;
  onMethodChange: (method: DeliveryMethod) => void;
  cityId: string;
  hasBranches: boolean;
  hasPickupPoints: boolean;
}

export default function DeliveryMethodSelector({
  selectedMethod,
  onMethodChange,
  cityId,
  hasBranches,
  hasPickupPoints
}: DeliveryMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <Label>اختر طريقة التسليم</Label>
      <RadioGroup value={selectedMethod} onValueChange={(value) => onMethodChange(value as DeliveryMethod)}>
        <div className="flex items-center space-x-2 space-x-reverse border p-3 rounded-md">
          <RadioGroupItem value="shipping" id="delivery-shipping" />
          <Label htmlFor="delivery-shipping" className="flex-1 cursor-pointer">
            <div className="flex items-center">
              <Truck className="h-4 w-4 ml-2" />
              <div>
                <div className="font-medium">توصيل للمنزل</div>
                <div className="text-sm text-gray-500">سيتم توصيل طلبك إلى عنوانك</div>
              </div>
            </div>
          </Label>
        </div>

        {hasBranches && (
          <div className="flex items-center space-x-2 space-x-reverse border p-3 rounded-md">
            <RadioGroupItem value="branch" id="delivery-branch" />
            <Label htmlFor="delivery-branch" className="flex-1 cursor-pointer">
              <div className="flex items-center">
                <Store className="h-4 w-4 ml-2" />
                <div>
                  <div className="font-medium">استلام من الفرع</div>
                  <div className="text-sm text-gray-500">استلم طلبك من أحد فروعنا</div>
                </div>
              </div>
            </Label>
          </div>
        )}

        {hasPickupPoints && (
          <div className="flex items-center space-x-2 space-x-reverse border p-3 rounded-md">
            <RadioGroupItem value="pickup_point" id="delivery-pickup" />
            <Label htmlFor="delivery-pickup" className="flex-1 cursor-pointer">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 ml-2" />
                <div>
                  <div className="font-medium">استلام من نقطة استلام</div>
                  <div className="text-sm text-gray-500">استلم طلبك من نقطة استلام قريبة منك</div>
                </div>
              </div>
            </Label>
          </div>
        )}
      </RadioGroup>
    </div>
  );
}