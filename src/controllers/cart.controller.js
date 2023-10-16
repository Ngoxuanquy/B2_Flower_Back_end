const { SuccessResponse } = require('../core/success.response');
const CartService = require('../services/cart.service');

class CartController {
    static async addToCart(req, res, next) {
        new SuccessResponse({
            message: 'Create new Cart success',
            metadata: await CartService.addToCart(req.body),
        }).send(res);
    }

    static async updateTransaciton(req, res, next) {
        new SuccessResponse({
            message: 'Create new Cart success',
            metadata: await CartService.updateTransaciton(req.params),
        }).send(res);
    }

    // update + or -
    static async update(req, res, next) {
        console.log(req.body);
        new SuccessResponse({
            message: 'Create new Cart success',
            metadata: await CartService.addToCartV2(req.body),
        }).send(res);
    }

    static async delete(req, res, next) {
        new SuccessResponse({
            message: 'deleted Cart success',
            metadata: await CartService.deleteUserCart(req.body),
        }).send(res);
    }

    static async listToCart(req, res, next) {
        new SuccessResponse({
            message: 'getList Cart success',
            metadata: await CartService.getListUserCart(req.params),
        }).send(res);
    }

    static async listToCartByShop(req, res, next) {
        console.log(req.params);
        new SuccessResponse({
            message: 'getList Cart success',
            metadata: await CartService.getListUserCartByShop(req.params),
        }).send(res);
    }
}

module.exports = CartController;
