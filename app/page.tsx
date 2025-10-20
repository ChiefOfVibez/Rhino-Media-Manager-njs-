"use client";
import { useEffect, useMemo, useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "../components/ui/dialog";
import { apiGet } from "../lib/api";
import { getPreviewUrl } from "../lib/preview";
import { Search, RefreshCw } from "lucide-react";

interface ProductLite {
  productName: string;
  range?: string;
  category?: string;
  subcategory?: string;
  previews?: Record<string, any>;
  packaging?: any;
  _folder?: string;
}

type ProductsResponse = { products: ProductLite[]; count: number };

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductLite[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ProductLite | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load(force = false) {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet<ProductsResponse>(force ? "/api/products?force_refresh=true" : "/api/products");
      setProducts(res.products || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(p =>
      (p.productName || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q) ||
      (p.subcategory || "").toLowerCase().includes(q)
    );
  }, [products, query]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search products..." className="pl-8" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Button variant="secondary" onClick={() => load(true)} disabled={loading}>
          <RefreshCw className="mr-2 size-4" /> Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {filtered.map((p) => {
          const src = getPreviewUrl(p as any, "meshPreview") || getPreviewUrl(p as any, "graficaPreview");
          return (
            <Dialog key={p.productName}>
              <DialogTrigger asChild>
                <button className="group relative overflow-hidden rounded-lg border bg-card p-3 text-left hover:shadow-sm">
                  <div className="aspect-square w-full overflow-hidden rounded bg-muted">
                    {src ? (
                      <img src={src} alt={p.productName} className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.02]" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">No preview</div>
                    )}
                  </div>
                  <div className="mt-2">
                    <div className="truncate text-sm font-medium">{p.productName}</div>
                    <div className="truncate text-xs text-muted-foreground">{p.category}{p.subcategory ? ` • ${p.subcategory}` : ""}</div>
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="truncate">{p.productName}</DialogTitle>
                  <DialogDescription>
                    {(p.range || "").toString()} {p.category ? `• ${p.category}` : ""} {p.subcategory ? `• ${p.subcategory}` : ""}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded border bg-card p-2">
                    {src ? (
                      <img src={src} alt={p.productName} className="h-[320px] w-full object-contain" />
                    ) : (
                      <div className="flex h-[320px] w-full items-center justify-center text-sm text-muted-foreground">No preview available</div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Category</div>
                      <div className="text-sm">{p.category || "-"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Subcategory</div>
                      <div className="text-sm">{p.subcategory || "-"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Range</div>
                      <div className="text-sm">{p.range || "-"}</div>
                    </div>
                    <div className="pt-2">
                      <DialogClose asChild>
                        <Button className="w-full">Close</Button>
                      </DialogClose>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          );
        })}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center text-sm text-muted-foreground">No products match your search.</div>
      )}

      {loading && (
        <div className="text-center text-sm text-muted-foreground">Loading products…</div>
      )}
    </div>
  );
}
