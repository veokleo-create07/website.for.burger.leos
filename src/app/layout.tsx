import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leo's Burger",
  description: "Leo's Burger website.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
