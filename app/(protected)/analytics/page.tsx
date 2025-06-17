'use client';

import { useEffect, useState } from 'react';
import { useProtectedRoute } from '@/lib/useProtectedRoute';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { fetchAnalytics } from '@/lib/api';

function formatDate(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type AnalyticsData = {
  totalSales: number;
  totalProducts: number;
  salesByDate: { sold_at: string; quantity_sold: number }[];
  topLocations: { location_name: string; total_sold: number }[];
  topProducts: { product_name: string; total_sold: number }[];
};

const AnalyticsPage = () => {
  useProtectedRoute();

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getAnalytics = async () => {
      try {
        const json = await fetchAnalytics();
        setData(json);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unexpected error");
      } finally {
        setLoading(false);
      }
    };
    getAnalytics();
  }, []);

  if (loading) return <p className="p-6">Loading analytics...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-2 sm:p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Sales Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded shadow p-6 flex flex-col items-center">
          <p className="text-gray-500 text-sm">Total Sales</p>
          <p className="text-3xl font-semibold text-indigo-700">
            {data?.totalSales ?? 0}
          </p>
        </div>
        <div className="bg-white rounded shadow p-6 flex flex-col items-center">
          <p className="text-gray-500 text-sm">Total Products</p>
          <p className="text-3xl font-semibold text-indigo-700">
            {data?.totalProducts ?? 0}
          </p>
        </div>
      </div>

      <div className="bg-white rounded shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-2">Sales Over Time</h2>
        {data?.salesByDate && data.salesByDate.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={data.salesByDate}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="sold_at"
                tickFormatter={formatDate}
                fontSize={12}
              />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip labelFormatter={formatDate} />
              <Line
                type="monotone"
                dataKey="quantity_sold"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-center">No sales data available</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-center md:text-left">
            Top Locations
          </h2>
          {data?.topLocations && data.topLocations.length > 0 ? (
            <ul className="space-y-2">
              {data.topLocations.map((loc, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center bg-gray-50 rounded px-3 py-2"
                >
                  <span className="font-medium text-gray-700">
                    {loc.location_name}
                  </span>
                  <span className="text-indigo-700 font-semibold">
                    {loc.total_sold}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-center">No data</p>
          )}
        </div>
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-center md:text-left">
            Top Products
          </h2>
          {data?.topProducts && data.topProducts.length > 0 ? (
            <ul className="space-y-2">
              {data.topProducts.map((prod, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center bg-gray-50 rounded px-3 py-2"
                >
                  <span className="font-medium text-gray-700">
                    {prod.product_name}
                  </span>
                  <span className="text-indigo-700 font-semibold">
                    {prod.total_sold}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-center">No data</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
