const express = require("express");
const { authenticationV2 } = require("../../auth/authUtils");
const asyncHandler = require("../../helpers/asyncHandle");
const DiscountController = require("../../controllers/discount.controller");

const router = express.Router();

router.get(
  "/getAllProductWithDiscountCode",
  asyncHandler(DiscountController.getAllProductWithDiscountCode)
);
router.post("/amount", asyncHandler(DiscountController.getDiscountAmount));

// authentication

router.use(authenticationV2);

router.get(
  "/getAllDiscountCodesByShop/:email",
  asyncHandler(DiscountController.getAllDiscountCodesByShop)
);

router.post("/", asyncHandler(DiscountController.createDiscount));
router.post(
  "/deleteUserToDiscount",
  asyncHandler(DiscountController.deleteUserToDiscount)
);

router.post(
  "/updateNotification",
  asyncHandler(DiscountController.updateNotification)
);

router.post(
  "/addUpdateNotification",
  asyncHandler(DiscountController.addUpdateNotification)
);

router.patch(
  "/:discountId",
  asyncHandler(DiscountController.updateDiscountCode)
);

module.exports = router;
