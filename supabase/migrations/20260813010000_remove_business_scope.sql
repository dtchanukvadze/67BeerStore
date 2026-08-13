-- This application serves one store, so business scoping is unnecessary.
drop function if exists public.create_sale_transaction(uuid, text, jsonb);

alter table public.categories drop column if exists business_id cascade;
alter table public.products drop column if exists business_id cascade;
alter table public.expense_categories drop column if exists business_id cascade;
alter table public.sales drop column if exists business_id cascade;
alter table public.expenses drop column if exists business_id cascade;
alter table public.daily_closings drop column if exists business_id cascade;
drop table if exists public.businesses cascade;

alter table public.categories add constraint categories_name_key unique (name);
alter table public.expense_categories add constraint expense_categories_name_key unique (name);
alter table public.daily_closings add constraint daily_closings_closing_date_key unique (closing_date);

create function public.create_sale_transaction(
  p_payment_method text,
  p_cart_items jsonb
)
returns table (sale_id uuid, sale_number bigint, total_amount numeric)
language plpgsql security definer set search_path = public
as $$
declare new_sale public.sales; item jsonb; calculated_total numeric := 0;
begin
  if jsonb_array_length(p_cart_items) = 0 then raise exception 'Cart cannot be empty'; end if;
  for item in select * from jsonb_array_elements(p_cart_items) loop
    if not exists (select 1 from products where id = (item->>'product_id')::uuid and active) then
      raise exception 'Product with ID % is unavailable', item->>'product_id';
    end if;
    calculated_total := calculated_total + ((item->>'quantity')::integer * (item->>'unit_price')::numeric);
  end loop;
  insert into sales (payment_method, total_amount) values (p_payment_method, calculated_total) returning * into new_sale;
  for item in select * from jsonb_array_elements(p_cart_items) loop
    insert into sale_items (sale_id, product_id, quantity, unit_price) values (new_sale.id, (item->>'product_id')::uuid, (item->>'quantity')::integer, (item->>'unit_price')::numeric);
  end loop;
  return query select new_sale.id, new_sale.sale_number, new_sale.total_amount;
end;
$$;
