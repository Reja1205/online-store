import { Suspense } from "react";

export default function ConfirmationLayout({ children }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
