const { NotFoundError } = require("../core/error.response");
const { brokenFlowers } = require("../models/brokenFlowers.model");
const { contact } = require("../models/contact.model");
const { product } = require("../models/product.model");
// const { getProductById } = require('../models/repositories/product.repo')

class brokenFlowersService {
  static async createUserTransaction(payload) {
    try {
      // Tìm contact theo userId
      const existingContact = await contact.findOne({ userId: payload.userId });

      // Nếu đã tồn tại contact, thực hiện cập nhật thông tin
      if (existingContact) {
        existingContact.address = payload.address;
        existingContact.phone = payload.phone;
        existingContact.name = payload.name;
        const updatedContact = await existingContact.save();
        return updatedContact;
      } else {
        // Nếu không tìm thấy contact, tạo mới và lưu vào cơ sở dữ liệu
        const newContact = new contact({
          address: payload.address,
          phone: payload.phone,
          userId: payload.userId,
          name: payload.name,
        });
        const createdContact = await newContact.save();
        return createdContact;
      }
    } catch (error) {
      console.error(error);
      throw new Error("Failed to create or update user transaction.");
    }
  }

  static async addToBrokenFlowers(payload) {
    try {
      // Nếu không tìm thấy contact, tạo mới và lưu vào cơ sở dữ liệu
      const newBrokenFlowers = new brokenFlowers({
        productId: payload.productId,
        product_Name: payload.product_Name,
        quantity: payload.quantity,
        img: payload.img,
        status: payload.status,
        email: payload.email,
        date: payload.date,
      });
      const createdContact = await newBrokenFlowers.save();
      return createdContact;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to create or update user transaction.");
    }
  }

  static async updateBrokenFlowers(payload) {
    try {
      // Find the broken flower by ID
      const brokenFlower = await brokenFlowers.findById(payload.id);
      if (!brokenFlower) {
        throw new Error("Broken flower not found");
      }

      console.log({ brokenFlower });

      // Update the status
      brokenFlower.status = payload.status;
      await brokenFlower.save();

      // If status is "Không duyệt", update product quantity
      if (payload.status === "Đã duyệt") {
        // Find the product by ID
        const product = await Product.findById(payload.productId);
        if (!product) {
          throw new Error("Product not found");
        }

        // Update the product quantity
        product.product_quantity -= Number(payload.quantity);

        console.log({ product_quantity: product.product_quantity });

        await product.save();
      }
    } catch (error) {
      console.error(error);
      throw new Error("Failed to update broken flowers.");
    }
  }

  /*
        shop_order_ids = [
            {
                shopId,
                item_products: [
                    {
                        quantity,
                        price,
                        shopId,
                        old_quntity,
                        productId
                    }
                ]
            }
        ]
    */

  static async deleteUserTransaction({ userId, productId }) {
    console.log({ userId });
    console.log({ productId });

    const query = { cart_userId: userId, cart_state: "active" },
      updateSet = {
        $pull: {
          cart_products: {
            productId,
          },
        },
      };

    const deleteCart = await cart.updateOne(query, updateSet);

    return deleteCart;
  }

  static async getListUserTransaction({ userId }) {
    console.log(userId);
    return await contact
      .findOne({
        userId: userId,
      })
      .lean();
  }

  static async getToBrokenFlowers({ status, status2 }) {
    console.log({ status });
    console.log({ status2 });

    return await brokenFlowers
      .find({
        $or: [{ status: status }, { status: status2 }],
      })
      .lean();
  }

  static async getListUserTransactiontByShop({ shopId }) {
    console.log(shopId);
    return await transaction
      .find({
        transaction_ShopId: shopId,
      })
      .lean();
  }
}

module.exports = brokenFlowersService;
