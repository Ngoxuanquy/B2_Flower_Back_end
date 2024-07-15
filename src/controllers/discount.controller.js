const { SuccessResponse } = require("../core/success.response");
const DiscountService = require("../services/discount.service");

class DiscountController {
  static createDiscount = async (req, res, next) => {
    new SuccessResponse({
      message: "Create new discount success",
      metadata: await DiscountService.createDiscountCode({ ...req.body }),
    }).send(res);
  };

  static getAllProductWithDiscountCode = async (req, res, next) => {
    console.log(req.query);

    new SuccessResponse({
      message: "Get all discount success",
      metadata: await DiscountService.getAllProductWithDiscountCode({
        ...req.query,
      }),
    }).send(res);
  };

  static getAllDiscountCodesByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "get All Discount Codes By Shop success",
      metadata: await DiscountService.getAllDiscountCodesByShop(req.params),
    }).send(res);
  };

  static updateDiscountCode = async (req, res, next) => {
    new SuccessResponse({
      message: "update discount success",
      metadata: await DiscountService.updateDiscountCode({
        bodyUpdate: req.body,
        discountId: req.param.discountId,
      }),
    }).send(res);
  };

  static getDiscountAmount = async (req, res, next) => {
    new SuccessResponse({
      message: "update discount success",
      metadata: await DiscountService.getDiscountAmount({
        ...req.body,
      }),
    }).send(res);
  };

  // static deleteDiscountCode = async (req, res, next) => {
  //     new SuccessResponse({
  //         message: 'update discount success',
  //         metadata: await DiscountService.deleteDiscountCode({
  //             ...req.body,
  //             shopId: req.user.userId,
  //         }),
  //     }).send(res)
  // }

  // static cancleDiscountCode = async (req, res, next) => {
  //     new SuccessResponse({
  //         message: 'update discount success',
  //         metadata: await DiscountService.cancleDiscountCode({
  //             bodyUpdate: req.body,
  //             discountId: req.param.discountId,
  //         }),
  //     }).send(res)
  // }
}

module.exports = DiscountController;
