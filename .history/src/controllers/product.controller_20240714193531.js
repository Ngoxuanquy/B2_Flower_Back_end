const { SuccessResponse } = require("../core/success.response");
// const ProductService = require('../services/product.service')
const ProductServiceV2 = require("../services/product.hightlv.service");
const ProductService = require("../services/product.service");

class ProductController {
  createProduct = async (req, res, next) => {
    console.log({ body: req.body });
    new SuccessResponse({
      message: "Create new product success",
      metadata: await ProductService.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  updateProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Update product success",
      metadata: await ProductServiceV2.updateProduct(req.body),
    }).send(res);
  };

  // QUERY

  /**
   * @desc Get all Draft for shop
   * @param {Number} limit
   * @param {Number} skip
   */

  getAllDraftForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list draft success",
      metadata: await ProductServiceV2.findAllDraftsForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getAllPublishForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list publish success",
      metadata: await ProductServiceV2.findAllPublishForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getListSearchProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list search success",
      metadata: await ProductServiceV2.searchProduct(req.params),
    }).send(res);
  };

  updateQuantity = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list search success",
      metadata: await ProductServiceV2.updateQuantity(req.body),
    }).send(res);
  };

  findAllProducts = async (req, res, next) => {
    console.log(req.body);

    new SuccessResponse({
      message: "Get findAllProducts success",
      metadata: await ProductServiceV2.findAllProducts(req.params),
    }).send(res);
  };

  findProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Get findProduct success",
      metadata: await ProductServiceV2.findProduct({
        product_id: req.params.product_id,
      }),
    }).send(res);
  };

  // END QUERY

  // PUT

  publicProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "publicProductByShop success",
      metadata: await ProductServiceV2.publishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };

  unPublicProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "publicProductByShop success",
      metadata: await ProductServiceV2.unPublishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };

  // END PUT

  //GET
  getproductById = async (req, res, next) => {
    console.log({ id: req.params.id });

    new SuccessResponse({
      message: "publicProductByShop success",
      metadata: await ProductServiceV2.getproductById({
        product_id: req.params.id,
      }),
    }).send(res);
  };

  getproductAll = async (req, res, next) => {
    console.log("anc");
    new SuccessResponse({
      message: "publicProductByShop success",
      metadata: await ProductServiceV2.getproductAll(),
    }).send(res);
  };

  deleteproductAll = async (req, res, next) => {
    new SuccessResponse({
      message: "publicProductByShop success",
      metadata: await ProductServiceV2.dateleproductById(req.params),
    }).send(res);
  };
}

module.exports = new ProductController();
