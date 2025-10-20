import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bosch Product Database",
  description: "Manage products and generate JSONs for Rhino plugin",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-background text-foreground">
        <header className="border-b bg-card">
          <div className="container px-2.5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Bosch Product Database</h1>
                <p className="text-sm text-muted-foreground">Manage products and generate JSONs for Rhino plugin</p>
              </div>
              <div className="text-sm text-muted-foreground">Products</div>
            </div>
          </div>
        </header>
        <main className="container px-2.5 py-6">{children}</main>
      </body>
    </html>
  );
}
