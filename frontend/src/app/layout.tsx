import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <QueryProvider>
          <ThemeProvider>
            <NotificationProvider>
              <Header />
              <main className="flex-1">
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
