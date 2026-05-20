export const metadata = {
  title: "Checkout",
  description: "Enter shipping details and complete your order.",
};

import { Suspense } from "react";

export default function CheckoutLayout({ children }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
