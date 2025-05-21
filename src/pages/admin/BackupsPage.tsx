
import React, { useState } from 'react';
import { Database, Download, Upload, FileArchive, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Mock data for backup history
const backupHistory = [
  {
    id: '1',
    date: '2023-05-20T14:30:00Z',
    size: '42.5 MB',
    type: 'full',
    status: 'completed',
  },
  {
    id: '2',
    date: '2023-05-15T10:45:00Z',
    size: '38.7 MB',
    type: 'full',
    status: 'completed',
  },
  {
    id: '3',
    date: '2023-05-10T09:15:00Z',
    size: '35.2 MB',
    type: 'full',
    status: 'completed',
  },
  {
    id: '4',
    date: '2023-05-05T16:20:00Z',
    size: '34.8 MB',
    type: 'full',
    status: 'completed',
  },
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const BackupsPage = () => {
  const { toast } = useToast();
  const [isBackupInProgress, setIsBackupInProgress] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [backupList, setBackupList] = useState(backupHistory);
  
  const simulateBackup = () => {
    setIsBackupInProgress(true);
    setBackupProgress(0);
    
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsBackupInProgress(false);
          
          // Add a new backup to the list
          const newBackup = {
            id: (backupList.length + 1).toString(),
            date: new Date().toISOString(),
            size: `${(40 + Math.random() * 5).toFixed(1)} MB`,
            type: 'full',
            status: 'completed',
          };
          
          setBackupList([newBackup, ...backupList]);
          
          toast({
            title: "تم إنشاء النسخة الاحتياطية بنجاح",
            description: "تم حفظ النسخة الاحتياطية بنجاح في قاعدة البيانات.",
            variant: "success",
          });
          
          return 100;
        }
        return newProgress;
      });
    }, 300);
  };
  
  const downloadBackup = (backupId: string) => {
    toast({
      title: "جاري تحميل النسخة الاحتياطية",
      description: "سيبدأ تحميل الملف خلال لحظات.",
      variant: "info",
    });
    // In a real app, this would trigger an actual download
  };
  
  const deleteBackup = (backupId: string) => {
    setBackupList(backupList.filter(backup => backup.id !== backupId));
    toast({
      title: "تم حذف النسخة الاحتياطية",
      description: "تم حذف النسخة الاحتياطية المحددة بنجاح.",
      variant: "success",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">النسخ الاحتياطي</h1>
        <p className="text-gray-500 dark:text-gray-400">إدارة النسخ الاحتياطي واستعادة البيانات</p>
      </div>
      
      <Tabs defaultValue="backup" className="w-full">
        <TabsList>
          <TabsTrigger value="backup">النسخ الاحتياطي</TabsTrigger>
          <TabsTrigger value="restore">استعادة البيانات</TabsTrigger>
          <TabsTrigger value="schedule">الجدولة</TabsTrigger>
        </TabsList>
        
        <TabsContent value="backup" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>إنشاء نسخة احتياطية</CardTitle>
                <CardDescription>إنشاء نسخة احتياطية جديدة لقاعدة البيانات</CardDescription>
              </CardHeader>
              <CardContent>
                {isBackupInProgress ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium">جاري إنشاء النسخة الاحتياطية...</p>
                      <span className="text-sm">{Math.round(backupProgress)}%</span>
                    </div>
                    <Progress value={backupProgress} />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      يرجى عدم إغلاق المتصفح أو إعادة تحميل الصفحة.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Database className="h-12 w-12 text-gray-400" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        سيتم إنشاء نسخة احتياطية كاملة لقاعدة البيانات الخاصة بك.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">الإعدادات المتقدمة</Button>
                <Button 
                  onClick={simulateBackup} 
                  disabled={isBackupInProgress}
                >
                  {isBackupInProgress ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      جاري النسخ
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      إنشاء نسخة احتياطية
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>استيراد نسخة احتياطية</CardTitle>
                <CardDescription>رفع ملف نسخة احتياطية موجود مسبقًا</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-6 text-center space-y-4">
                  <div className="mx-auto flex items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">اسحب وأفلت الملف هنا</p>
                    <p className="text-xs text-gray-500">أو انقر لتحديد ملف</p>
                  </div>
                  <Button variant="outline" size="sm">
                    تصفح الملفات
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <p className="text-xs text-gray-500">الصيغ المدعومة: .zip, .sql, .gz</p>
                <Button disabled>رفع الملف</Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>سجل النسخ الاحتياطي</CardTitle>
              <CardDescription>النسخ الاحتياطية السابقة التي تم إنشاؤها</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right font-medium p-2">التاريخ</th>
                      <th className="text-right font-medium p-2">النوع</th>
                      <th className="text-right font-medium p-2">الحجم</th>
                      <th className="text-right font-medium p-2">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backupList.map(backup => (
                      <tr key={backup.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-2">{formatDate(backup.date)}</td>
                        <td className="p-2">
                          <span className="rounded-full bg-blue-100 text-blue-800 px-2 py-1 text-xs">
                            {backup.type === 'full' ? 'كامل' : 'جزئي'}
                          </span>
                        </td>
                        <td className="p-2">{backup.size}</td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => downloadBackup(backup.id)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              تحميل
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-4 h-4"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                    />
                                  </svg>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>حذف النسخة الاحتياطية</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    هل أنت متأكد من رغبتك في حذف هذه النسخة الاحتياطية؟
                                    لا يمكن التراجع عن هذا الإجراء.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction 
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={() => deleteBackup(backup.id)}
                                  >
                                    حذف
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="restore" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>استعادة البيانات</CardTitle>
              <CardDescription>استعادة البيانات من نسخة احتياطية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4">
                <h3 className="font-medium flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  تحذير
                </h3>
                <p className="mt-1 text-sm">
                  استعادة البيانات ستؤدي إلى استبدال جميع البيانات الحالية بالبيانات من النسخة الاحتياطية.
                  هذا الإجراء لا يمكن التراجع عنه.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">اختر نسخة احتياطية للاستعادة</h3>
                <div className="space-y-2">
                  {backupList.map(backup => (
                    <div 
                      key={backup.id} 
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <FileArchive className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">{formatDate(backup.date)}</p>
                          <p className="text-xs text-gray-500">{backup.size}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        اختيار
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    استعادة البيانات
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>تأكيد استعادة البيانات</AlertDialogTitle>
                    <AlertDialogDescription>
                      أنت على وشك استعادة جميع البيانات من نسخة احتياطية.
                      سيؤدي هذا إلى استبدال جميع البيانات الحالية.
                      هل أنت متأكد من رغبتك في المتابعة؟
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction className="bg-orange-600 hover:bg-orange-700">
                      تأكيد الاستعادة
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="schedule" className="space-y-4">
          {/* Schedule tab content */}
          <Card>
            <CardHeader>
              <CardTitle>جدولة النسخ الاحتياطي التلقائي</CardTitle>
              <CardDescription>تكوين إعدادات النسخ الاحتياطي التلقائي</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-sm text-gray-500 py-8">ميزة الجدولة قيد التطوير وستتوفر قريبًا.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BackupsPage;
