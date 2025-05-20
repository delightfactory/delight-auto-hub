
import React from 'react';
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

const CustomerListHeader: React.FC = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[50px]">الصورة</TableHead>
        <TableHead>الاسم</TableHead>
        <TableHead>البريد الإلكتروني</TableHead>
        <TableHead>الهاتف</TableHead>
        <TableHead>الموقع</TableHead>
        <TableHead>تاريخ التسجيل</TableHead>
        <TableHead>الصلاحية</TableHead>
        <TableHead className="text-left">الإجراءات</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default CustomerListHeader;
