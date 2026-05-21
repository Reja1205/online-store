const mongoose = require("mongoose");
const Order = require("../models/Order");
const User = require("../models/User");
const ReturnRequest = require("../models/ReturnRequest");
const {
  RETURN_WINDOW_DAYS,
  ELIGIBLE_ORDER_STATUSES,
  OPEN_RETURN_STATUSES,
  RETURN_RESOLUTIONS,
  RETURN_STATUSES,
  RETURN_SHIPPING_NOTICE,
} = require("../constants/returnPolicy");
const {
  sendReturnSubmittedEmails,
  sendReturnStatusEmail,
} = require("./returnEmails");
const { writeAudit } = require("./auth.service");

function generateReturnNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RET-${ts}-${rand}`;
}

function getReturnDeadline(order) {
  const base = order.paidAt || order.createdAt;
  if (!base) return null;
  return new Date(new Date(base).getTime() + RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000);
}

function isWithinReturnWindow(order) {
  const deadline = getReturnDeadline(order);
  if (!deadline) return false;
  return new Date() <= deadline;
}

function toPublicReturn(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: String(o._id),
    returnNumber: o.returnNumber,
    orderId: String(o.order),
    orderNumber: o.orderNumber,
    items: o.items || [],
    resolution: o.resolution,
    reason: o.reason,
    customerNotes: o.customerNotes || "",
    status: o.status,
    adminNotes: o.adminNotes || "",
    policyAcknowledged: Boolean(o.policyAcknowledged),
    returnDeadline: o.returnDeadline,
    approvedAt: o.approvedAt,
    receivedAt: o.receivedAt,
    completedAt: o.completedAt,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

async function getOpenReturnForOrder(orderId, userId) {
  return ReturnRequest.findOne({
    order: orderId,
    user: userId,
    status: { $in: OPEN_RETURN_STATUSES },
  }).lean();
}

async function buildReturnEligibility(order, userId) {
  const deadline = getReturnDeadline(order);
  const openReturn = await getOpenReturnForOrder(order._id, userId);
  const withinWindow = isWithinReturnWindow(order);
  const statusOk = ELIGIBLE_ORDER_STATUSES.includes(order.status);
  const paymentOk = order.paymentStatus !== "refunded";
  const noOpenReturn = !openReturn;

  const eligible = statusOk && withinWindow && paymentOk && noOpenReturn;

  let reason = "";
  if (!statusOk) reason = "Returns are only available for paid or shipped orders.";
  else if (!withinWindow) reason = `Return window (${RETURN_WINDOW_DAYS} days) has expired.`;
  else if (!paymentOk) reason = "This order was already refunded.";
  else if (!noOpenReturn) reason = "A return request is already in progress for this order.";

  return {
    eligible,
    reason,
    returnWindowDays: RETURN_WINDOW_DAYS,
    returnDeadline: deadline,
    daysRemaining: deadline
      ? Math.max(0, Math.ceil((deadline - Date.now()) / (24 * 60 * 60 * 1000)))
      : 0,
    openReturn: openReturn ? toPublicReturn(openReturn) : null,
    shippingNotice: RETURN_SHIPPING_NOTICE,
  };
}

async function createReturnRequest(userId, { orderId, reason, resolution, customerNotes, policyAcknowledged }) {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return { status: 400, message: "Invalid order id" };
  }

  const cleanReason = String(reason || "").trim();
  if (cleanReason.length < 10) {
    return { status: 400, message: "Please describe your reason (at least 10 characters)." };
  }

  if (!RETURN_RESOLUTIONS.includes(resolution)) {
    return { status: 400, message: "Resolution must be refund or replacement." };
  }

  if (!policyAcknowledged) {
    return {
      status: 400,
      message: "Please confirm you understand return shipping is paid by you.",
    };
  }

  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) return { status: 404, message: "Order not found" };

  const eligibility = await buildReturnEligibility(order, userId);
  if (!eligibility.eligible) {
    return { status: 400, message: eligibility.reason || "This order is not eligible for return." };
  }

  const items = (order.items || []).map((it) => ({
    product: it.product,
    name: it.name,
    size: it.size || "",
    color: it.color || "",
    price: Number(it.price || 0),
    qty: Number(it.qty || 1),
    lineTotal: Number(it.lineTotal || 0),
  }));

  const returnReq = await ReturnRequest.create({
    returnNumber: generateReturnNumber(),
    order: order._id,
    user: userId,
    orderNumber: order.orderNumber || String(order._id),
    items,
    resolution,
    reason: cleanReason,
    customerNotes: String(customerNotes || "").trim().slice(0, 2000),
    policyAcknowledged: true,
    status: "pending",
    returnDeadline: eligibility.returnDeadline,
  });

  const user = await User.findById(userId).select("name email").lean();
  sendReturnSubmittedEmails(returnReq, order, user).catch(() => {});

  return {
    status: 201,
    message: "Return request submitted. We will review it shortly.",
    return: toPublicReturn(returnReq),
  };
}

async function listMyReturns(userId) {
  const rows = await ReturnRequest.find({ user: userId }).sort({ createdAt: -1 }).lean();
  return { status: 200, returns: rows.map(toPublicReturn) };
}

async function getMyReturn(userId, returnId) {
  if (!mongoose.Types.ObjectId.isValid(returnId)) {
    return { status: 400, message: "Invalid return id" };
  }
  const row = await ReturnRequest.findOne({ _id: returnId, user: userId }).lean();
  if (!row) return { status: 404, message: "Return not found" };
  return { status: 200, return: toPublicReturn(row) };
}

async function getOrderReturnEligibility(userId, orderId) {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return { status: 400, message: "Invalid order id" };
  }
  const order = await Order.findOne({ _id: orderId, user: userId }).lean();
  if (!order) return { status: 404, message: "Order not found" };
  const eligibility = await buildReturnEligibility(order, userId);
  return { status: 200, eligibility };
}

async function listAllReturns(query = {}) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 50));
  const skip = (page - 1) * limit;
  const filter = {};
  if (query.status && RETURN_STATUSES.includes(query.status)) {
    filter.status = query.status;
  }

  const [rows, total] = await Promise.all([
    ReturnRequest.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ReturnRequest.countDocuments(filter),
  ]);

  return {
    status: 200,
    returns: rows.map((r) => ({
      ...toPublicReturn(r),
      customerName: r.user?.name || "",
      customerEmail: r.user?.email || "",
    })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
}

const ADMIN_TRANSITIONS = {
  pending: ["approved", "rejected", "cancelled"],
  approved: ["received", "cancelled"],
  received: ["completed", "cancelled"],
};

async function updateReturnStatus(adminUser, returnId, { status, adminNotes }, req) {
  if (!mongoose.Types.ObjectId.isValid(returnId)) {
    return { status: 400, message: "Invalid return id" };
  }
  if (!RETURN_STATUSES.includes(status)) {
    return { status: 400, message: "Invalid status" };
  }

  const returnReq = await ReturnRequest.findById(returnId);
  if (!returnReq) return { status: 404, message: "Return not found" };

  const allowed = ADMIN_TRANSITIONS[returnReq.status] || [];
  if (!allowed.includes(status) && returnReq.status !== status) {
    return {
      status: 400,
      message: `Cannot change status from ${returnReq.status} to ${status}`,
    };
  }

  returnReq.status = status;
  if (adminNotes !== undefined) {
    returnReq.adminNotes = String(adminNotes || "").trim().slice(0, 2000);
  }
  const now = new Date();
  if (status === "approved") returnReq.approvedAt = now;
  if (status === "received") returnReq.receivedAt = now;
  if (status === "completed") returnReq.completedAt = now;
  await returnReq.save();

  const order = await Order.findById(returnReq.order);
  const customer = await User.findById(returnReq.user).select("name email").lean();

  if (status === "completed" && returnReq.resolution === "refund" && order) {
    order.paymentStatus = "refunded";
    await order.save();
  }

  if (["approved", "rejected", "completed"].includes(status)) {
    sendReturnStatusEmail(returnReq, customer, order).catch(() => {});
  }

  await writeAudit({
    actor: { id: adminUser.id, email: adminUser.email },
    action: `return.${status}`,
    resource: "return",
    resourceId: returnReq._id,
    req,
    meta: { returnNumber: returnReq.returnNumber, resolution: returnReq.resolution },
  });

  return {
    status: 200,
    message: "Return updated",
    return: toPublicReturn(returnReq),
  };
}

async function enrichOrdersWithReturns(orders, userId) {
  if (!orders.length) return [];
  const orderIds = orders.map((o) => o._id);
  const returns = await ReturnRequest.find({
    order: { $in: orderIds },
    user: userId,
  })
    .sort({ createdAt: -1 })
    .lean();

  const byOrder = new Map();
  for (const r of returns) {
    const key = String(r.order);
    if (!byOrder.has(key)) byOrder.set(key, []);
    byOrder.get(key).push(toPublicReturn(r));
  }

  return Promise.all(
    orders.map(async (orderDoc) => {
      const o = orderDoc.toObject ? orderDoc.toObject() : orderDoc;
      const eligibility = await buildReturnEligibility(o, userId);
      return {
        ...o,
        returns: byOrder.get(String(o._id)) || [],
        returnEligibility: eligibility,
      };
    })
  );
}

module.exports = {
  createReturnRequest,
  listMyReturns,
  getMyReturn,
  getOrderReturnEligibility,
  listAllReturns,
  updateReturnStatus,
  enrichOrdersWithReturns,
  toPublicReturn,
  RETURN_SHIPPING_NOTICE,
};
