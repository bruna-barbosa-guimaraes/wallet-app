import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carteira Digital",
  description: "Gerencie suas finanças com segurança",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
