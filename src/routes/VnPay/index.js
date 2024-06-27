const express = require("express");
const Payos = require("@payos/node");
const { transaction } = require("../../models/transaction.model");
const { cart } = require("../../models/cart.model");

const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const { orderPayOs } = require("../../models/orderPayOs.model");
const session = require("express-session");
const payos = new Payos(
  "a0c7a8fb-00dc-426c-ba85-41179a28b1df",
  "5f405556-7b3b-4359-a5e9-cc25e4518e99",
  "459703ad94886b85414a4fa4a99f8d77cf8080b4f6d0133c02e6e8d764b61aa7"
);

const ORDERS = {
  products: [],
  userId: null,
  price: null,
  user: [],
  email: null,
};

const router = express.Router();
router.use(express.static("public"));
router.use(express.json());
router.post("/receive-hook", async (req, res) => {
  res.json(req.body);

  if (res.data?.desc == "Thành công") {
    const newTransaction = new transaction({
      transaction_state: "active",
      userId: ORDERS.userId,
      // transaction_ShopId: shopId,
      transaction_products: ORDERS.products,
      payment_expression: ORDERS.price,
      transaction_userId: [ORDERS.user],
      notifications: "Đã thanh toán",
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
         <img src="${item.product_thumb}" alt="${item.product_name}" style="width: 80px; height: 80px; object-fit: cover; margin-right: 10px;"/>
           <div>
           ${item.product_name}</div>
          </td>
          <td style="border: 1px solid black; padding: 8px;">${item.quantity}</td>
          <td style="border: 1px solid black; padding: 8px;">${item.product_price}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

    <p>Tổng thanh toán: ${product.reduce((total, item) => total + item.quantity * item.product_price, 0) + phiShip}</p>
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
        to: ORDERS.email,
        subject: "Verification Code",
        html: htmlContent,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          try {
            // Find the old cart data based on userId
            const oldCart = cart.findOne({ userId: ORDERS.userId });

            if (!oldCart) {
              throw new Error("Cart not found.");
            }

            // Convert old and new data to JSON strings for comparison
            const oldCartJSON = JSON.stringify(oldCart.cart_products);
            const newCartDataJSON = JSON.stringify(ORDERS.products);

            if (oldCartJSON === newCartDataJSON) {
              // If the data is equal, delete the cart
              cart.deleteOne({ userId: userId });
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
              const updatedCart = cart.findOneAndUpdate(
                { userId: userId },
                { $set: { cart_products: oldCart.cart_products } },
                { new: true }
              );

              return updatedCart;
            }
          } catch (error) {
            console.error(error);
            throw new Error("Failed to update transaction.");
          }
        }
      });

      return createdTransaction;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to create user transaction.");
    }
  }
});

// Route to create a payment link
router.post("/create-payment-link", async (req, res) => {
  ORDERS.products = req.body?.product;
  ORDERS.userId = req.body?.userId;
  ORDERS.price = req.body?.amount;
  ORDERS.user = req.body?.selectedValueAdress;
  ORDERS.email = req.body?.email;

  const convertedProducts = req.body?.product.map((product) => ({
    name: product.product_name,
    quantity: product.quantity,
    price: product.product_price,
  }));

  console.log(req.body);

  const MaDonHang = Math.floor(100000 + Math.random() * 900000);
  const order = {
    amount: req.body.amount,
    description: "2B-flower",
    orderCode: MaDonHang,
    items: convertedProducts,
    returnUrl: `http://localhost:3000/information`,
    cancelUrl: `http://localhost:3000/cart`,
  };

  try {
    const paymentLink = await payos.createPaymentLink(order);

    res.json(paymentLink.checkoutUrl);
  } catch (error) {
    console.error("Error creating payment link:", error.message);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
