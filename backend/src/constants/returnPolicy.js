const RETURN_WINDOW_DAYS = Number(process.env.RETURN_WINDOW_DAYS || 14);

const ELIGIBLE_ORDER_STATUSES = ["paid", "shipped", "delivered"];

const OPEN_RETURN_STATUSES = ["pending", "approved", "received"];

const RETURN_RESOLUTIONS = ["refund", "replacement"];

const RETURN_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "received",
  "completed",
  "cancelled",
];

const RETURN_SHIPPING_NOTICE =
  "You are responsible for return shipping costs. Ship items in original condition with tags attached.";

module.exports = {
  RETURN_WINDOW_DAYS,
  ELIGIBLE_ORDER_STATUSES,
  OPEN_RETURN_STATUSES,
  RETURN_RESOLUTIONS,
  RETURN_STATUSES,
  RETURN_SHIPPING_NOTICE,
};
