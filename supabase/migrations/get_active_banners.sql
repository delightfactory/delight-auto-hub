-- وظيفة للحصول على البانرات النشطة حسب اسم الصفحة
CREATE OR REPLACE FUNCTION get_active_banners(page_name TEXT)
RETURNS SETOF banners
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT *
  FROM banners
  WHERE 
    is_active = true AND
    (start_at IS NULL OR start_at <= NOW()) AND
    (end_at IS NULL OR end_at >= NOW()) AND
    (page_name = ANY(pages) OR page_name = 'all')
  ORDER BY display_order ASC;
$$;
