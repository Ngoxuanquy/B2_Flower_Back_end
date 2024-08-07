const express = require("express");
const { authenticationV2 } = require("../../auth/authUtils");
const asyncHandler = require("../../helpers/asyncHandle");
const TransactionController = require("../../controllers/transaction.controller");

const router = express.Router();

// authentication

router.use(authenticationV2);

router.post("/", asyncHandler(TransactionController.addToTransaction));
router.post("/update", asyncHandler(TransactionController.update));
// router.delete('/', asyncHandler(TransactionController.d))
router.get("/shopId/:shopId", asyncHandler(TransactionController.listToTransactionByShop));
router.post("/getTransaction/:userId", asyncHandler(TransactionController.listToTransaction));
router.post("/updateStatus", asyncHandler(TransactionController.updateStatus));
router.get("/getFull", asyncHandler(TransactionController.getFull));
router.get("/getFullOrder_done", asyncHandler(TransactionController.getFullOrder_done));
router.get("/getFullUseId/:userId", asyncHandler(TransactionController.getFullUseId));
router.get("/getFullOrder_doneUseId/:userId", asyncHandler(TransactionController.getFullOrder_doneUseId));
router.get("/getFullOrder_receivedUseId/:userId", asyncHandler(TransactionController.getFullOrder_receivedUseId));
router.post("/deleteTransaction/:transactionId", asyncHandler(TransactionController.deleteTransaction));

module.exports = router;
