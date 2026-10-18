import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HyperBoard Console",
  description: "Admin console for HyperBoard Studio",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
