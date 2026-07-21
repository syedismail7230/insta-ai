import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

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
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (publishableKey) {
    return (
      <ClerkProvider publishableKey={publishableKey}>
        <html lang="en" className="dark">
          <body className={`${inter.className} bg-[#09090b] text-white antialiased`}>{children}</body>
        </html>
      </ClerkProvider>
    );
  }

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#09090b] text-white antialiased`}>{children}</body>
    </html>
  );
}
