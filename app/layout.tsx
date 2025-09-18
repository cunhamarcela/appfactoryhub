import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { auth } from "@/lib/auth";
import { SessionProvider } from "next-auth/react";
import { Layout } from "@/components/Layout";

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
  const session = await auth();

  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased`}>
        <SessionProvider session={session}>
          <Layout hasSession={!!session}>
            {children}
          </Layout>
        </SessionProvider>
      </body>
    </html>
  );
}