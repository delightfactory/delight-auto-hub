
import React, { useState } from 'react';
import { Users, Send, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { notificationService, NotificationType } from '@/services/notificationService';

interface BroadcastFormProps {
  notificationTypes: NotificationType[];
  onSuccess: () => void;
}

const BroadcastForm: React.FC<BroadcastFormProps> = ({
  notificationTypes,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    typeId: '',
    title: '',
    message: '',
    targetRole: 'customer',
    priority: 1,
    hasExpiry: false,
    expiresAt: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedType = notificationTypes.find(t => t.id === formData.typeId);
      if (!selectedType) throw new Error('نوع الإشعار غير محدد');

      const expiresAt = formData.hasExpiry && formData.expiresAt 
        ? new Date(formData.expiresAt).toISOString()
        : undefined;

      await notificationService.sendBroadcastNotification(
        selectedType.name,
        formData.title,
        formData.message,
        formData.targetRole,
        {},
        formData.priority,
        expiresAt
      );

      setFormData({
        typeId: '',
        title: '',
        message: '',
        targetRole: 'customer',
        priority: 1,
        hasExpiry: false,
        expiresAt: ''
      });

      onSuccess();
    } catch (error) {
      console.error('Error sending broadcast notification:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* نوع الإشعار */}
        <div className="space-y-2">
          <Label htmlFor="typeId">نوع الإشعار</Label>
          <Select
            value={formData.typeId}
            onValueChange={(value) => setFormData(prev => ({ ...prev, typeId: value }))}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع الإشعار" />
            </SelectTrigger>
            <SelectContent>
              {notificationTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: type.color }}
                    />
                    <span>{type.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* الجمهور المستهدف */}
        <div className="space-y-2">
          <Label htmlFor="targetRole">الجمهور المستهدف</Label>
          <Select
            value={formData.targetRole}
            onValueChange={(value) => setFormData(prev => ({ ...prev, targetRole: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Users className="h-4 w-4" />
                  <span>العملاء</span>
                </div>
              </SelectItem>
              <SelectItem value="admin">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Users className="h-4 w-4" />
                  <span>المسؤولين</span>
                </div>
              </SelectItem>
              <SelectItem value="all">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Users className="h-4 w-4" />
                  <span>الجميع</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* العنوان */}
      <div className="space-y-2">
        <Label htmlFor="title">عنوان الإشعار</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="أدخل عنوان الإشعار العام"
          required
        />
      </div>

      {/* الرسالة */}
      <div className="space-y-2">
        <Label htmlFor="message">محتوى الإشعار</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          placeholder="أدخل محتوى الإشعار العام"
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* الأولوية */}
        <div className="space-y-2">
          <Label htmlFor="priority">الأولوية</Label>
          <Select
            value={formData.priority.toString()}
            onValueChange={(value) => setFormData(prev => ({ ...prev, priority: parseInt(value) }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">منخفضة</SelectItem>
              <SelectItem value="2">عادية</SelectItem>
              <SelectItem value="3">متوسطة</SelectItem>
              <SelectItem value="4">عالية</SelectItem>
              <SelectItem value="5">عاجلة</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* تاريخ الانتهاء */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox
              id="hasExpiry"
              checked={formData.hasExpiry}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, hasExpiry: !!checked, expiresAt: '' }))
              }
            />
            <Label htmlFor="hasExpiry">تحديد تاريخ انتهاء</Label>
          </div>
          {formData.hasExpiry && (
            <Input
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
            />
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-700"
      >
        <Send className="h-4 w-4 ml-2" />
        {loading ? 'جارِ الإرسال...' : 'إرسال الإشعار العام'}
      </Button>
    </form>
  );
};

export default BroadcastForm;
