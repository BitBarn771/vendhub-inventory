'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { supabase } from '@/lib/supabase';
import { useProtectedRoute } from '@/lib/useProtectedRoute';

type Location = {
  id: string;
  name: string;
  code: string;
};

const DashboardPage = () => {
  const { user, loading: authLoading } = useProtectedRoute();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || authLoading) return;

    const fetchLocations = async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("name");

      if (!error && data) {
        setLocations(data as Location[]);
      }

      setLoading(false);
    };

    fetchLocations();
  }, [user, authLoading]);

  if (authLoading)
    return <p className="p-6 text-gray-600">Checking session...</p>;
  if (!user) return <p className="p-6 text-red-600">Not authorized</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Locations Overview
          </h1>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : locations.length === 0 ? (
          <p className="text-gray-600">No locations available.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {locations.map((location) => (
              <div
                key={location.id}
                className="bg-white rounded-lg shadow p-5 flex flex-col justify-between hover:shadow-lg transition"
              >
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {location.name || "Unnamed Location"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Code: {location.code}
                  </p>
                </div>
                <div className="mt-4">
                  <Link
                    href={`/locations/${location.id}`}
                    className="inline-block bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700 transition"
                  >
                    View Inventory
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
