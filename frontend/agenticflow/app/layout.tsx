import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Lora } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";
import { ShellDataProvider } from "@/components/shell/ShellData";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Pactline AI — Algorithmic Fairness & Deal Intelligence",
  description:
    "Build, orchestrate, and audit algorithmic fairness and autonomous creator contracts with Pactline.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${plusJakartaSans.className} ${lora.variable} antialiased tracking-tight bg-black text-white`}>
        <ShellDataProvider>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </ShellDataProvider>
      </body>
    </html>
  );
}
