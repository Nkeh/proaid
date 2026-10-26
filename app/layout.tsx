import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { StoreHydration } from "@/components/providers/store-hydration";
import { HydrationGate } from "@/components/providers/hydration-gate";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DemoPanel } from "@/components/demo/demo-panel";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ProAid Cameroon - Trusted care, verified providers",
  description:
    "ProAid connects families, professionals and expatriates in Douala with vetted nannies, house helps, cooks and caregivers.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0F5E5A",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <StoreHydration />
        <HydrationGate>
          <TooltipProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <DemoPanel />
            <Toaster position="top-center" />
          </TooltipProvider>
        </HydrationGate>
      </body>
    </html>
  );
}
