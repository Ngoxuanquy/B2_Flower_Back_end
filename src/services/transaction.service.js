const { NotFoundError } = require("../core/error.response");
const { transaction } = require("../models/transaction.model");
// const { getProductById } = require('../models/repositories/product.repo')
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

function generateRandomString(length = 6) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
class TransactionService {
  // START REPO CART
  // tạo giỏ hàng
  // static async createUserTransaction({ user, product, shopId }) {
  //     const query = { transaction_state: 'active', transaction_ShopId: shopId },
  //         updateOrInsert = {
  //             $addToSet: {
  //                 transaction_products: product,
  //                 transaction_userId: user,
  //             },
  //         },
  //         options = {
  //             upsert: true,
  //             new: true,
  //         }

  //     return await transaction.create(query, updateOrInsert, options)
  // }

  static async createUserTransaction({ user, product, shopId, paymentExpression, notifications, phiShip, email, total_amounts, discount }) {
    const newTransaction = new transaction({
      transaction_state: "active",
      userId: user._id,
      // transaction_ShopId: shopId,
      transactionId: generateRandomString(),
      transaction_products: product,
      payment_expression: paymentExpression,
      transaction_userId: [user],
      notifications: notifications || "null",
      total_amounts: total_amounts,
      phiShip: phiShip,
      discount: discount,
    });

    try {
      const createdTransaction = await newTransaction.save();

      const htmlContent = `
  <h2>Đơn hàng đã đặt</h2>
  <table style="width: 100%; border-collapse: collapse;">
    <thead>
      <tr>
        <th style="border: 1px solid black; padding: 8px;">Sản phẩm</th>
        <th style="border: 1px solid black; padding: 8px;">Số lượng</th>
        <th style="border: 1px solid black; padding: 8px;">Đơn giá</th>
      </tr>
    </thead>
    <tbody>
      ${product
        .map(
          (item) => `
        <tr>
          <td style="border: 1px solid black; padding: 8px;">
         <img src="${item.product_thumb}" alt="${
            item.product_name
          }" style="width: 80px; height: 80px; object-fit: cover; margin-right: 10px;"/>
           <div>
           ${item.product_name}</div>
          </td>
          <td style="border: 1px solid black; padding: 8px;">${item.quantity}</td>
          <td style="border: 1px solid black; padding: 8px;">${
            item.product_discount == 0 ? item.product_price : item.product_price * (1 - item.product_discount / 100)
          } đ</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>
  <p>Trạng thái: ${notifications}</p>
  <p>Phí Ship: ${phiShip} đ</p>
    <p>Tổng thanh toán: ${total_amounts} đ</p>
  <p>Vui lòng xác nhận đơn hàng của bạn.</p>
`;

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "ngoxuanquy1812@gmail.com",
          pass: "bgoz fvvx raus cqjo", // Consider using environment variables for sensitive information
        },
      });

      const mailOptions = {
        from: "ngoxuanquy1812@gmail.com",
        to: email,
        subject: "Verification Code",
        html: htmlContent,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
        }
      });

      return createdTransaction;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to create user transaction.");
    }
  }

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

  static async updateStatus({ transactionId, status, notifications }) {
    console.log({ notifications });

    // Define the query to find the document
    const query = { _id: transactionId };

    // Define the update set based on the status
    const updateSet = {
      $set: {
        status: status,
      },
    };

    // Update notifications only if status is "đã gửi hàng"
    if (status === "đã gửi hàng") {
      updateSet.$set.notifications = notifications ? notifications : null;
    }

    try {
      // Perform the update operation
      const updateResult = await transaction.updateOne(query, updateSet);
      console.log(`${updateResult.modifiedCount} bản ghi đã được cập nhật.`);
      return updateResult;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  static async getListUserTransaction({ userId }) {
    try {
      console.log(userId);

      // Use the 'findMany' method to find multiple documents where 'userId' matches
      const transactions = await transaction.find({ userId }).lean();

      // Return an array of matching documents
      return transactions;
    } catch (error) {
      // Handle any errors (e.g., database connection error)
      console.error("Error fetching user transactions:", error);
      throw error;
    }
  }

  static async getFull() {
    try {
      // Use the 'findMany' method to find multiple documents where 'userId' matches
      const transactions = await transaction
        .find({
          status: "Đang nhận đơn",
        })
        .lean();

      // Return an array of matching documents
      return transactions;
    } catch (error) {
      // Handle any errors (e.g., database connection error)
      console.error("Error fetching user transactions:", error);
      throw error;
    }
  }

  static async getFullUseId({ userId }) {
    try {
      // Use the 'findMany' method to find multiple documents where 'userId' matches
      const transactions = await transaction
        .find({
          status: "Đang nhận đơn",
          userId: userId,
        })
        .lean();

      // Return an array of matching documents
      return transactions;
    } catch (error) {
      // Handle any errors (e.g., database connection error)
      console.error("Error fetching user transactions:", error);
      throw error;
    }
  }

  static async getFullOrder_done() {
    try {
      // Use the 'findMany' method to find multiple documents where 'userId' matches
      const transactions = await transaction
        .find({
          status: "Đã gửi hàng",
        })
        .lean();

      // Return an array of matching documents
      return transactions;
    } catch (error) {
      // Handle any errors (e.g., database connection error)
      console.error("Error fetching user transactions:", error);
      throw error;
    }
  }

  static async getFullOrderReceived() {
    try {
      // Use the 'findMany' method to find multiple documents where 'userId' matches
      const transactions = await transaction
        .find({
          status: "Đã nhận hàng",
        })
        .lean();

      // Return an array of matching documents
      return transactions;
    } catch (error) {
      // Handle any errors (e.g., database connection error)
      console.error("Error fetching user transactions:", error);
      throw error;
    }
  }

  static async getFullOrder_doneUseId({ userId }) {
    console.log(userId);
    try {
      // Use the 'findMany' method to find multiple documents where 'userId' matches
      const transactions = await transaction
        .find({
          status: "Đã gửi hàng",
          userId: userId,
        })
        .lean();

      console.log({ transactions });

      // Return an array of matching documents
      return transactions;
    } catch (error) {
      // Handle any errors (e.g., database connection error)
      console.error("Error fetching user transactions:", error);
      throw error;
    }
  }

  static async getFullOrder_receivedUseId({ userId }) {
    console.log(userId);
    try {
      // Use the 'findMany' method to find multiple documents where 'userId' matches
      const transactions = await transaction
        .find({
          status: "Đã nhận hàng",
          userId: userId,
        })
        .lean();

      // Return an array of matching documents
      return transactions;
    } catch (error) {
      // Handle any errors (e.g., database connection error)
      console.error("Error fetching user transactions:", error);
      throw error;
    }
  }

  static async deleteTransaction({ transactionId }) {
    try {
      // Use the 'findMany' method to find multiple documents where 'userId' matches
      const transactions = await transaction.deleteOne({ _id: transactionId }).lean();

      // Return an array of matching documents
      return {
        mgs: "Hủy đơn hàng thành công!!",
      };
    } catch (error) {
      // Handle any errors (e.g., database connection error)
      console.error("Error fetching user transactions:", error);
      throw error;
    }
  }
}

module.exports = TransactionService;
