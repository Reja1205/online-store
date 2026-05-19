"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { productDisplayPrice, productName } from "../lib/api";
import { SITE_NAME } from "../lib/site";

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
      className="h-10 w-10 sm:h-12 sm:w-12"
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

function SlideImage({ slide, priority }) {
  if (!slide.imageUrl) {
    return (
      <div className="flex h-full min-h-[200px] w-full items-center justify-center p-6">
        <div
          className="max-w-md rounded-lg bg-white/10 px-8 py-10 text-center backdrop-blur-sm"
          aria-hidden
        >
          <p className="text-5xl font-light text-white/40">{SITE_NAME.charAt(0)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-[200px] w-full items-end justify-center p-4 sm:p-6 lg:p-8">
      <div className="relative h-[85%] w-full max-w-md drop-shadow-2xl">
        {isAllowedImageHost(slide.imageUrl) ? (
          <Image
            src={slide.imageUrl}
            alt=""
            fill
            className="object-contain object-bottom"
            sizes="(max-width: 1024px) 50vw, 400px"
            priority={priority}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={slide.imageUrl}
            alt=""
            className="h-full w-full object-contain object-bottom"
          />
        )}
      </div>
    </div>
  );
}

function HeroSlide({ slide, priority }) {
  return (
    <article className="relative min-w-full shrink-0">
      <div
        className="flex min-h-[260px] flex-col sm:min-h-[300px] sm:flex-row lg:min-h-[340px]"
        style={{ backgroundColor: slide.bg || HERO_BLUE }}
      >
        <div className="flex flex-1 flex-col justify-center px-6 py-8 sm:px-10 sm:py-10 lg:px-14">
          <h2 className="max-w-lg text-[1.65rem] font-normal leading-snug tracking-tight text-white sm:text-3xl lg:text-[2.15rem] lg:leading-tight">
            {slide.headline}
          </h2>
          <Link
            href={slide.href}
            className="mt-5 inline-flex w-fit min-h-[2.5rem] items-center justify-center rounded-full px-6 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:brightness-95 active:scale-[0.99]"
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
          <p className="mt-6 text-xs text-white/95">{slide.terms || "Terms apply."}</p>
        </div>

        <div className="relative flex flex-1 items-stretch sm:max-w-[48%]">
          <SlideImage slide={slide} priority={priority} />
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
    if (unique.length >= 1) {
      return [...unique, ...FALLBACK_SLIDES.filter((s) => !unique.some((u) => u.id === s.id))].slice(
        0,
        5
      );
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
      <section aria-label="Featured promotions" className="overflow-hidden bg-[#007eb9]">
        <div className="min-h-[260px] animate-pulse bg-[#006da3] sm:min-h-[300px] lg:min-h-[340px]" />
      </section>
    );
  }

  return (
    <section
      aria-label="Featured promotions"
      aria-roledescription="carousel"
      className="group relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
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
            className="absolute left-1 top-1/2 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center text-white/95 transition hover:text-white sm:left-2"
            aria-label="Previous slide"
          >
            <ChevronIcon direction="left" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-1 top-1/2 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center text-white/95 transition hover:text-white sm:right-2"
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
