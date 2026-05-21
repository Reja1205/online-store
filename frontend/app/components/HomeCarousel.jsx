"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { productDisplayPrice, productName } from "../lib/api";
import { SITE_NAME } from "../lib/site";
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
      className="h-5 w-5 sm:h-10 sm:w-10 md:h-12 md:w-12"
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

/** Same slide + frame size for every carousel item */
const SLIDE_HEIGHT = "h-[11.75rem] sm:h-[300px] lg:h-[340px]";
const FRAME_CLASS =
  "relative h-[10.25rem] w-[8.75rem] shrink-0 overflow-hidden rounded-lg bg-[#005a82]/45 shadow-[0_8px_20px_rgba(0,0,0,0.22)] ring-1 ring-white/20 sm:h-[248px] sm:w-[280px]";

function SlideVisual({ slide, priority }) {
  let content;
  if (slide.poster === "summer") {
    content = <SummerSaleHeroPoster className="h-full w-full object-contain object-center p-1" />;
  } else if (!slide.imageUrl) {
    content = (
      <div className="flex h-full w-full items-center justify-center bg-white/5" aria-hidden>
        <p className="text-3xl font-light text-white/35 sm:text-5xl">{SITE_NAME.charAt(0)}</p>
      </div>
    );
  } else if (isAllowedImageHost(slide.imageUrl)) {
    content = (
      <Image
        src={slide.imageUrl}
        alt=""
        fill
        className="object-contain object-bottom"
        sizes="(max-width: 640px) 140px, 280px"
        priority={priority}
      />
    );
  } else {
    content = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={slide.imageUrl}
        alt=""
        className="h-full w-full object-contain object-bottom"
      />
    );
  }

  return (
    <div className="flex h-full items-center justify-center p-2 sm:p-4 lg:p-8">
      <div className={FRAME_CLASS}>{content}</div>
    </div>
  );
}

function HeroSlide({ slide, priority }) {
  return (
    <article className={`relative min-w-full shrink-0 overflow-hidden ${SLIDE_HEIGHT}`}>
      <div
        className="flex h-full min-w-0 flex-row items-stretch"
        style={{ backgroundColor: slide.bg || HERO_BLUE }}
      >
        <div className="flex min-w-0 flex-1 flex-col justify-center border-r border-white/15 py-3 pl-10 pr-3 sm:px-10 sm:py-10 lg:px-14">
          <h2 className="line-clamp-3 text-sm font-normal leading-snug text-white sm:line-clamp-none sm:text-3xl lg:text-[2.15rem] lg:leading-tight">
            {slide.headline}
          </h2>
          <Link
            href={slide.href}
            className="mt-2.5 inline-flex w-fit max-w-full min-h-[2rem] items-center justify-center rounded-full px-4 py-1.5 text-xs font-semibold text-slate-900 shadow-sm transition hover:brightness-95 sm:mt-5 sm:min-h-[2.5rem] sm:px-6 sm:py-2 sm:text-sm"
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
          <p className="mt-1.5 text-[10px] text-white/90 sm:mt-6 sm:text-xs">
            {slide.terms || "Terms apply."}
          </p>
        </div>

        <div className="relative flex w-[9.25rem] shrink-0 items-stretch sm:w-[300px]">
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
        className={`overflow-hidden bg-[#007eb9] ${SLIDE_HEIGHT}`}
      >
        <div className="h-full animate-pulse bg-[#006da3]" />
      </section>
    );
  }

  return (
    <section
      aria-label="Featured promotions"
      aria-roledescription="carousel"
      className={`group relative overflow-hidden ${SLIDE_HEIGHT}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        className={`flex h-full ${SLIDE_HEIGHT} transition-transform duration-500 ease-out motion-reduce:transition-none`}
        style={{ transform: `translateX(-${active * 100}%)` }}
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
            className="absolute left-0.5 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#007eb9]/75 text-white/95 backdrop-blur-sm transition hover:bg-[#006da3] sm:left-2 sm:h-14 sm:w-14 sm:rounded-none sm:bg-transparent"
            aria-label="Previous slide"
          >
            <ChevronIcon direction="left" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-0.5 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#007eb9]/75 text-white/95 backdrop-blur-sm transition hover:bg-[#006da3] sm:right-2 sm:h-14 sm:w-14 sm:rounded-none sm:bg-transparent"
            aria-label="Next slide"
          >
            <ChevronIcon direction="right" />
          </button>

          <div
            className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5"
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
