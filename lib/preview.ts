export type Product = {
  productName: string;
  range?: string;
  category?: string;
  previews?: Record<string, any>;
  _folder?: string;
};

function enc(v?: string) { return encodeURIComponent(v || ""); }

export function getPreviewUrl(product: Product, previewType: string): string {
  if (!product) return "";
  const p = product as any;
  const prev = p.previews?.[previewType];
  if (!prev) return "";
  const folder = (p._folder || "");

  // Holder previews not handled here in Next variant (no holders grid yet)

  // If object with fullPath
  if (typeof prev === "object" && prev.fullPath) {
    const full: string = prev.fullPath as string;
    return toApiUrlFromFullPath(p, full);
  }

  // If string filename or full path
  if (typeof prev === "string") {
    if (prev.includes("\\") || prev.includes(":")) {
      return toApiUrlFromFullPath(p, prev);
    }
    // treat as file in product root
    return `${process.env.NEXT_PUBLIC_API_BASE || ""}/api/preview/${enc(p.range)}/${enc(p.category)}/${enc(p.productName)}/${enc(prev)}`;
  }
  return "";
}

function toApiUrlFromFullPath(product: any, full: string): string {
  const base = (product._folder || "").replace(/\\+$/, "");
  const lowerFull = full.toLowerCase();
  const lowerBase = base.toLowerCase();
  if (base && lowerFull.startsWith(lowerBase)) {
    const rel = full.substring(base.length + 1).replace(/\\/g, "/");
    const segs = rel.split("/").map(encodeURIComponent).join("/");
    return `${process.env.NEXT_PUBLIC_API_BASE || ""}/api/product-file/${enc(product.range)}/${enc(product.category)}/${enc(product.productName)}/${segs}`;
  }
  const fileName = full.split(/[\\\/]/).pop() || "";
  return `${process.env.NEXT_PUBLIC_API_BASE || ""}/api/preview/${enc(product.range)}/${enc(product.category)}/${enc(product.productName)}/${enc(fileName)}`;
}
