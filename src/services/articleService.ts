import { supabase } from '@/integrations/supabase/client';

export const articleService = {
  // الحصول على تفاصيل المقال بواسطة slug
  getArticle: async (slug: string) => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return data;
  },

  // زيادة عدد الإعجابات على المقال
  likeArticle: async (slug: string) => {
    // جلب العدد الحالي
    const { data, error } = await supabase
      .from('articles')
      .select('likes')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    const current = (data as any)?.likes ?? 0;
    // تحديث العدد
    const { data: updated, error: updateError } = await supabase
      .from('articles')
      .update({ likes: current + 1 })
      .eq('slug', slug)
      .single();
    if (updateError) throw updateError;
    return (updated as any)?.likes ?? current + 1;
  },

  // نشر تعليق جديد على المقال
  postComment: async (articleId: string, content: string) => {
    const { data, error } = await supabase
      .from('comments')
      .insert({ content, article_id: articleId, status: 'pending' })
      .single();
    if (error) throw error;
    return data;
  },

  // جلب التعليقات المعتمدة للمقال
  getComments: async (articleId: string) => {
    const { data, error } = await supabase
      .from('comments')
      .select(
        `
        id,
        content,
        status,
        created_at,
        author:customers(name, email, avatar_url)
      `
      )
      .eq('article_id', articleId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    if (error) throw error;
    // تحويل البيانات إلى نوع Comment
    return (data as any[]).map(row => ({
      id: row.id,
      content: row.content,
      status: row.status,
      created_at: row.created_at,
      author: {
        name: row.author?.[0]?.name ?? '',
        email: row.author?.[0]?.email ?? '',
        avatar_url: row.author?.[0]?.avatar_url ?? null,
      },
    }));
  }
};
