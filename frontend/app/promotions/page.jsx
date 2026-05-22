import PromotionsPageClient from "./PromotionsPageClient";
import { fetchProductsCatalogServer } from "../lib/products";

export const metadata = {
  title: "Promotions",
  description: "Seasonal sales, holiday deals, and clearance — shop promotion items.",
};

/** Server-rendered promotions catalog. */
export default async function PromotionsPage() {
  const result = await fetchProductsCatalogServer({ revalidate: 60 });

  return (
    <PromotionsPageClient
      initialProducts={result.ok ? result.products : []}
      initialError={result.ok ? "" : result.message}
    />
  );
}
