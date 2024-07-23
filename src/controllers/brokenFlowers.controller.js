const { SuccessResponse } = require("../core/success.response");
const brokenFlowersService = require("../services/brokenFlowers.service");

class brokenFlowersController {
  static async addToContact(req, res, next) {
    new SuccessResponse({
      message: "success",
      metadata: await brokenFlowersService.createUserTransaction(req.body),
    }).send(res);
  }

  static async addToBrokenFlowers(req, res, next) {
    new SuccessResponse({
      message: "success",
      metadata: await brokenFlowersService.addToBrokenFlowers(req.body),
    }).send(res);
  }

  static async updateBrokenFlowers(req, res, next) {
    new SuccessResponse({
      message: "success",
      metadata: await brokenFlowersService.updateBrokenFlowers(req.body),
    }).send(res);
  }

  static async delete(req, res, next) {
    new SuccessResponse({
      message: "deleted Cart success",
      metadata: await brokenFlowersService.deleteUserTransaction(req.body),
    }).send(res);
  }

  static async listToContact(req, res, next) {
    new SuccessResponse({
      message: "getList Cart success",
      metadata: await brokenFlowersService.getListUserTransaction(req.params),
    }).send(res);
  }

  static async getToBrokenFlowers(req, res, next) {
    new SuccessResponse({
      message: "getList Cart success",
      metadata: await brokenFlowersService.getToBrokenFlowers(req.body),
    }).send(res);
  }

  static async listToContactByShop(req, res, next) {
    console.log(req.params);
    new SuccessResponse({
      message: "getList Cart success",
      metadata: await brokenFlowersService.getListUserTransactiontByShop(req.params),
    }).send(res);
  }
}

module.exports = brokenFlowersController;
