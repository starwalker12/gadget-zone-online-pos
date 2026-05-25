-- Add description column to product_categories so the catalog UI can collect optional notes per category.
alter table public.product_categories
  add column if not exists description text;
