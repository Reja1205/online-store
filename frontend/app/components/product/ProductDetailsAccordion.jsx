"use client";

import { useState } from "react";
import { parseHighlightRows, productDetailSections } from "../../lib/productDetails";

function Chevron({ open }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function AccordionPanel({ id, title, open, onToggle, children }) {
  const panelId = `product-detail-${id}`;
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        type="button"
        id={`${panelId}-trigger`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 py-3.5 text-left text-sm font-medium text-slate-900 hover:text-slate-700"
      >
        <span>{title}</span>
        <Chevron open={open} />
      </button>
      {open ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={`${panelId}-trigger`}
          className="pb-4 pl-0 pr-2"
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export default function ProductDetailsAccordion({ product }) {
  const sections = productDetailSections(product);
  const [openIds, setOpenIds] = useState(() => new Set());

  function toggle(id) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (!sections.length) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white px-5 py-6 sm:px-6">
        <h2 className="text-xl font-bold text-slate-900">Product details</h2>
        <p className="mt-3 text-sm text-slate-600">No product details have been added yet.</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white px-5 sm:px-6">
      <h2 className="pt-5 text-xl font-bold text-slate-900 sm:pt-6">Product details</h2>
      <div className="mt-1 divide-y divide-slate-200">
        {sections.map((section) => {
          const open = openIds.has(section.id);
          return (
            <AccordionPanel
              key={section.id}
              id={section.id}
              title={section.title}
              open={open}
              onToggle={() => toggle(section.id)}
            >
              {section.type === "highlights" ? (
                <dl className="space-y-3">
                  {parseHighlightRows(section.content).map((row, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-1 gap-0.5 sm:grid-cols-[minmax(7rem,10rem)_1fr] sm:gap-4"
                    >
                      <dt className="text-sm font-semibold text-slate-900">{row.key}</dt>
                      <dd className="text-sm text-slate-700">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
                  {section.content}
                </p>
              )}
            </AccordionPanel>
          );
        })}
      </div>
      <div className="h-4" />
    </section>
  );
}
