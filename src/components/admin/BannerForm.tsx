import React, { useState, useCallback } from 'react';
import { Banner } from '@/types/db';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Cropper from 'react-easy-crop';
import * as AspectRatio from '@radix-ui/react-aspect-ratio';

interface BannerFormProps {
  initialData?: Banner | null;
  onSubmit: (data: Partial<Banner>) => void;
  onCancel: () => void;
}

const pagesOptions = [
  { value: 'home', label: 'الرئيسية' },
  { value: 'products', label: 'المنتجات' },
  { value: 'product', label: 'تفاصيل المنتج' },
  { value: 'best-deals', label: 'أفضل العروض' },
  { value: 'articles', label: 'المقالات' },
  { value: 'article', label: 'تفاصيل المقالة' },
  { value: 'factory', label: 'المصنع' },
  { value: 'about', label: 'عن الشركة' },
  { value: 'contact', label: 'اتصل بنا' },
  { value: 'profile', label: 'الملف الشخصي' },
  { value: 'checkout', label: 'سلة التسوق' },
  { value: 'orders', label: 'تتبع الطلبات' },
];

const BannerForm: React.FC<BannerFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { toast } = useToast();
  const [title, setTitle] = useState(initialData?.title || '');
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || '');
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || '');
  const [imageSrc, setImageSrc] = useState<string>(initialData?.image_url || '');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const onCropComplete = useCallback((_: any, areaPixels) => setCroppedAreaPixels(areaPixels), []);
  const [linkUrl, setLinkUrl] = useState(initialData?.link_url || '');
  const [buttonText, setButtonText] = useState(initialData?.button_text || '');
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [displayOrder, setDisplayOrder] = useState(initialData?.display_order || 0);
  const [displayInterval, setDisplayInterval] = useState(initialData?.display_interval || 5);
  const [pages, setPages] = useState<string[]>(initialData?.pages || []);
  const [startAt, setStartAt] = useState(initialData?.start_at ? initialData.start_at.slice(0, 16) : '');
  const [endAt, setEndAt] = useState(initialData?.end_at ? initialData.end_at.slice(0, 16) : '');
  const [uploading, setUploading] = useState(false);

  const createImage = (url: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
    const img = new Image(); img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img); img.onerror = (e) => reject(e);
    img.src = url;
  });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number }
  ): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    canvas.width = pixelCrop.width; canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
    return new Promise((res, rej) => {
      canvas.toBlob((file) => file ? res(file) : rej(new Error('Canvas is empty')), 'image/jpeg');
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setImageSrc(reader.result);
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const handleUploadCroppedImage = async () => {
    if (!croppedAreaPixels || !imageSrc) return;
    setUploading(true);
    const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
    const fileName = `${crypto.randomUUID()}.jpg`;
    const file = new File([blob], fileName, { type: blob.type });
    const { error: uploadError } = await supabase.storage.from('banners').upload(fileName, file);
    if (uploadError) { toast({ title: 'خطأ في رفع الصورة', variant: 'destructive' }); setUploading(false); return; }
    const { data: publicData } = supabase.storage.from('banners').getPublicUrl(fileName);
    setImageUrl(publicData.publicUrl);
    setUploading(false);
  };

  const handleTogglePage = (value: string) => {
    setPages(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) {
      toast({ title: 'الرجاء تعبئة الحقول الإلزامية', variant: 'destructive' });
      return;
    }
    onSubmit({
      title,
      subtitle,
      image_url: imageUrl,
      link_url: linkUrl,
      button_text: buttonText,
      is_active: isActive,
      display_order: displayOrder,
      display_interval: displayInterval,
      pages,
      start_at: startAt ? new Date(startAt).toISOString() : null,
      end_at: endAt ? new Date(endAt).toISOString() : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">العنوان الرئيسي <span className="text-red-500">*</span></label>
        <Input value={title} onChange={e => setTitle(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium">العنوان الفرعي</label>
        <Input value={subtitle} onChange={e => setSubtitle(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium">الصورة <span className="text-red-500">*</span></label>
        <Input type="file" accept="image/*" onChange={handleFileChange} />
        <p className="text-xs text-gray-500 mt-1">الأبعاد المثالية للبنر: 1600×400 بكسل (نسبة العرض:ارتفاع 4:1)</p>
        {imageSrc && (
          <>
            <div className="relative w-full h-64 bg-gray-100">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={4 / 1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-grow"
              />
              <Button type="button" onClick={handleUploadCroppedImage} disabled={uploading}>
                {uploading ? 'جارٍ الرفع...' : 'قص وتحميل'}
              </Button>
            </div>
          </>
        )}
        {imageUrl && !imageSrc && (
          <AspectRatio.Root ratio={4 / 1} className="mt-2 bg-gray-50 border-2 border-dashed border-gray-300">
            <img src={imageUrl} alt="معاينة البانر" className="w-full h-full object-cover rounded-lg" />
          </AspectRatio.Root>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium">رابط الزر</label>
        <Input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium">نص الزر</label>
        <Input value={buttonText} onChange={e => setButtonText(e.target.value)} />
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={isActive} onCheckedChange={setIsActive} />
        <span>تفعيل البنر</span>
      </div>
      <div>
        <label className="block text-sm font-medium">ترتيب العرض</label>
        <Input type="number" value={displayOrder} onChange={e => setDisplayOrder(Number(e.target.value))} />
      </div>
      <div>
        <label className="block text-sm font-medium">فاصل التمرير (ثانية)</label>
        <Input type="number" value={displayInterval} onChange={e => setDisplayInterval(Number(e.target.value))} />
      </div>
      <div>
        <label className="block text-sm font-medium">الصفحات</label>
        <div className="flex flex-wrap gap-2">
          {pagesOptions.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-1">
              <Checkbox checked={pages.includes(value)} onCheckedChange={() => handleTogglePage(value)} />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">بداية العرض</label>
        <Input type="datetime-local" value={startAt} onChange={e => setStartAt(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium">نهاية العرض</label>
        <Input type="datetime-local" value={endAt} onChange={e => setEndAt(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={uploading}>{initialData ? 'تحديث' : 'إنشاء'}</Button>
        <Button variant="outline" type="button" onClick={onCancel}>إلغاء</Button>
      </div>
    </form>
  );
};

export default BannerForm;
