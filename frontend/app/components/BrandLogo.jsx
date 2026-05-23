"use client";

import Image from "next/image";
import Link from "next/link";
import { Dancing_Script } from "next/font/google";
import { SITE_NAME, SITE_WORDMARK } from "../lib/site";

const brandCursive = Dancing_Script({
  subsets: ["latin"],
  weight: ["600", "700"],
});

/** Black & blue cursive BB monogram + script wordmark. */
export default function BrandLogo({
  href = "/",
  className = "",
  showText = true,
  size = "md",
  variant = "header",
  theme = "light",
}) {
  const markHeights = { sm: 34, md: 42, lg: 50 };
  const markWidths = { sm: 52, md: 64, lg: 76 };
  const markH = markHeights[size] || markHeights.md;
  const markW = markWidths[size] || markWidths.md;

  const textSize =
    size === "sm"
      ? "text-xl"
      : size === "lg"
        ? "text-3xl sm:text-[2rem]"
        : "text-2xl sm:text-[1.75rem]";

  const scriptBase = `${brandCursive.className} font-bold leading-none tracking-normal`;
  const firstClass =
    theme === "dark" ? `${scriptBase} text-white` : `${scriptBase} text-gray-900`;
  const secondClass =
    theme === "dark" ? `${scriptBase} text-blue-400` : `${scriptBase} text-blue-600`;

  const { first, second } = SITE_WORDMARK;

  const mark = (
    <Image
      src="/brand-bb-logo.png"
      alt=""
      width={markW}
      height={markH}
      className="shrink-0 object-contain"
      priority={variant === "header"}
      aria-hidden
    />
  );

  const wordmark =
    variant === "footer" ? (
      <span className={`flex flex-col ${textSize}`}>
        <span className={`${brandCursive.className} font-bold text-white text-xl`}>{first}</span>
        <span className={`${brandCursive.className} font-bold text-blue-400 text-xl`}>{second}</span>
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
