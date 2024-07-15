const express = require("express");
const { authenticationV2 } = require("../../auth/authUtils");
const productController = require("../../controllers/product.controller");
const asyncHandler = require("../../helpers/asyncHandle");

const router = express.Router();

router.post("/getAll", asyncHandler(productController.getproductAll));
router.post(
  "/search/:keySearch",
  asyncHandler(productController.getListSearchProduct)
);
router.post("/page/:page", asyncHandler(productController.findAllProducts));
router.get("/:product_id", asyncHandler(productController.findProduct));

router.post("/byId/:id", asyncHandler(productController.getproductById));

// authentication
router.use(authenticationV2);

// PUT

router.post("/", asyncHandler(productController.createProduct));
router.post("/updateQuantity", asyncHandler(productController.updateQuantity));
router.post(
  "/updateProduct/:productId",
  asyncHandler(productController.updateProduct)
);

//delete
router.post(
  "/delete/:productId",
  asyncHandler(productController.deleteproductAll)
);

router.post(
  "/publish/:id",
  asyncHandler(productController.publicProductByShop)
);
router.post(
  "/unpublish/:id",
  asyncHandler(productController.unPublicProductByShop)
);

// QUERY
router.get("/drafts/all", asyncHandler(productController.getAllDraftForShop));
router.get(
  "/published/all",
  asyncHandler(productController.getAllPublishForShop)
);

module.exports = router;
