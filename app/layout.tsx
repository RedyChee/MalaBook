import type { Metadata } from "next";
import { Geist, Geist_Mono, ZCOOL_XiaoWei } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const zcool = ZCOOL_XiaoWei({
  variable: "--font-zcool",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MalaBook 🌶️ — Match by mala. Meet over málà.",
  description:
    "Singapore's flavor-first dating app. Match by Chinese spice preferences and let AI pick your perfect mala spot.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${zcool.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[var(--mala-charcoal)] flex">
        <div className="mx-auto w-full max-w-[420px] min-h-screen bg-background text-foreground shadow-[0_30px_80px_-30px_rgba(0,0,0,0.5)] sm:my-6 sm:rounded-[40px] sm:overflow-hidden flex flex-col">
          {children}
        </div>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
