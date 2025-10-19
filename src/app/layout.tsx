import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/navigation";
export const metadata: Metadata = {
  title: "GlowFactory",
  description: "GlowFactory",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#f9fafc]">
        <Navigation />
        {children}
      </body>
    </html>
  );
}
