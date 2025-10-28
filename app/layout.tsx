import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { auth } from "@/lib/auth";
import { SessionProvider } from "next-auth/react";
import { Layout } from "@/components/Layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "App Factory Hub - Fábrica de Aplicativos com IA",
  description: "Plataforma completa para desenvolvimento de aplicativos móveis com inteligência artificial. Gerencie projetos, tarefas, finanças e calendário em um só lugar.",
  keywords: "desenvolvimento de apps, aplicativos móveis, IA, gestão de projetos, flutter, react native",
  authors: [{ name: "App Factory Hub Team" }],
  creator: "App Factory Hub",
  publisher: "App Factory Hub",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://appfactoryhub.vercel.app",
    title: "App Factory Hub - Fábrica de Aplicativos com IA",
    description: "Plataforma completa para desenvolvimento de aplicativos móveis com inteligência artificial.",
    siteName: "App Factory Hub",
  },
  twitter: {
    card: "summary_large_image",
    title: "App Factory Hub - Fábrica de Aplicativos com IA",
    description: "Plataforma completa para desenvolvimento de aplicativos móveis com inteligência artificial.",
  },
  verification: {
    google: "IpMqbyia5KL8vOBqE4teuhLkF2u4f6BZ-epoc87WoC4",
  },
  alternates: {
    canonical: "https://appfactoryhub.vercel.app",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log('RootLayout: Fetching session...');
  const session = await auth();
  console.log('RootLayout: Session fetched - ', session ? 'User logged in' : 'No user session');

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