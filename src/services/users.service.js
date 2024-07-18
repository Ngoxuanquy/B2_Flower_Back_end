const { NotFoundError } = require("../core/error.response");
const shopModel = require("../models/shop.model");
// const { getProductById } = require('../models/repositories/product.repo')
const { getInfoData } = require("../utils");
const payos = require("../utils/payos");

class UserService {
  static async createUsers({ user, product, shopId }) {
    const newTransaction = new shopModel({
      transaction_state: "active",
      transaction_ShopId: shopId,
      transaction_products: [product],
      transaction_userId: [user],
    });

    try {
      const createdTransaction = await shopModel.save();
      return createdTransaction;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to create user transaction.");
    }
  }

  static async deleteUser({ userId, productId }) {
    const query = { cart_userId: userId, cart_state: "active" },
      updateSet = {
        $pull: {
          cart_products: {
            productId,
          },
        },
      };

    const deleteCart = await shopModel.updateOne(query, updateSet);

    return deleteCart;
  }

  static async updateUser({ id }) {
    const query = { _id: id };
    const updateSet = {
      $set: {
        status: "active",
      },
    };
    const updateCart = await shopModel.updateOne(query, updateSet);

    return updateCart;
  }

  static async updateMoney({ userId, moneys }) {
    try {
      const user = await shopModel.findOne({ _id: userId });

      if (user) {
        const currentMoney = user.moneys || 0;

        user.moneys = currentMoney + moneys;
        // console.log(userCart)
        return user.save();
      } else {
        throw new Error("User not found");
      }
    } catch (error) {
      console.error("Error updating address:", error);
      return { error: "Failed to update address" };
    }
  }

  static async createAddress(body) {
    try {
      const user = await shopModel.findOne({ _id: body.userId });

      if (user) {
        const currentAddress = user.address || "";

        user.address = [
          ...currentAddress,
          {
            ...body.address,
            id: Math.floor(Math.random() * Date.now()).toString(36),
          },
        ];
        // console.log(userCart)
        return user.save();
      } else {
        throw new Error("User not found");
      }
    } catch (error) {
      console.error("Error updating address:", error);
      return { error: "Failed to update address" };
    }
  }

  static async updateAddress(body) {
    try {
      const user = await shopModel.findOne({ _id: body.userId });

      if (user) {
        const currentAddress = user.address;

        const index = currentAddress.findIndex(
          (address) => address.id === body.id
        );
        if (index !== -1) {
          currentAddress[index] = {
            ...currentAddress[index],
            ...body.newAddress,
          };
          return user.save();
        }

        // console.log(userCart)
      } else {
        throw new Error("User not found");
      }
    } catch (error) {
      console.error("Error updating address:", error);
      return { error: "Failed to update address" };
    }
  }

  static async deleteAddress({ userId, id }) {
    try {
      const user = await shopModel.findOne({ _id: userId });

      if (user) {
        const currentAddress = user.address;

        // Find the index of the address with the specified id
        const index = currentAddress.findIndex((address) => address.id === id);

        if (index !== -1) {
          // Remove the address from the currentAddress array
          currentAddress.splice(index, 1);

          // Save the updated user object
          await user.save();

          return { success: true, message: "Address deleted successfully" };
        } else {
          return { error: "Address not found" };
        }
      } else {
        throw new Error("User not found");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      return { error: "Failed to delete address" };
    }
  }

  static async getAddressUser({ userId }) {
    try {
      const address = await shopModel.findById(userId).lean();
      console.log(address);
      if (!address) {
        throw new Error("Address not found"); // Throw error if address not found
      }

      return getInfoData(["address", "name", "number", "moneys"], address);
    } catch (error) {
      return { error: "Failed to fetch address" };
    }
  }

  static async countMessage({ userId }) {
    try {
      const address = await shopModel.findById({ _id: userId }).lean();

      if (!address) {
        throw new Error("Address not found"); // Throw error if address not found
      }

      return getInfoData(["countMessage"], address);
    } catch (error) {
      return { error: "Failed to fetch address" };
    }
  }

  static async updateUserUn({ id }) {
    const query = { _id: id };
    const updateSet = {
      $set: {
        status: "inactive",
      },
    };
    const updateCart = await shopModel.updateOne(query, updateSet);

    return updateCart;
  }

  static async getListUser({ userId }) {
    const limit = 10;
    const sort = "ctime";
    const page = 1;
    const filter = {
      isPublished: true,
      // Xét điều kiện _id = 1
    };
    const select = null;

    const skip = (page - 1) * limit;
    const sortBy = sort === "ctime" ? { _id: -1 } : { id: 1 };

    console.log({ userId });
    // Kiểm tra nếu userId là của admin
    // Lọc danh sách người dùng theo yêu cầu của admin
    // Ví dụ: filter.isAdmin = true
    const admin = await shopModel.findOne({ _id: userId }).lean();

    console.log(admin);

    if (admin && admin.roles && admin.roles.includes("ADMIN")) {
      const userRoles = admin.roles;
      console.log({ userRoles });

      const products = shopModel
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(select)
        .lean();

      return products;
      // Người dùng có vai trò admin
      // Thực hiện các hành động liên quan đến việc lấy danh sách người dùng của admin
    } else {
      console.log("not admin");

      // Người dùng không có vai trò admin
      // Xử lý trường hợp khác (nếu cần)
    }
  }
}

// static async getListUser({ shopId }) {
//     console.log(shopId)
//     return await shopModel
//         .find({
//             transaction_ShopId: shopId,
//         })
//         .lean()
// }

module.exports = UserService;
