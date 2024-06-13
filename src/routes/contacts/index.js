const express = require("express");
const { authenticationV2 } = require("../../auth/authUtils");
const asyncHandler = require("../../helpers/asyncHandle");
const ContactController = require("../../controllers/contact.controller");

const router = express.Router();

// authentication

router.use(authenticationV2);

router.post("/", asyncHandler(ContactController.addToContact));
router.post("/update", asyncHandler(ContactController.update));
// router.delete('/', asyncHandler(TransactionController.d))
router.get("/shopId/:shopId", asyncHandler(ContactController.listToTransactionByShop));
router.post("/get/:userId", asyncHandler(ContactController.listToContact));

module.exports = router;
