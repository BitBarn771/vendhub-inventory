'use client';

import { ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useProtectedRoute } from '@/lib/useProtectedRoute';
import { supabase } from '@/lib/supabase';
import Button from '@/shared/Button';

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Upload CSV",
    href: "/upload",
  },
  {
    label: "Analytics",
    href: "/analytics",
  },
];

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useProtectedRoute();
  const [menuOpen, setMenuOpen] = useState(false);

  const fullName =
    user?.identities?.length && user.identities[0]?.identity_data
      ? `${user.identities[0].identity_data.first_name || ""} ${
          user.identities[0].identity_data.last_name || ""
        }`.trim()
      : "";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading) return <p className="p-6 text-gray-600">Checking session...</p>;
  if (!user) return <p className="p-6 text-red-600">Not authorized</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav
        className="bg-white shadow px-2 sm:px-4 md:px-6 py-3 flex justify-between items-center relative"
        aria-label="Main navigation"
      >
        <div className="hidden sm:flex gap-4">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-gray-800 font-semibold hover:underline"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <button
          className="sm:hidden flex items-center px-2 py-1 border rounded text-gray-700 border-gray-300 focus:outline-none"
          aria-label="Open menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        {menuOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-md z-20 flex flex-col gap-2 py-2 sm:hidden animate-fade-in">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block px-4 py-2 text-gray-800 font-semibold hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
        <span className="block sm:hidden text-center text-sm text-gray-600 py-2">
          {fullName}
        </span>
        <div className="flex items-center gap-4">
          <span className="text-md text-gray-600 hidden sm:inline-block">
            {fullName}
          </span>
          <Button
            onClick={handleLogout}
            className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 lg:w-32 xs:w-24 transition cursor-pointer"
          >
            Log Out
          </Button>
        </div>
      </nav>
      <main className="max-w-screen-lg mx-auto w-full px-2 sm:px-4 md:px-6 py-4">
        {children}
      </main>
    </div>
  );
}
