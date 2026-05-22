import { Suspense } from "react";

export default function PromotionsLayout({ children }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
