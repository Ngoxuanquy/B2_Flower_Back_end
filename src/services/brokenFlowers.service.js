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
      brokenFlower.status = "Đã duyệt";
      await brokenFlower.save();

      // Find the product by ID
      const newProduct = await product.findById(payload.productId);
      if (!newProduct) {
        throw new Error("Product not found");
      }

      // Update the product quantity
      newProduct.product_quantity = newProduct.product_quantity - Number(payload.quantity);

      console.log({ product_quantity: newProduct.product_quantity });

      await newProduct.save();
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

  static async getToBrokenFlowers({ status }) {
    console.log({ status });
    return await brokenFlowers.find({ status: status }).lean();
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
