"use client";

import {
  ADMIN_CATEGORY_SELECT_OPTIONS,
  CATEGORY_SELECT_OPTIONS,
  normalizeCategorySlug,
} from "../lib/categories";

/**
 * Department dropdown with Men's subcategories in an optgroup.
 */
export default function CategorySelect({
  id,
  value,
  onChange,
  className = "",
  variant = "shop",
  disabled = false,
  "aria-label": ariaLabel = "Filter by category",
}) {
  const normalized =
    value === "" || value === "all"
      ? variant === "shop"
        ? "all"
        : ""
      : normalizeCategorySlug(value);
  const options = variant === "admin" ? ADMIN_CATEGORY_SELECT_OPTIONS : CATEGORY_SELECT_OPTIONS;

  return (
    <select
      id={id}
      value={normalized}
      onChange={onChange}
      disabled={disabled}
      aria-label={ariaLabel}
      className={className}
      required={variant === "admin"}
    >
      {variant === "admin" ? (
        <option value="">Select category…</option>
      ) : null}
      {options.map((group) =>
        group.options ? (
          <optgroup key={group.label} label={group.label}>
            {group.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </optgroup>
        ) : (
          <option key={group.value} value={group.value}>
            {group.label}
          </option>
        )
      )}
    </select>
  );
}
