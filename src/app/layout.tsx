import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Xorazm ERP",
  description: "Supermarket, apteka va restoran boshqaruv tizimi demo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
