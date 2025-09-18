import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SessionProvider } from "next-auth/react";
import { Navigation } from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "App Factory Hub",
  description: "Sistema de fábrica de aplicativos com IA",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased`}>
        <SessionProvider session={session}>
          {session && <Navigation />}
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}