import Link from "next/link";
import { SITE_NAME } from "../lib/site";

const year = new Date().getFullYear();

export default function SiteFooter() {
  return (
    <footer
      className="relative z-0 shrink-0 border-t border-slate-200/80 bg-slate-900 text-slate-300"
      role="contentinfo"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-12 sm:px-6 lg:flex-row lg:justify-between lg:px-8">
        <div className="max-w-md">
          <p className="text-sm font-semibold uppercase tracking-wider text-white">
            {SITE_NAME}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Secure checkout, clear order status, and a layout tuned for phones through large
            desktops.
          </p>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Shop</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link className="text-slate-300 hover:text-white transition-colors" href="/">
                  Home
                </Link>
              </li>
              <li>
                <Link className="text-slate-300 hover:text-white transition-colors" href="/products">
                  Catalog
                </Link>
              </li>
              <li>
                <Link className="text-slate-300 hover:text-white transition-colors" href="/cart">
                  Cart
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Account</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link className="text-slate-300 hover:text-white transition-colors" href="/login">
                  Sign in
                </Link>
              </li>
              <li>
                <Link className="text-slate-300 hover:text-white transition-colors" href="/register">
                  Register
                </Link>
              </li>
              <li>
                <Link className="text-slate-300 hover:text-white transition-colors" href="/orders">
                  Orders
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Trust</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>HTTPS everywhere</li>
              <li>Mock payments for demos</li>
            </ul>
          </div>
        </nav>
      </div>
      <div className="border-t border-slate-800/80">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <p>© {year} {SITE_NAME}. Portfolio demonstration.</p>
        </div>
      </div>
    </footer>
  );
}
