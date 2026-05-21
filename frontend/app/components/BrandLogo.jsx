"use client";

import Link from "next/link";
import { useId } from "react";
import { SITE_NAME, SITE_WORDMARK } from "../lib/site";

/**
 * BigBag wordmark + RR monogram (Rejaur Rahman).
 */
export default function BrandLogo({
  href = "/",
  className = "",
  showText = true,
  size = "md",
  variant = "header",
  theme = "light",
}) {
  const gradId = useId().replace(/:/g, "");
  const iconSizes = { sm: 32, md: 40, lg: 48 };
  const iconPx = iconSizes[size] || iconSizes.md;

  const textSize =
    size === "sm"
      ? "text-base leading-tight"
      : size === "lg"
        ? "text-2xl sm:text-[1.65rem] leading-tight"
        : "text-lg sm:text-xl leading-tight";

  const firstClass =
    theme === "dark" ? "font-bold tracking-tight text-white" : "font-bold tracking-tight text-slate-800";
  const secondClass =
    theme === "dark" ? "font-bold tracking-tight text-indigo-300" : "font-bold tracking-tight text-indigo-600";

  const { first, second } = SITE_WORDMARK;

  const mark = (
    <svg
      width={iconPx}
      height={iconPx}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 rounded-full"
      aria-hidden
    >
      <circle cx="24" cy="24" r="24" fill={`url(#${gradId})`} />
      <circle
        cx="24"
        cy="24"
        r="22"
        fill="none"
        stroke="#e0e7ff"
        strokeWidth="1.5"
        opacity="0.85"
      />
      <path
        d="M11 33V15h5.2c2.8 0 4.8 1.9 4.8 4.6 0 2.2-1.3 3.6-3.2 4.1l4.4 9.3"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M25 33V15h5.2c2.8 0 4.8 1.9 4.8 4.6 0 2.2-1.3 3.6-3.2 4.1l4.4 9.3"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <defs>
        <linearGradient id={gradId} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4338ca" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
      </defs>
    </svg>
  );

  const wordmark =
    variant === "footer" ? (
      <span className={`flex flex-col ${textSize}`}>
        <span className="font-bold tracking-tight text-white">{first}</span>
        <span className="font-bold tracking-tight text-indigo-300">{second}</span>
      </span>
    ) : (
      <span className={`hidden min-[380px]:inline ${textSize}`}>
        <span className={firstClass}>{first}</span>
        <span className={secondClass}>{second}</span>
      </span>
    );

  const content = (
    <>
      {mark}
      {showText ? wordmark : null}
    </>
  );

  const hoverClass = theme === "dark" ? "hover:opacity-90" : "hover:opacity-85";

  const baseClass = `inline-flex shrink-0 cursor-pointer items-center gap-2.5 rounded-lg transition ${className}`;

  if (href) {
    return (
      <Link href={href} className={`${baseClass} ${hoverClass}`} aria-label={`${SITE_NAME} home`}>
        {content}
      </Link>
    );
  }

  return <span className={baseClass}>{content}</span>;
}
