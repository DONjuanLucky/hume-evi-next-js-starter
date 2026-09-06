import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { cn } from "@/utils";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "DEMO · Hume EVI Voice Agent",
  description:
    "Public demo of Hume AI Empathic Voice Interface (EVI) with allowlisted Composio tools. Not production product memory.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          GeistSans.variable,
          GeistMono.variable,
          "flex flex-col min-h-screen"
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="fixed top-0 left-0 z-50 px-4 py-2">
            <span className="inline-flex items-center rounded-full bg-amber-500/90 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-black">
              DEMO · Hume + allowlisted Composio (no product memory)
            </span>
          </div>
          <Nav />
          {children}
          <Toaster position="top-center" richColors={true} />
        </ThemeProvider>
      </body>
    </html>
  );
}
