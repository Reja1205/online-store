"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { productDisplayPrice, productName } from "../lib/api";
import { SITE_NAME } from "../lib/site";
import { useCarouselSwipe } from "../lib/useCarousel";
import SummerSaleHeroPoster from "./hero/SummerSaleHeroPoster";

/** Amazon-style hero blue */
const HERO_BLUE = "#007eb9";
const CTA_YELLOW = "#ffd814";
const CTA_YELLOW_HOVER = "#f7ca00";

const FALLBACK_SLIDES = [
  {
    id: "summer-sale",
    headline: "Summer sale is on — save on seasonal favorites",
    href: "/products?section=sale",
    cta: "Shop the sale",
    terms: "Limited time. Terms apply.",
    bg: HERO_BLUE,
    poster: "summer",
  },
  {
    id: "shipping",
    headline: "Fast, free shipping on qualifying orders",
    href: "/products",
    cta: "Browse catalog",
    terms: "Terms apply.",
    bg: HERO_BLUE,
  },
  {
    id: "womens",
    headline: "New arrivals in Women's, Men's & Kids",
    href: "/products?category=women",
    cta: "Shop now",
    terms: "Terms apply.",
    bg: HERO_BLUE,
  },
];

function isAllowedImageHost(src) {
  try {
    const u = new URL(src);
    if (u.protocol !== "https:") return false;
    return ["res.cloudinary.com", "images.unsplash.com", "placehold.co"].includes(u.hostname);
  } catch {
    return false;
  }
}

function productToSlide(p) {
  const name = productName(p);
  const price = productDisplayPrice(p);
  const headline = p.onSale
    ? `${name} — now $${price.toFixed(2)}`
    : `Shop ${name} at ${SITE_NAME}`;
  return {
    id: p._id,
    headline,
    href: `/products/${p._id}`,
    cta: "Shop now",
    terms: "Terms apply.",
    imageUrl: p.imageUrl,
    bg: HERO_BLUE,
  };
}

function ChevronIcon({ direction }) {
  return (
    <svg
      className="h-5 w-5 sm:h-8 sm:w-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      {direction === "left" ? (
        <path d="M14 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M10 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

/** Responsive slide shell — content vertically centered */
const SLIDE_SHELL =
  "flex h-full min-h-[clamp(17.5rem,48vw,20rem)] w-full flex-col items-center justify-center sm:min-h-[300px] sm:flex-row lg:min-h-[340px]";

/** Visual frame — neutral backdrop for photos (no blue band above image) */
const VISUAL_FRAME =
  "relative mx-auto flex h-[10.5rem] w-full max-w-[10.5rem] items-center justify-center overflow-hidden rounded-lg bg-white/95 shadow-[0_8px_20px_rgba(0,0,0,0.18)] ring-1 ring-white/25 sm:h-[248px] sm:max-w-[280px]";

function SlideVisual({ slide, priority }) {
  let content;
  if (slide.poster === "summer") {
    content = (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-[#fff7e6] to-[#ffe4a8] p-1.5">
        <SummerSaleHeroPoster className="h-full w-full max-h-full object-contain object-center" />
      </div>
    );
  } else if (!slide.imageUrl) {
    content = (
      <div className="flex h-full w-full items-center justify-center bg-white/10" aria-hidden>
        <p className="text-3xl font-light text-slate-400/80 sm:text-5xl">{SITE_NAME.charAt(0)}</p>
      </div>
    );
  } else if (isAllowedImageHost(slide.imageUrl)) {
    content = (
      <Image
        src={slide.imageUrl}
        alt=""
        fill
        className="object-contain object-center"
        sizes="(max-width: 640px) 168px, 280px"
        priority={priority}
      />
    );
  } else {
    content = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={slide.imageUrl}
        alt=""
        className="h-full w-full object-contain object-center"
      />
    );
  }

  return (
    <div className={VISUAL_FRAME}>{content}</div>
  );
}

function HeroSlide({ slide, priority }) {
  return (
    <article
      className="relative flex h-full w-full min-w-0 flex-[0_0_100%] basis-full shrink-0 grow-0 overflow-hidden"
      aria-roledescription="slide"
    >
      <div className={SLIDE_SHELL} style={{ backgroundColor: slide.bg || HERO_BLUE }}>
        {/* Text — centered in panel */}
        <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-11 py-4 text-center sm:border-r sm:border-white/15 sm:px-8 sm:py-6 lg:px-12 lg:py-8">
          <h2 className="line-clamp-4 max-w-md text-[clamp(0.875rem,3.5vw,1rem)] font-normal leading-snug text-white sm:line-clamp-none sm:text-2xl lg:text-[2.15rem] lg:leading-tight">
            {slide.headline}
          </h2>
          <Link
            href={slide.href}
            className="mt-3 inline-flex w-fit max-w-full min-h-[2.25rem] items-center justify-center rounded-full px-5 py-2 text-xs font-semibold text-slate-900 shadow-sm transition hover:brightness-95 sm:mt-5 sm:min-h-[2.5rem] sm:px-6 sm:text-sm"
            style={{ backgroundColor: CTA_YELLOW }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = CTA_YELLOW_HOVER;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = CTA_YELLOW;
            }}
          >
            {slide.cta}
          </Link>
          <p className="mt-2 text-[10px] text-white/90 sm:mt-5 sm:text-xs">
            {slide.terms || "Terms apply."}
          </p>
        </div>

        {/* Visual — centered in panel */}
        <div className="flex w-full shrink-0 items-center justify-center px-4 py-4 sm:w-[42%] sm:max-w-[320px] sm:px-6 sm:py-6 lg:px-8">
          <SlideVisual slide={slide} priority={priority} />
        </div>
      </div>
    </article>
  );
}

export default function HomeCarousel({ products = [], loading = false }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const slides = useMemo(() => {
    const pool = products.filter((p) => p?.imageUrl);
    const prioritized = [
      ...pool.filter((p) => p.onSale),
      ...pool.filter((p) => p.featured && !p.onSale),
      ...pool.filter((p) => p.bestSeller && !p.featured && !p.onSale),
      ...pool.filter((p) => !p.onSale && !p.featured && !p.bestSeller),
    ];
    const seen = new Set();
    const unique = [];
    for (const p of prioritized) {
      if (seen.has(p._id)) continue;
      seen.add(p._id);
      unique.push(productToSlide(p));
      if (unique.length >= 4) break;
    }
    const summerSlide = FALLBACK_SLIDES.find((s) => s.id === "summer-sale");
    const otherFallbacks = FALLBACK_SLIDES.filter((s) => s.id !== "summer-sale");

    if (unique.length >= 1) {
      const merged = [
        ...(summerSlide ? [summerSlide] : []),
        ...unique,
        ...otherFallbacks.filter((s) => !unique.some((u) => u.id === s.id)),
      ];
      const seenIds = new Set();
      return merged
        .filter((s) => {
          if (seenIds.has(s.id)) return false;
          seenIds.add(s.id);
          return true;
        })
        .slice(0, 5);
    }
    return FALLBACK_SLIDES;
  }, [products]);

  const count = slides.length;

  const goTo = useCallback(
    (index) => {
      if (count === 0) return;
      setActive(((index % count) + count) % count);
    },
    [count]
  );

  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  const { onTouchStart, onTouchEnd } = useCarouselSwipe({
    onNext: next,
    onPrev: prev,
    enabled: count > 1,
  });

  useEffect(() => {
    if (paused || count <= 1) return;
    const timer = window.setInterval(next, 6000);
    return () => window.clearInterval(timer);
  }, [paused, count, next]);

  useEffect(() => {
    if (active >= count) setActive(0);
  }, [active, count]);

  if (loading) {
    return (
      <section
        aria-label="Featured promotions"
        className="relative w-full overflow-hidden bg-[#007eb9] min-h-[clamp(17.5rem,48vw,20rem)] sm:min-h-[300px] lg:min-h-[340px]"
      >
        <div className="h-full min-h-[inherit] animate-pulse bg-[#006da3]" />
      </section>
    );
  }

  return (
    <section
      aria-label="Featured promotions"
      aria-roledescription="carousel"
      className="group relative w-full max-w-full overflow-hidden overscroll-x-contain min-h-[clamp(17.5rem,48vw,20rem)] sm:min-h-[300px] lg:min-h-[340px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        className="flex h-full min-h-[inherit] w-full touch-pan-y transition-transform duration-500 ease-out will-change-transform motion-reduce:transition-none"
        style={{ transform: `translate3d(-${active * 100}%, 0, 0)` }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {slides.map((slide, i) => (
          <HeroSlide key={slide.id} slide={slide} priority={i === 0} />
        ))}
      </div>

      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#007eb9]/90 text-white shadow-md transition hover:bg-[#006da3] sm:left-3 sm:h-11 sm:w-11 sm:bg-[#007eb9]/75 sm:shadow-none sm:backdrop-blur-sm"
            aria-label="Previous slide"
          >
            <ChevronIcon direction="left" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-2 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#007eb9]/90 text-white shadow-md transition hover:bg-[#006da3] sm:right-3 sm:h-11 sm:w-11 sm:bg-[#007eb9]/75 sm:shadow-none sm:backdrop-blur-sm"
            aria-label="Next slide"
          >
            <ChevronIcon direction="right" />
          </button>

          <div
            className="absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 gap-1.5 sm:bottom-4"
            role="tablist"
            aria-label="Carousel slides"
          >
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Slide ${i + 1}: ${slide.headline}`}
                aria-selected={i === active}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
