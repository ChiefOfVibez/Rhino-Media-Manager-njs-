import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rhino Media Manager",
  description: "Next.js UI for Bosch Products DB",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-background text-foreground">
        <header className="border-b bg-card">
          <div className="container flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded bg-primary" />
              <span className="font-semibold">Rhino Media Manager</span>
            </div>
            <nav className="text-sm text-muted-foreground">
              <a href="/" className="hover:text-foreground">Products</a>
            </nav>
          </div>
        </header>
        <main className="container py-6">{children}</main>
      </body>
    </html>
  );
}
