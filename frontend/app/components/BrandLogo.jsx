"use client";

import Link from "next/link";
import { useId } from "react";
import { SITE_NAME } from "../lib/site";

/**
 * Western Culture wordmark + monogram (Title Case: Western Culture).
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

  const westernClass =
    theme === "dark" ? "font-bold tracking-tight text-white" : "font-bold tracking-tight text-slate-800";
  const cultureClass =
    theme === "dark" ? "font-bold tracking-tight text-indigo-300" : "font-bold tracking-tight text-indigo-600";

  const mark = (
    <svg
      width={iconPx}
      height={iconPx}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden
    >
      <rect width="48" height="48" rx="10" fill={`url(#${gradId})`} />
      <path
        d="M10 32V16l6.5 10.5L23 16v16M28 32V16l10 14"
        stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 36h32" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round" />
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
        <span className="font-bold tracking-tight text-white">Western</span>
        <span className="font-bold tracking-tight text-indigo-300">Culture</span>
      </span>
    ) : (
      <span className={`hidden min-[380px]:inline ${textSize}`}>
        <span className={westernClass}>Western </span>
        <span className={cultureClass}>Culture</span>
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
