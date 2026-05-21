const returnService = require("../services/return.service");

function sendResult(res, result) {
  const status = result.status || 200;
  const body = { ...result };
  delete body.status;
  return res.status(status).json(body);
}

async function createReturn(req, res) {
  try {
    const { orderId, reason, resolution, customerNotes, policyAcknowledged } =
      req.body || {};
    return sendResult(
      res,
      await returnService.createReturnRequest(req.user.id, {
        orderId,
        reason,
        resolution,
        customerNotes,
        policyAcknowledged,
      })
    );
  } catch (err) {
    console.error("CREATE_RETURN_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function myReturns(req, res) {
  try {
    return sendResult(res, await returnService.listMyReturns(req.user.id));
  } catch (err) {
    console.error("MY_RETURNS_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getReturn(req, res) {
  try {
    return sendResult(res, await returnService.getMyReturn(req.user.id, req.params.id));
  } catch (err) {
    console.error("GET_RETURN_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function orderEligibility(req, res) {
  try {
    return sendResult(
      res,
      await returnService.getOrderReturnEligibility(req.user.id, req.params.orderId)
    );
  } catch (err) {
    console.error("RETURN_ELIGIBILITY_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function listReturnsAdmin(req, res) {
  try {
    return sendResult(res, await returnService.listAllReturns(req.query));
  } catch (err) {
    console.error("LIST_RETURNS_ADMIN_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function updateReturnAdmin(req, res) {
  try {
    const { status, adminNotes } = req.body || {};
    if (!status) return res.status(400).json({ message: "status is required" });
    return sendResult(
      res,
      await returnService.updateReturnStatus(req.user, req.params.id, { status, adminNotes }, req)
    );
  } catch (err) {
    console.error("UPDATE_RETURN_ADMIN_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  createReturn,
  myReturns,
  getReturn,
  orderEligibility,
  listReturnsAdmin,
  updateReturnAdmin,
};
