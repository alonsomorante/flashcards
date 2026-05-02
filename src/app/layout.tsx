import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { QueryProvider } from "@/components/providers/query-provider";

export const metadata: Metadata = {
  title: "Flashcards",
  description: "Create and study flashcards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <QueryProvider>
          <Navbar />
          <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
