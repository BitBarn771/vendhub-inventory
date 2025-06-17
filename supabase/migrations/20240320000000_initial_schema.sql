-- Locations table
create table public.locations (
  id uuid not null default gen_random_uuid (),
  name text null,
  code text null,
  inserted_at timestamp with time zone null default timezone ('utc'::text, now()),
  constraint locations_pkey primary key (id),
  constraint locations_code_key unique (code)
) TABLESPACE pg_default;

-- Products table
create table public.products (
  id uuid not null default gen_random_uuid (),
  name text null,
  upc text null,
  inserted_at timestamp with time zone null default timezone ('utc'::text, now()),
  constraint products_pkey primary key (id),
  constraint products_upc_key unique (upc)
) TABLESPACE pg_default;

-- Inventory table
create table public.inventory (
  id uuid not null default gen_random_uuid (),
  location_id uuid null,
  product_id uuid null,
  current_stock integer null default 0,
  updated_at timestamp with time zone null default timezone ('utc'::text, now()),
  constraint inventory_pkey primary key (id),
  constraint inventory_location_id_fkey foreign KEY (location_id) references locations (id) on delete CASCADE,
  constraint inventory_product_id_fkey foreign KEY (product_id) references products (id) on delete CASCADE
) TABLESPACE pg_default;

-- Sales table
create table public.sales (
  id uuid not null default gen_random_uuid (),
  location_id uuid null,
  product_id uuid null,
  quantity_sold integer not null,
  sold_at date not null,
  inserted_at timestamp with time zone null default timezone ('utc'::text, now()),
  constraint sales_pkey primary key (id),
  constraint sales_location_id_fkey foreign KEY (location_id) references locations (id) on delete CASCADE,
  constraint sales_product_id_fkey foreign KEY (product_id) references products (id) on delete CASCADE
) TABLESPACE pg_default;

-- Create locations function
create or replace function get_top_locations()
returns table (
  location_name text,
  total_sold int
)
language sql
as $$
  SELECT
    l.name AS location_name,
    SUM(s.quantity_sold) AS total_sold
  FROM sales s
  JOIN locations l ON s.location_id = l.id
  GROUP BY l.name
  ORDER BY total_sold DESC
  LIMIT 5;
$$;

-- create products function
create or replace function get_top_products()
returns table (
  product_name text,
  total_sold integer
)
language sql
as $$
  select
    p.name as product_name,
    sum(s.quantity_sold) as total_sold
  from sales s
  join products p on s.product_id = p.id
  group by p.id, p.name
  order by total_sold desc
  limit 5;
$$;
