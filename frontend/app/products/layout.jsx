import { Suspense } from "react";
import { SITE_NAME } from "../lib/site";

export const metadata = {
  title: "Catalog",
  description: `Browse products at ${SITE_NAME}. Search, filter by stock, and open detailed product pages.`,
};

export default function ProductsLayout({ children }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
