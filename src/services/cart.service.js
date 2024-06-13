const { NotFoundError } = require('../core/error.response');
const { cart } = require('../models/cart.model');
const { getProductById } = require('../models/repositories/product.repo');

class CartService {
    // START REPO CART
    // tạo giỏ hàng
    static async createUserCart({ userId, product, shopId }) {
        const query = {
                cart_userId: userId,
                cart_state: 'active',
                cart_ShopId: shopId,
            },
            updateOrInsert = {
                $addToSet: {
                    cart_products: product,
                },
            },
            options = {
                upsert: true,
                new: true,
            };

        return await cart.findOneAndUpdate(query, updateOrInsert, options);
    }

    static async updateUserCartQuantity({ userId, product }) {
        // console.log({ userId })
        console.log({ product });
        try {
            const { _id, quantity } = product;

            const query = {
                    cart_userId: userId,
                    cart_state: 'active',
                    'cart_products._id': _id,
                },
                updateSet = {
                    $inc: {
                        'cart_products.$.quantity': quantity,
                    },
                },
                options = {
                    upsert: true,
                    new: true,
                };

            return await cart.findOneAndUpdate(query, updateSet, options);
        } catch (error) {
            // Handle the error appropriately
            console.error('Error updating user cart quantity:', error);
            throw error;
        }
    }

    // END REPO CART

    /* --------------> Thêm sản phẩm vào giỏ hàng */
    static async addToCart({ userId, product = {}, shopId }) {
        // console.log({ userId })
        // console.log({ product })
        const userCart = await cart.findOne({ cart_userId: userId });

        console.log({ product });
        // nếu k có giỏ hàng thì tạo giỏ hàng mới
        if (!userCart) {
            return await CartService.createUserCart({
                userId,
                product,
                shopId,
            });
        }

        console.log({ userCart: userCart.cart_products });

        const exists =
            userCart.cart_products.filter((a) => a._id === product._id).length >
            0;

        console.log({ exists });

        if (exists) {
            console.log(`tồn tại trong mảng cart_products`);
        } else {
            userCart.cart_products = [...userCart.cart_products, product];
            // console.log(userCart)
            return userCart.save();
        }
        //nếu có giỏ hàng mà chưa có sản phẩm thì thêm sản phẩm vào giỏ hàng
        console.log('hoàn thành');

        // nếu có giỏ hàng, có cả sản phẩm cần thêm thì tăng số lượng sản phẩm đó lên 1
        return await CartService.updateUserCartQuantity({ userId, product });
    }

    static async addToCartV2({ userId, shop_order_ids }) {
        const { productId, quantity, old_quantity } = shop_order_ids[0];


        const foundProduct = await getProductById(productId);
        console.log(foundProduct);

        if (!foundProduct) throw new NotFoundError('');

        if (
            foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId
        ) {
            throw new NotFoundError('Product do not belong to the shop');
        }

        if (quantity === 0) {
            // delete product
        }

        return await CartService.updateUserCartQuantity({
            userId,
            product: {
                productId,
                quantity: +old_quantity,
            },
        });
    }

    static async deleteUserCart({ userId, productId }) {
        console.log({ userId });
        console.log({ productId });

        const query = { cart_userId: userId, cart_state: 'active' },
            updateSet = {
                $pull: {
                    cart_products: {
                        _id: productId,
                    },
                },
            };

        const deleteCart = await cart.updateOne(query, updateSet);

        return deleteCart;
    }

    static async getListUserCart({ userId }) {
        console.log(userId);
        return await cart
            .findOne({
                cart_userId: userId,
            })
            .lean();
    }

    static async getListUserCartByShop({ shopId }) {
        console.log(shopId);
        return await cart
            .findOne({
                cart_ShopId: shopId,
            })
            .lean();
    }

    static async updateTransaciton({ userId, newCartData }) {
        try {
            // Find the old cart data based on userId
            const oldCart = await cart.findOne({ userId: userId });

            if (!oldCart) {
                throw new Error('Cart not found.');
            }

            // Convert old and new data to JSON strings for comparison
            const oldCartJSON = JSON.stringify(oldCart.cart_products);
            const newCartDataJSON = JSON.stringify(newCartData);

            if (oldCartJSON === newCartDataJSON) {
                // If the data is equal, delete the cart
                await cart.deleteOne({ userId: userId });
                return null; // Indicate that the cart has been deleted
            } else {
                // Compare old and new data to find new items in newCartData
                for (const newItem of newCartData) {
                    oldCart.cart_products.forEach((product, index) => {
                        if (newItem._id === product._id) {
                            oldCart.cart_products.splice(index, 1); // Loại bỏ phần tử tại vị trí index
                        }
                    });
                }
                // Update the cart with the filtered cart_products
                const updatedCart = await cart.findOneAndUpdate(
                    { userId: userId },
                    { $set: { cart_products: oldCart.cart_products } },
                    { new: true },
                );

                return updatedCart;
            }
        } catch (error) {
            console.error(error);
            throw new Error('Failed to update transaction.');
        }
    }
}

module.exports = CartService;
