import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zawr AI - Instagram Sales Agent",
  description: "Production-ready AI-powered Instagram Sales Agent for Zawr Industries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.className} bg-[#09090b] text-white antialiased`}>
        <div className="flex min-h-screen bg-[#09090b]">
          <Sidebar />
          <main className="flex-1 overflow-x-hidden flex flex-col">{children}</main>
        </div>
      </body>
    </html>
  );
}
