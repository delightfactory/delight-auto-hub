-- Migration: Drop temp_product_code, enforce FK on product_id

-- 1. Drop old FK constraint on temp_product_code
ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_product_code_fkey;

-- 2. Drop temp_product_code column
ALTER TABLE public.order_items DROP COLUMN IF EXISTS temp_product_code;

-- 3. Convert product_id to uuid type
ALTER TABLE public.order_items ALTER COLUMN product_id TYPE uuid USING product_id::uuid;

-- 4. Add FK constraint on product_id referencing products(id)
ALTER TABLE public.order_items ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
