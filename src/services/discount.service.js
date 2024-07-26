const discountModel = require("../models/discount.model");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const {
  convertToObjectIdMongodb,
  removeUndefinedObject,
  getInfoData,
} = require("../utils");
const {
  checkDiscountExists,
  findAllDiscountCodeUnSelect,
  updateDiscountById,
} = require("../models/repositories/discount.repo");
const { findAllProducts } = require("../models/repositories/product.repo");

class DiscountService {
  static async createDiscountCode(payload) {
    if (
      new Date() > new Date(payload.start_date) ||
      new Date() > new Date(payload.end_date)
    ) {
      throw new BadRequestError("Mã giảm giá đã hết hạn!");
    }

    if (new Date(payload.start_date) >= new Date(payload.end_date)) {
      throw new BadRequestError("Ngày bắt đầu phải lơn hơn ngày kết thúc");
    }

    const newDiscount = discountModel.create({
      discount_name: payload.name,
      discount_value: payload.value,
      discount_code: payload.code,
      discount_start_date: new Date(payload.start_date),
      discount_end_date: new Date(payload.end_date),
      discount_users_used: payload.users_user,
    });

    return newDiscount;
  }

  static async updateDiscountCode({ discountId, bodyUpdate }) {
    const objectParam = removeUndefinedObject(bodyUpdate);
    return await updateDiscountById({ discountId, bodyUpdate: objectParam });
  }

  static async getAllProductWithDiscountCode({ code, shopId, limit, page }) {
    const foundDiscount = await checkDiscountExists({
      model: discountModel,
      filter: {
        discount_code: code,
        discount_shopId: convertToObjectIdMongodb(shopId),
      },
    });

    if (!foundDiscount && !foundDiscount.discount_is_active) {
      return new NotFoundError("Discount not exists!");
    }

    const { discount_applies_to, discount_product_ids } = foundDiscount;

    let products;
    if (discount_applies_to === "all") {
      // get all product

      products = findAllProducts({
        filter: {
          product_shop: convertToObjectIdMongodb(shopId),
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }

    if (discount_applies_to === "specific") {
      // get the products ids

      products = findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }

    return products;
  }

  static async getAllDiscountCodesByShop({ email }) {
    console.log({ email });
    const discounts = await discountModel.find({
      discount_users_used: { $in: [email] },
    });

    console.log(
      getInfoData(
        [
          "discount_end_date",
          "discount_start_date",
          "discount_value",
          "discount_type",
          "discount_name",
        ],
        discounts
      )
    );

    return discounts;
  }

  static async updateNotification({ email }) {
    const discounts = await discountModel.find({
      discount_users_used: { $in: [email] },
    });

    console.log("Original Discounts:", discounts);

    // Filter out discounts where email is already in discount_user_notification_used
    const filteredDiscounts = discounts.filter(
      (discount) => !discount.discount_user_notification_used.includes(email)
    );

    console.log("Filtered Discounts:", filteredDiscounts);

    return filteredDiscounts;
  }

  static async addUpdateNotification({ email }) {
    // Find all discounts where the email has been used
    const discounts = await discountModel.find({
      discount_users_used: { $in: [email] },
    });

    console.log("Original Discounts:", discounts);

    // Update each discount to add the email to the discount_user_notification_used array
    const updatedDiscounts = discounts.map((discount) => {
      if (!discount.discount_user_notification_used.includes(email)) {
        discount.discount_user_notification_used.push(email);
      }
      return discount.save(); // Save the updated discount
    });

    // Wait for all updates to complete
    await Promise.all(updatedDiscounts);

    // Fetch the updated discounts to return
    return {
      mes: "done",
    };
  }

  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    const foundDiscount = await checkDiscountExists({
      model: discountModel,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectIdMongodb(shopId),
      },
    });

    if (!foundDiscount) throw new BadRequestError(`Discount doesn't exists`);

    const {
      discount_is_active,
      discount_max_uses,
      discount_end_date,
      discount_min_order_value,
      discount_user_per_used,
      discount_users_used,
      discoun_type,
      discount_value,
    } = foundDiscount;

    if (!discount_is_active) throw new BadRequestError(`Discount expired`);
    if (!discount_max_uses) throw new BadRequestError(`Discount are out!`);

    if (new Date() > new Date(discount_end_date)) {
      throw new BadRequestError(`Discount code has expired`);
    }

    // kiem tra xem co set gia tri toi thieu hay khong

    let totalOrder = 0;

    if (discount_min_order_value > 0) {
      totalOrder = products.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);

      if (totalOrder < discount_min_order_value) {
        throw new BadRequestError(
          `Discount requires a minium order value of ${discount_min_order_value} `
        );
      }
    }
    if (discount_user_per_used > 0) {
      const userUsedDiscount = discount_users_used.find(
        (user) => user.userId === userId
      );

      if (userUsedDiscount) {
      }
    }

    // kiem tra discount la fixed or percentage

    const amount =
      discoun_type === "fixed_amount"
        ? discount_value
        : totalOrder * (discount_value / 100);

    const totalPrice = totalOrder - amount;

    return {
      totalOrder,
      amount,
      totalPrice: totalPrice < 0 ? 0 : totalPrice,
    };
  }

  static async deleteDiscountCode({ shopId, codeId }) {
    const deleted = await discountModel.findOneAndDelete({
      discount_code: codeId,
      discount_shopId: convertToObjectIdMongodb(shopId),
    });

    return deleted;
  }

  static async deleteUserToDiscount({ codeId, email }) {
    try {
      // Tìm phần tử bằng codeId
      const deleted = await discountModel.findById(codeId);

      // Kiểm tra nếu phần tử không tồn tại
      if (!deleted) {
        throw new Error("Code not found");
      }

      // Kiểm tra nếu discount_users_used tồn tại và là một mảng
      if (!Array.isArray(deleted.discount_users_used)) {
        throw new Error("discount_users_used is not an array");
      }
      // Xóa email từ mảng discount_users_used
      deleted.discount_users_used = deleted.discount_users_used.filter(
        (userEmail) => userEmail !== email
      );

      // Lưu đối tượng deleted lại vào cơ sở dữ liệu
      await deleted.save();

      return deleted;
    } catch (error) {
      // Xử lý lỗi nếu có
      console.error(error);
      throw new Error("Error deleting user from discount");
    }
  }

  static async cancleDiscountCode({ codeId, shopId, userId }) {
    const foundDiscount = checkDiscountExists({
      model: discountModel,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectIdMongodb(shopId),
      },
    });

    if (!foundDiscount) throw new NotFoundError(`Discount doesn't exists`);

    const result = await discountModel.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: userId,
      },
      $inc: {
        discount_max_uses: 1,
        discount_uses_count: -1,
      },
    });

    return result;
  }
}

module.exports = DiscountService;
