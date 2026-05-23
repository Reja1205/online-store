/** Scheduled free delivery days shown on cart and checkout. */
export const WEEKLY_FREE_DELIVERY_DAYS = ["Saturday", "Wednesday"];

export function weeklyFreeDeliveryLabel() {
  return `FREE delivery every ${WEEKLY_FREE_DELIVERY_DAYS.join(" & ")}`;
}
