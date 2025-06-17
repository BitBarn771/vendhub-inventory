import { NextResponse } from 'next/server';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const POST = async (req: Request) => {
  const { sales } = await req.json();

  type Sale = {
    location_code: string;
    product_name: string;
    product_upc: string;
    quantity: number;
    sold_at: string;
  };
  type Location = { id: string; code: string };
  type Product = { id: string; upc: string };

  const salesArr: Sale[] = sales as Sale[];
  const uniqueLocationCodes = Array.from(
    new Set(salesArr.map((s) => s.location_code))
  );
  const uniqueProductUPCs = Array.from(
    new Set(salesArr.map((s) => s.product_upc))
  );

  const { data: locationsData } = await supabase
    .from("locations")
    .select("id, code")
    .in("code", uniqueLocationCodes);
  const { data: productsData } = await supabase
    .from("products")
    .select("id, upc")
    .in("upc", uniqueProductUPCs);

  const locationMap: Record<string, string> = {};
  ((locationsData as Location[]) || []).forEach((l) => {
    locationMap[l.code] = l.id;
  });
  const productMap: Record<string, string> = {};
  ((productsData as Product[]) || []).forEach((p) => {
    productMap[p.upc] = p.id;
  });

  const missingLocations = uniqueLocationCodes.filter(
    (code) => !locationMap[code]
  );
  if (missingLocations.length > 0) {
    const { data: newLocs } = await supabase
      .from("locations")
      .insert(missingLocations.map((code) => ({ code, name: code })))
      .select();
    ((newLocs as Location[]) || []).forEach((l) => {
      locationMap[l.code] = l.id;
    });
  }

  const missingProducts = uniqueProductUPCs.filter((upc) => !productMap[upc]);
  if (missingProducts.length > 0) {
    const upcToName: Record<string, string> = {};
    salesArr.forEach((s) => {
      upcToName[s.product_upc] = s.product_name;
    });
    const { data: newProds } = await supabase
      .from("products")
      .insert(
        missingProducts.map((upc) => ({ upc, name: upcToName[upc] || upc }))
      )
      .select();
    ((newProds as Product[]) || []).forEach((p) => {
      productMap[p.upc] = p.id;
    });
  }

  for (const [i, sale] of salesArr.entries()) {
    const missingFields = [];
    if (!sale.location_code) missingFields.push("location_code");
    if (!sale.product_name) missingFields.push("product_name");
    if (!sale.product_upc) missingFields.push("product_upc");
    if (typeof sale.quantity !== "number") missingFields.push("quantity");
    if (!sale.sold_at) missingFields.push("sold_at");
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          message: `Missing required field(s) in sale #${
            i + 1
          }: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const location_id = locationMap[sale.location_code];
    const product_id = productMap[sale.product_upc];
    if (!location_id || !product_id) continue;

    await supabase.from("sales").insert({
      location_id,
      product_id,
      quantity_sold: sale.quantity,
      sold_at: sale.sold_at,
    });

    const { data: existingInventory } = await supabase
      .from("inventory")
      .select("id, current_stock")
      .eq("location_id", location_id)
      .eq("product_id", product_id)
      .single();

    if (existingInventory) {
      await supabase
        .from("inventory")
        .update({
          current_stock: existingInventory.current_stock - sale.quantity,
        })
        .eq("id", existingInventory.id);
    } else {
      await supabase.from("inventory").insert({
        location_id,
        product_id,
        current_stock: -sale.quantity,
      });
    }
  }
  return NextResponse.json({ message: "Sales processed successfully." });
};
