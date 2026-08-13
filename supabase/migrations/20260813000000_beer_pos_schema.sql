create extension if not exists "pgcrypto";

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null default '67 Beer Shop',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, name)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(12,2) not null check (price > 0),
  active boolean not null default true,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  sale_number bigint generated always as identity unique,
  payment_method text not null check (payment_method in ('cash', 'card', 'bank_transfer')),
  total_amount numeric(12,2) not null check (total_amount >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, name)
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  category_id uuid not null references public.expense_categories(id),
  amount numeric(12,2) not null check (amount > 0),
  payment_method text not null check (payment_method in ('cash', 'card', 'bank_transfer')),
  description text,
  expense_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_closings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  closing_date date not null,
  actual_cash numeric(12,2) not null check (actual_cash >= 0),
  expected_cash numeric(12,2) not null,
  difference numeric(12,2) not null,
  created_at timestamptz not null default now(),
  unique (business_id, closing_date)
);

create or replace function public.create_sale_transaction(
  p_business_id uuid,
  p_payment_method text,
  p_cart_items jsonb
)
returns table (sale_id uuid, sale_number bigint, total_amount numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  new_sale public.sales;
  item jsonb;
  calculated_total numeric := 0;
begin
  if jsonb_array_length(p_cart_items) = 0 then
    raise exception 'Cart cannot be empty';
  end if;
  for item in select * from jsonb_array_elements(p_cart_items) loop
    if not exists (select 1 from products where id = (item->>'product_id')::uuid and business_id = p_business_id and active) then
      raise exception 'Product with ID % is unavailable', item->>'product_id';
    end if;
    calculated_total := calculated_total + ((item->>'quantity')::integer * (item->>'unit_price')::numeric);
  end loop;
  insert into sales (business_id, payment_method, total_amount)
  values (p_business_id, p_payment_method, calculated_total)
  returning * into new_sale;
  for item in select * from jsonb_array_elements(p_cart_items) loop
    insert into sale_items (sale_id, product_id, quantity, unit_price)
    values (new_sale.id, (item->>'product_id')::uuid, (item->>'quantity')::integer, (item->>'unit_price')::numeric);
  end loop;
  return query select new_sale.id, new_sale.sale_number, new_sale.total_amount;
end;
$$;

insert into public.businesses (name)
select '67 Beer Shop'
where not exists (select 1 from public.businesses);

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;
