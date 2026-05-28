import type { Metadata } from "next";

import "./globals.css";
import { Navbar } from "@/components/custom/navbar";

export const metadata: Metadata = {
  title: "GNIOT X AWS Builders Hub",
  description: "Campus Developer Community Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
