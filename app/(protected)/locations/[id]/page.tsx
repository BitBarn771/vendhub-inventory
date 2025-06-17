'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import { supabase } from '@/lib/supabase';
import { useProtectedRoute } from '@/lib/useProtectedRoute';

type InventoryItem = {
  id: string;
  current_stock: number;
  products: {
    name: string | null;
    upc: string | null;
  } | null;
};

type Sale = {
  id: string;
  sold_at: string;
  quantity_sold: number;
  products: {
    name: string | null;
  } | null;
};

const LocationDetailPage = () => {
  useProtectedRoute();
  const { id } = useParams();
  const router = useRouter();

  const [locationName, setLocationName] = useState("");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!id || typeof id !== "string") return;

    setLoading(true);

    const { data: locationData } = await supabase
      .from("locations")
      .select("name")
      .eq("id", id)
      .single();

    setLocationName(locationData?.name || "Unknown");

    const { data: inventoryData, error } = await supabase
      .from("inventory")
      .select("id, current_stock, products(name, upc)")
      .eq("location_id", id);

    if (!error && inventoryData) {
      setInventory(inventoryData as unknown as InventoryItem[]);
    }

    const { data: salesData } = await supabase
      .from("sales")
      .select("id, sold_at, quantity_sold, products(name)")
      .eq("location_id", id)
      .order("sold_at", { ascending: false })
      .limit(20);
    setSales((salesData as unknown as Sale[]) || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  return (
    <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mt-6 inline-block bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm cursor-pointer"
        >
          Back
        </button>
      <div className="flex justify-between items-center mb-4 mt-4 gap-4">
        <h1 className="text-2xl font-bold">Inventory: {locationName}</h1>
        <div className="space-x-2">
          <Link
            href={`/upload?location=${id}`}
            className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700 h-8"
          >
            Upload CSV
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : inventory.length === 0 ? (
        <p className="text-gray-600">No inventory data found</p>
      ) : (
        <>
          <table className="w-full table-auto border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2">Product Name</th>
                <th className="text-left px-4 py-2">UPC</th>
                <th className="text-left px-4 py-2">Current Stock</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item, idx) => (
                <tr
                  key={item.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-4 py-2">{item.products?.name || "—"}</td>
                  <td className="px-4 py-2">{item.products?.upc || "—"}</td>
                  <td className="px-4 py-2">{item.current_stock}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mt-4 text-sm text-gray-500">
            Total Products: <strong>{inventory.length}</strong>
          </p>
        </>
      )}

      {sales.length > 0 && (
        <div className="mt-4 mb-4 h-96 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-2">
            Sales History (last 20)
          </h2>
          <table className="w-full border border-gray-300 table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2">Date</th>
                <th className="text-left px-4 py-2">Product</th>
                <th className="text-left px-4 py-2">Quantity Sold</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td className="px-4 py-2">
                    {new Date(sale.sold_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">{sale.products?.name || "—"}</td>
                  <td className="px-4 py-2">{sale.quantity_sold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LocationDetailPage;
