import ProductsPageClient from "./ProductsPageClient";
import { fetchProductsCatalogServer } from "../lib/products";

/** Server-rendered catalog — products in HTML on first paint (lower TTFB vs client-only fetch). */
export default async function ProductsPage() {
  const result = await fetchProductsCatalogServer({ revalidate: 60 });

  return (
    <ProductsPageClient
      initialProducts={result.ok ? result.products : []}
      initialError={result.ok ? "" : result.message}
    />
  );
}
