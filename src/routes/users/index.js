const express = require("express");
const { authenticationV2 } = require("../../auth/authUtils");
const asyncHandler = require("../../helpers/asyncHandle");
const UserController = require("../../controllers/users.controller");

const router = express.Router();

// authentication

router.use(authenticationV2);

router.get(
  "/getAddressUser/:userId",
  asyncHandler(UserController.getAddressUser)
);
router.post("/update/:id", asyncHandler(UserController.updateUser));
router.post("/updateMoney/:userId", asyncHandler(UserController.updateMoney));

router.post("/createAddress", asyncHandler(UserController.createAddress));
router.post("/updateAddress", asyncHandler(UserController.updateAddress));
router.post("/deleteAddress", asyncHandler(UserController.deleteAddress));

router.post("/updateUn/:id", asyncHandler(UserController.updateUserUn));

// router.delete('/', asyncHandler(TransactionController.d))
router.post("/userId/:userId", asyncHandler(UserController.listToUser));
router.get("/", asyncHandler(UserController.listToTransaction));
router.get("/countMessage/:userId", asyncHandler(UserController.countMessage));

router.post("/", asyncHandler(UserController.addToUser));

module.exports = router;
