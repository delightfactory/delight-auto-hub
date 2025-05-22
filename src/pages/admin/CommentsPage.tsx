import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MessageCircle, 
  Check, 
  X, 
  AlertTriangle,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useQuery } from '@tanstack/react-query';
import { commentService } from '@/services/adminService';
import type { Comment } from '@/types/db';
import { Link } from 'react-router-dom';

// Status helpers
const getStatusColor = (status: string) => {
  switch(status) {
    case 'approved':
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    case 'spam':
      return 'bg-red-100 text-red-800 hover:bg-red-100';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  }
};

const getStatusText = (status: string) => {
  switch(status) {
    case 'approved':
      return 'معتمد';
    case 'pending':
      return 'قيد المراجعة';
    case 'spam':
      return 'سبام';
    default:
      return status;
  }
};

const getStatusIcon = (status: string) => {
  switch(status) {
    case 'approved':
      return <Check className="w-3 h-3" />;
    case 'pending':
      return <AlertTriangle className="w-3 h-3" />;
    case 'spam':
      return <X className="w-3 h-3" />;
    default:
      return null;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

const CommentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'spam'>('all');
  const {
    data: comments = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['admin-comments'],
    queryFn: commentService.getAllComments,  // Use getAllComments instead of getComments
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const updateCommentStatus = async (id: string, status: 'approved' | 'pending' | 'spam') => {
    try {
      await commentService.updateCommentStatus(id, status);
      refetch();
    } catch (error) {
      console.error(`خطأ في تحديث حالة التعليق رقم ${id}:`, error);
    }
  };

  const deleteComment = async (id: string) => {
    try {
      await commentService.deleteComment(id);
      refetch();
    } catch (error) {
      console.error(`خطأ في حذف التعليق رقم ${id}:`, error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    );
  }

  const filteredComments = comments.filter(comment => {
    // Apply text search
    const matchesSearch = 
      comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.product.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter
    const matchesFilter = filter === 'all' || comment.status === filter;
    
    return matchesSearch && matchesFilter;
  });
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">التعليقات</h1>
        <p className="text-gray-500 dark:text-gray-400">إدارة تعليقات المستخدمين على المنتجات والمقالات</p>
      </div>
      
      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="ابحث في التعليقات..."
            className="pr-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-gray-500" />
          <Button 
            variant="outline" 
            className={`${filter === 'all' ? 'bg-gray-100' : ''}`}
            onClick={() => setFilter('all')}
          >
            الكل
          </Button>
          <Button 
            variant="outline" 
            className={`${filter === 'pending' ? 'bg-yellow-100' : ''}`}
            onClick={() => setFilter('pending')}
          >
            قيد المراجعة
          </Button>
          <Button 
            variant="outline" 
            className={`${filter === 'approved' ? 'bg-green-100' : ''}`}
            onClick={() => setFilter('approved')}
          >
            معتمد
          </Button>
          <Button 
            variant="outline" 
            className={`${filter === 'spam' ? 'bg-red-100' : ''}`}
            onClick={() => setFilter('spam')}
          >
            سبام
          </Button>
        </div>
      </div>
      
      {/* Comments table */}
      <div className="overflow-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">التعليق</TableHead>
              <TableHead>المؤلف</TableHead>
              <TableHead>المرجع</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredComments.map(comment => (
              <TableRow key={comment.id}>
                <TableCell className="font-medium">
                  <div className="line-clamp-2">{comment.content}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={comment.author.avatar_url || undefined} />
                      <AvatarFallback className="text-xs bg-gray-100">
                        {comment.author.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{comment.author.name}</div>
                      <div className="text-xs text-gray-500">{comment.author.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {comment.product
                    ? comment.product.name
                    : comment.article
                      ? <Link to={`/articles/${comment.article.slug}`}>{comment.article.title}</Link>
                      : ''}
                </TableCell>
                <TableCell>{formatDate(comment.created_at)}</TableCell>
                <TableCell>
                  <Badge className={`${getStatusColor(comment.status)} border-none`}>
                    {getStatusIcon(comment.status)}
                    <span className="mr-1">{getStatusText(comment.status)}</span>
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            onClick={() => updateCommentStatus(comment.id, 'approved')}
                          >
                            <Check className="mr-2 h-4 w-4 text-green-600" />
                            <span>اعتماد</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateCommentStatus(comment.id, 'pending')}
                          >
                            <AlertTriangle className="mr-2 h-4 w-4 text-yellow-600" />
                            <span>تعليق</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateCommentStatus(comment.id, 'spam')}
                          >
                            <X className="mr-2 h-4 w-4 text-red-600" />
                            <span>تصنيف كسبام</span>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="text-red-600"
                            >
                              حذف التعليق
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>هل أنت متأكد من حذف هذا التعليق؟</AlertDialogTitle>
                              <AlertDialogDescription>
                                لا يمكن التراجع عن هذا الإجراء، سيتم حذف التعليق نهائيًا.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteComment(comment.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {filteredComments.length === 0 && (
        <div className="text-center py-10">
          <MessageCircle className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">لا توجد تعليقات</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || filter !== 'all' 
              ? "لم نعثر على أي تعليقات تطابق معايير البحث الخاصة بك."
              : "لم يتم إضافة أي تعليقات بعد."}
          </p>
        </div>
      )}
    </div>
  );
};

export default CommentsPage;
