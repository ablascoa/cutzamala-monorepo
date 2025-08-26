import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { RouteErrorBoundary } from "@/components/error-boundaries/RouteErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { QueryProvider } from "@/providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard Sistema Cutzamala",
  description: "Visualización y análisis de datos de almacenamiento de agua del Sistema Cutzamala",
  keywords: "Cutzamala, agua, almacenamiento, CONAGUA, México, reservorios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-surface-50 text-surface-900 dark:bg-surface-900 dark:text-surface-50`}
      >
        <QueryProvider>
          <ThemeProvider>
            <NotificationProvider>
              <Header />
              <Navigation />
              <main className="flex-1 bg-surface-50 dark:bg-surface-900">
                <RouteErrorBoundary>
                  {children}
                </RouteErrorBoundary>
              </main>
              <Footer />
            </NotificationProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
