"use client";
import { useEffect, useMemo, useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { apiGet, apiPost } from "../lib/api";
import { getPreviewUrl } from "../lib/preview";
import { Search, RefreshCw, Plus, Database } from "lucide-react";
import { Badge } from "../components/ui/badge";

interface HolderInfo { variant?: string; color?: string; codArticol?: string; preview?: string; }
interface ProductRow {
  productName: string;
  description?: string;
  sku?: string;
  codArticol?: string;
  range?: string;
  category?: string;
  subcategory?: string;
  previews?: Record<string, any>;
  holders?: HolderInfo[];
  _folder?: string;
}
type ProductsResponse = { products: ProductRow[]; count: number };

type Visible = {
  preview: boolean; productName: boolean; description: boolean; sku: boolean; codArticol: boolean; range: boolean; category: boolean; holderVariant: boolean; color: boolean; holderPreview: boolean; actions: boolean;
};

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<string>("__all__");
  const [category, setCategory] = useState<string>("__all__");
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [visible, setVisible] = useState<Visible>({ preview: true, productName: true, description: true, sku: true, codArticol: true, range: true, category: true, holderVariant: true, color: true, holderPreview: true, actions: true });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const selectedCount = selected.size;

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

  const uniqueRanges = useMemo(() => Array.from(new Set(products.map(p => p.range).filter(Boolean))) as string[], [products]);
  const uniqueCategories = useMemo(() => Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[], [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(p => {
      if (range !== "__all__" && (p.range || "") !== range) return false;
      if (category !== "__all__" && (p.category || "") !== category) return false;
      if (!q) return true;
      const hay = [p.productName, p.description, p.sku, p.codArticol, p.category, p.subcategory].map(x => (x || '').toString().toLowerCase()).join(" ");
      return hay.includes(q);
    });
  }, [products, query, range, category]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const pageItems = filtered.slice((page-1)*pageSize, (page-1)*pageSize + pageSize);

  function holderVariants(p: ProductRow) {
    const arr = (p.holders || []).map(h => h.variant).filter(Boolean) as string[];
    return Array.from(new Set(arr)).join(", ");
  }
  function holderColors(p: ProductRow) {
    const arr = (p.holders || []).map(h => h.color).filter(Boolean) as string[];
    return Array.from(new Set(arr)).join(", ");
  }
  function holderPreviewUrl(p: ProductRow) {
    const h = (p.holders || []).find(h => !!h.preview);
    if (h?.preview) {
      return `/api/holder-preview/${encodeURIComponent(h.preview)}`;
    }
    return "";
  }

  async function scan() {
    try { await apiPost("/api/scan"); await load(true); alert("Scan Complete"); } catch (e:any) { alert(e.message || "Scan failed"); }
  }
  async function autopop(name: string) {
    try { await apiPost(`/api/products/${encodeURIComponent(name)}/auto-populate`); await load(true); } catch (e:any) { alert(e.message || "Auto-populate failed"); }
  }
  async function extractSelected() {
    if (selectedCount === 0) return;
    try { await apiPost(`/api/extract-previews`, { productNames: Array.from(selected) }); await load(true); alert(`Extracted previews for ${selectedCount} product(s)`); } catch (e:any) { alert(e.message || "Extract failed"); }
  }
  async function autopopSelected() {
    if (selectedCount === 0) return;
    for (const name of Array.from(selected)) {
      try { await apiPost(`/api/products/${encodeURIComponent(name)}/auto-populate`); } catch {}
    }
    await load(true);
    alert(`Auto-populated ${selectedCount} product(s)`);
  }

  function toggleCol(key: keyof Visible) { setVisible(v => ({ ...v, [key]: !v[key] })); }
  function toggleRow(name: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  }
  function allPageSelected() {
    return pageItems.length > 0 && pageItems.every(p => selected.has(p.productName));
  }
  function toggleSelectAllPage() {
    setSelected(prev => {
      const next = new Set(prev);
      if (allPageSelected()) {
        pageItems.forEach(p => next.delete(p.productName));
      } else {
        pageItems.forEach(p => next.add(p.productName));
      }
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-[320px]">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Search products, SKU, description, tags..." className="pl-8" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
          </div>
          <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={range} onChange={e => { setRange(e.target.value); setPage(1); }}>
            <option value="__all__">All Ranges</option>
            {uniqueRanges.map(r => <option key={r} value={r as string}>{r}</option>)}
          </select>
          <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
            <option value="__all__">All Categories</option>
            {uniqueCategories.map(c => <option key={c} value={c as string}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <details className="relative">
            <summary className="list-none"><Button variant="outline">Columns ({Object.values(visible).filter(Boolean).length})</Button></summary>
            <div className="absolute right-0 mt-2 w-56 rounded-md border bg-card p-2 shadow">
              {Object.keys(visible).map((k) => (
                <label key={k} className="flex items-center gap-2 px-2 py-1 text-sm">
                  <input type="checkbox" checked={(visible as any)[k]} onChange={() => toggleCol(k as keyof Visible)} />
                  <span className="capitalize">{k.replace(/([A-Z])/g,' $1')}</span>
                </label>
              ))}
            </div>
          </details>
          <Button onClick={() => alert('New Product modal not yet ported')}><Plus className="mr-2 size-4" /> New Product</Button>
          <Button variant="secondary" onClick={scan} disabled={loading}><Database className="mr-2 size-4" /> Scan Database</Button>
          <Button variant="outline" onClick={() => load(true)} disabled={loading}><RefreshCw className="mr-2 size-4" /> Refresh</Button>
        </div>
      </div>

      {/* Bulk actions */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2"><input type="checkbox" checked={allPageSelected()} onChange={toggleSelectAllPage} /> Select page</label>
          <span className="text-muted-foreground">Selected: {selectedCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" disabled={selectedCount===0} onClick={autopopSelected}>🤖 Auto-Populate Selected</Button>
          <Button size="sm" variant="outline" disabled={selectedCount===0} onClick={extractSelected}>🖼️ Extract Previews Selected</Button>
        </div>
      </div>

      {/* Meta row */}
      <div className="text-sm text-muted-foreground">Showing {Math.min((page-1)*pageSize+1,total)}-{Math.min(page*pageSize,total)} of {total} products</div>

      {/* Table */}
      <div className="overflow-auto rounded-md border">
        <table className="min-w-[900px] w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="w-8 py-2 px-2 text-left"><input type="checkbox" checked={allPageSelected()} onChange={toggleSelectAllPage} /></th>
              {visible.preview && <th className="w-16 py-2 px-2 text-left">Preview</th>}
              {visible.productName && <th className="py-2 px-2 text-left">Product Name</th>}
              {visible.description && <th className="py-2 px-2 text-left">Description</th>}
              {visible.sku && <th className="py-2 px-2 text-left">SKU</th>}
              {visible.codArticol && <th className="py-2 px-2 text-left">Cod Articol</th>}
              {visible.range && <th className="py-2 px-2 text-left">Range</th>}
              {visible.category && <th className="py-2 px-2 text-left">Category</th>}
              {visible.holderVariant && <th className="py-2 px-2 text-left">Holder Variant</th>}
              {visible.color && <th className="py-2 px-2 text-left">Color</th>}
              {visible.holderPreview && <th className="w-20 py-2 px-2 text-left">Holder Preview</th>}
              {visible.actions && <th className="w-32 py-2 px-2 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {pageItems.map((p) => {
              const mesh = getPreviewUrl(p as any, "meshPreview") || getPreviewUrl(p as any, "graficaPreview");
              const holderPrev = holderPreviewUrl(p);
              return (
                <tr key={p.productName} className="border-t hover:bg-muted/40">
                  <td className="py-1 px-2"><input type="checkbox" checked={selected.has(p.productName)} onChange={() => toggleRow(p.productName)} /></td>
                  {visible.preview && (
                    <td className="py-1 px-2">
                      <div className="h-10 w-10 rounded border bg-white overflow-hidden">
                        {mesh ? <img src={mesh} alt="" className="h-full w-full object-contain" /> : <div className="h-full w-full text-[10px] text-muted-foreground flex items-center justify-center">No</div>}
                      </div>
                    </td>
                  )}
                  {visible.productName && <td className="py-1 px-2 font-medium">{p.productName}</td>}
                  {visible.description && <td className="py-1 px-2 text-muted-foreground">{p.description || '-'}</td>}
                  {visible.sku && <td className="py-1 px-2">{p.sku || '-'}</td>}
                  {visible.codArticol && <td className="py-1 px-2">{p.codArticol || '-'}</td>}
                  {visible.range && <td className="py-1 px-2">{p.range || '-'}</td>}
                  {visible.category && <td className="py-1 px-2">{p.category || '-'}</td>}
                  {visible.holderVariant && <td className="py-1 px-2">{holderVariants(p) || '-'}</td>}
                  {visible.color && <td className="py-1 px-2">{holderColors(p) || '-'}</td>}
                  {visible.holderPreview && (
                    <td className="py-1 px-2">
                      <div className="h-10 w-16 rounded border bg-white overflow-hidden">
                        {holderPrev ? <img src={holderPrev} alt="" className="h-full w-full object-contain" /> : <div className="h-full w-full text-[10px] text-muted-foreground flex items-center justify-center">No</div>}
                      </div>
                    </td>
                  )}
                  {visible.actions && (
                    <td className="py-1 px-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => alert('Edit not yet ported')}>✏️ Edit</Button>
                        <Button variant="secondary" size="sm" onClick={() => autopop(p.productName)}>🤖 Auto</Button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <div>
          Items per page:
          <select className="ml-2 h-9 rounded-md border border-input bg-background px-2 text-sm" value={pageSize} onChange={e => { setPageSize(parseInt(e.target.value)||10); setPage(1); }}>
            {[10,20,50,100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page<=1}>Prev</Button>
          <span>Page {page} / {pageCount}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(pageCount, p+1))} disabled={page>=pageCount}>Next</Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center text-sm text-muted-foreground">Loading products…</div>
      )}
    </div>
  );
}
