import { NextResponse } from 'next/server';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const GET = async () => {
  try {
    const { count: totalSales } = await supabase
      .from("sales")
      .select("quantity_sold", { count: "exact", head: true });

    const { count: totalProducts } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    const { data: salesByDateRaw } = await supabase
      .from("sales")
      .select("sold_at, quantity_sold")
      .order("sold_at", { ascending: true });

    const salesByDate: { sold_at: string; quantity_sold: number }[] = [];
    if (salesByDateRaw) {
      const grouped: Record<string, number> = {};
      for (const sale of salesByDateRaw) {
        const date = sale.sold_at.slice(0, 10);
        grouped[date] = (grouped[date] || 0) + sale.quantity_sold;
      }
      for (const [sold_at, quantity_sold] of Object.entries(grouped)) {
        salesByDate.push({ sold_at, quantity_sold });
      }
    }

    const { data: topLocationsRaw } = await supabase.rpc("get_top_locations");
    const topLocations = (topLocationsRaw || []).map(
      (loc: { location_name: string; total_sold: number }) => ({
        location_name: loc.location_name,
        total_sold: loc.total_sold,
      })
    );

    const { data: topProductsRaw } = await supabase.rpc("get_top_products");
    const topProducts = (topProductsRaw || []).map(
      (prod: { product_name: string; total_sold: number }) => ({
        product_name: prod.product_name,
        total_sold: prod.total_sold,
      })
    );

    return NextResponse.json({
      totalSales: totalSales ?? 0,
      totalProducts: totalProducts ?? 0,
      salesByDate,
      topLocations,
      topProducts,
    });
  } catch (err) {
    console.error("[Analytics API]", err);
    return NextResponse.json(
      { message: "Failed to load analytics" },
      { status: 500 }
    );
  }
};
