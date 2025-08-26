"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  description?: string;
}

const navigationItems: NavItem[] = [
  {
    href: "/",
    label: "Dashboard",
    description: "Panel principal del Sistema Cutzamala"
  },
  {
    href: "/informacion",
    label: "Información",
    description: "Acerca del Sistema Cutzamala"
  },
  {
    href: "/productos",
    label: "Otros Productos",
    description: "Productos desarrollados por Ayari Tech"
  }
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <span className="text-xl font-bold text-surface-900 dark:text-surface-50">
                Sistema Cutzamala
              </span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300"
                      : "text-surface-600 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-300 dark:hover:text-surface-50 dark:hover:bg-surface-700"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-surface-600 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-300 dark:hover:text-surface-50 dark:hover:bg-surface-700"
              aria-label="Menú principal"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block px-3 py-2 rounded-md text-base font-medium",
                pathname === item.href
                  ? "bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300"
                  : "text-surface-600 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-300 dark:hover:text-surface-50 dark:hover:bg-surface-700"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}