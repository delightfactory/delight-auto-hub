
import React, { useState, useEffect } from 'react';
import { Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { notificationService, NotificationType } from '@/services/notificationService';
import { supabase } from '@/integrations/supabase/client';

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface NotificationFormProps {
  notificationTypes: NotificationType[];
  onSuccess: () => void;
}

const NotificationForm: React.FC<NotificationFormProps> = ({
  notificationTypes,
  onSuccess
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    typeId: '',
    title: '',
    message: '',
    priority: 1
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, email')
        .order('name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedType = notificationTypes.find(t => t.id === formData.typeId);
      if (!selectedType) throw new Error('نوع الإشعار غير محدد');

      await notificationService.sendNotification(
        formData.userId,
        selectedType.name,
        formData.title,
        formData.message,
        {},
        formData.priority
      );

      setFormData({
        userId: '',
        typeId: '',
        title: '',
        message: '',
        priority: 1
      });

      onSuccess();
    } catch (error) {
      console.error('Error sending notification:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* اختيار المستخدم */}
        <div className="space-y-2">
          <Label htmlFor="userId">المستخدم</Label>
          <Select
            value={formData.userId}
            onValueChange={(value) => setFormData(prev => ({ ...prev, userId: value }))}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر المستخدم" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <User className="h-4 w-4" />
                    <span>{customer.name}</span>
                    <span className="text-sm text-gray-500">({customer.email})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
      </div>

      {/* العنوان */}
      <div className="space-y-2">
        <Label htmlFor="title">عنوان الإشعار</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="أدخل عنوان الإشعار"
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
          placeholder="أدخل محتوى الإشعار"
          rows={4}
          required
        />
      </div>

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

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        <Send className="h-4 w-4 ml-2" />
        {loading ? 'جارِ الإرسال...' : 'إرسال الإشعار'}
      </Button>
    </form>
  );
};

export default NotificationForm;
