const express = require("express");
const { authenticationV2 } = require("../../auth/authUtils");
const asyncHandler = require("../../helpers/asyncHandle");
const ContactController = require("../../controllers/contact.controller");
const brokenFlowersController = require("../../controllers/brokenFlowers.controller");

const router = express.Router();

// authentication

router.use(authenticationV2);

router.post("/", asyncHandler(brokenFlowersController.addToContact));
router.post("/create", asyncHandler(brokenFlowersController.addToBrokenFlowers));

router.post("/updateBrokenFlowers", asyncHandler(brokenFlowersController.updateBrokenFlowers));
router.post("/getBrokenFlowers", asyncHandler(brokenFlowersController.getToBrokenFlowers));
router.post("/get/:userId", asyncHandler(brokenFlowersController.listToContact));

module.exports = router;
