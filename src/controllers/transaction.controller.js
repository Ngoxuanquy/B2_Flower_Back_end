const { SuccessResponse } = require("../core/success.response");
const TransactionService = require("../services/transaction.service");

class TransactionController {
  static async addToTransaction(req, res, next) {
    new SuccessResponse({
      message: "Create new transaction success",
      metadata: await TransactionService.createUserTransaction(req.body),
    }).send(res);
  }

  // // update + or -
  // static async update(req, res, next) {
  //     new SuccessResponse({
  //         message: 'Create new Cart success',
  //         metadata: await CartService.addToCartV2(req.body),
  //     }).send(res)
  // }

  static async delete(req, res, next) {
    new SuccessResponse({
      message: "deleted Cart success",
      metadata: await TransactionService.deleteUserTransaction(req.body),
    }).send(res);
  }

  static async getFull(req, res, next) {
    new SuccessResponse({
      message: "get transtion success",
      metadata: await TransactionService.getFull(),
    }).send(res);
  }

  static async getFullUseId(req, res, next) {
    new SuccessResponse({
      message: "get order success",
      metadata: await TransactionService.getFullUseId(req.params),
    }).send(res);
  }

  static async getFullOrder_done(req, res, next) {
    new SuccessResponse({
      message: "deleted Cart success",
      metadata: await TransactionService.getFullOrder_done(),
    }).send(res);
  }

  static async getFullOrderReceived(req, res, next) {
    new SuccessResponse({
      message: "deleted Cart success",
      metadata: await TransactionService.getFullOrderReceived(),
    }).send(res);
  }

  static async getFullOrder_doneUseId(req, res, next) {
    console.log("getFullOrder_done");
    new SuccessResponse({
      message: "deleted Cart success",
      metadata: await TransactionService.getFullOrder_doneUseId(req.params),
    }).send(res);
  }

  static async getFullOrder_receivedUseId(req, res, next) {
    console.log("getFullOrder_done");
    new SuccessResponse({
      message: "deleted Cart success",
      metadata: await TransactionService.getFullOrder_receivedUseId(req.params),
    }).send(res);
  }

  static async deleteTransaction(req, res, next) {
    new SuccessResponse({
      message: "deleted transaction success",
      metadata: await TransactionService.deleteTransaction(req.params),
    }).send(res);
  }

  static async updateStatus(req, res, next) {
    new SuccessResponse({
      message: "update Cart success",
      metadata: await TransactionService.updateStatus(req.body),
    }).send(res);
  }

  static async listToTransaction(req, res, next) {
    console.log(req.query);
    new SuccessResponse({
      message: "getList Cart success",
      metadata: await TransactionService.getListUserTransaction(req.params),
    }).send(res);
  }

  static async listToTransactionByShop(req, res, next) {
    console.log(req.params);
    new SuccessResponse({
      message: "getList Cart success",
      metadata: await TransactionService.getListUserTransactiontByShop(req.params),
    }).send(res);
  }
}

module.exports = TransactionController;
