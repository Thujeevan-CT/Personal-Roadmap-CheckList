import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

/** Roobert PRO from public/fonts/ – Light 300, Regular 400, Medium 500, Bold 700 */
const roobert = localFont({
  src: [
    {
      path: "../../public/fonts/RoobertPRO-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/RoobertPRO-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/RoobertPRO-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/RoobertPRO-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-roobert",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MyFlow",
  description: "Structured goal execution, simplified.",
};

import { Providers } from "@/components/providers/providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={roobert.variable}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
