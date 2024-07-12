const express = require("express");
// const Payos = require("@payos/node");
const { transaction } = require("../../models/transaction.model");
const { cart } = require("../../models/cart.model");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const { orderPayOs } = require("../../models/orderPayOs.model");
const session = require("express-session");
const PayOS = require("../../utils/payos");

const ORDERS = {
  products: [],
  userId: null,
  price: null,
  user: [],
  email: null,
  MaDonHang: null,
  paymentLinkCreated: false, // Flag to track if payment link was created
};

const router = express.Router();
router.use(express.static("public"));
router.use(express.json());

// const payos = new Payos(
//   "a0c7a8fb-00dc-426c-ba85-41179a28b1df",
//   "5f405556-7b3b-4359-a5e9-cc25e4518e99",
//   "459703ad94886b85414a4fa4a99f8d77cf8080b4f6d0133c02e6e8d764b61aa7"
// );

router.post("/create-payment-link", async (req, res) => {
  ORDERS.products = req.body?.product;
  ORDERS.userId = req.body?.userId;
  ORDERS.price = req.body?.amount;
  ORDERS.user = req.body?.selectedValueAdress;
  ORDERS.email = req.body?.email;
  ORDERS.MaDonHang = req.body?.MaDonHang;
  ORDERS.paymentLinkCreated = true; // Set the flag when payment link is created

  const convertedProducts = req.body?.product.map((product) => ({
    name: product.product_name,
    quantity: product.quantity,
    price: product.product_price,
  }));

  console.log(req.body);

  const order = {
    amount: req.body.amount,
    description: "2B-flower",
    orderCode: req.body?.MaDonHang,
    items: convertedProducts,
    returnUrl: `http://localhost:3000/information`,
    cancelUrl: `http://localhost:3000/cart`,
  };

  try {
    const paymentLink = await PayOS.createPaymentLink(order);
    res.json(paymentLink.checkoutUrl);
  } catch (error) {
    console.error("Error creating payment link:", error.message);
    res.status(500).send("Internal server error");
  }
});

router.get("/abc/:orderId", async (req, res) => {
  try {
    const order = await PayOS.getPaymentLinkInformation(req.params.orderId);

    console.log(order.status);
    if (!order) {
      return res.json({
        error: -1,
        message: "failed",
        data: null,
      });
    }
    console.log({ order: ORDERS });
    if (order?.status === "PAID" && ORDERS.userId !== null) {
      const newTransaction = new transaction({
        transaction_state: "active",
        userId: ORDERS?.userId,
        transaction_products: ORDERS?.products,
        payment_expression: ORDERS?.price,
        transaction_userId: ORDERS?.user,
        notifications: "Đã thanh toán",
        total_amounts: ORDERS?.price,
      });

      try {
        const createdTransaction = await newTransaction.save();

        const oldCart = await cart.findOne({ cart_userId: ORDERS?.userId });

        if (!oldCart) {
          throw new Error("Cart not found.");
        }

        // Convert old and new data to JSON strings for comparison
        const oldCartJSON = JSON.stringify(oldCart.cart_products);
        const newCartDataJSON = JSON.stringify(ORDERS?.products);

        console.log({ oldCartJSON });
        console.log(newCartDataJSON);

        if (oldCart.cart_products.length === ORDERS?.products.length) {
          // If the data is equal, delete the cart
          await cart.deleteOne({ cart_userId: ORDERS?.userId });
          return null; // Indicate that the cart has been deleted
        } else {
          // Compare old and new data to find new items in newCartData
          ORDERS?.products?.forEach((newItem) => {
            oldCart.cart_products = oldCart.cart_products?.filter((product) => newItem._id !== product._id);
          });

          console.log({ test: oldCart.cart_products });

          // Update the cart with the filtered cart_products
          await cart.updateOne({ cart_userId: ORDERS.userId }, { $set: { cart_products: oldCart.cart_products } });
        }

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
          ${ORDERS.products
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
          to: ORDERS?.email,
          subject: "Xác nhận đơn hàng",
          html: htmlContent,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
          } else {
            ORDERS.userId = null;
          }
        });

        return createdTransaction;
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log("quyquyquy");
    }
    return res.json({
      error: 0,
      message: "ok",
      data: order,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      error: -1,
      message: "failed",
      data: null,
    });
  }
});

// router.post("/receive-hook", async (req, res) => {
//   console.log(req.body);

//   if (!ORDERS.paymentLinkCreated) {
//     return res.status(400).send("Payment link not created");
//   }

//   const webhookData = payos.verifyPaymentWebhookData(req.body);
//   console.log({ webhookData });

//   res.json(req.body);

//   if (webhookData?.desc == "Thành công") {
//     console.log("ngô xuân quy");
//     const newTransaction = new transaction({
//       transaction_state: "active",
//       userId: ORDERS?.userId,
//       transaction_products: ORDERS?.products,
//       payment_expression: ORDERS?.price,
//       transaction_userId: [ORDERS?.user],
//       notifications: "Đã thanh toán",
//     });

//     try {
//       const createdTransaction = await newTransaction.save();

//       const htmlContent = `
//   <h2>Đơn hàng đã đặt</h2>
//   <table style="width: 100%; border-collapse: collapse;">
//     <thead>
//       <tr>
//         <th style="border: 1px solid black; padding: 8px;">Sản phẩm</th>
//         <th style="border: 1px solid black; padding: 8px;">Số lượng</th>
//         <th style="border: 1px solid black; padding: 8px;">Đơn giá</th>
//       </tr>
//     </thead>
//     <tbody>
//       ${ORDERS.products
//         .map(
//           (item) => `
//         <tr>
//           <td style="border: 1px solid black; padding: 8px;">
//          <img src="${item.product_thumb}" alt="${item.product_name}" style="width: 80px; height: 80px; object-fit: cover; margin-right: 10px;"/>
//            <div>
//            ${item.product_name}</div>
//           </td>
//           <td style="border: 1px solid black; padding: 8px;">${item.quantity}</td>
//           <td style="border: 1px solid black; padding: 8px;">${item.product_price}</td>
//         </tr>
//       `
//         )
//         .join("")}
//     </tbody>
//   </table>

//   <p>Vui lòng xác nhận đơn hàng của bạn.</p>
// `;

//       const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//           user: "ngoxuanquy1812@gmail.com",
//           pass: "bgoz fvvx raus cqjo", // Consider using environment variables for sensitive information
//         },
//       });

//       const mailOptions = {
//         from: "ngoxuanquy1812@gmail.com",
//         to: ORDERS.email,
//         subject: "Verification Code",
//         html: htmlContent,
//       };

//       transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//           console.log(error);
//         } else {
//           try {
//             // Find the old cart data based on userId
//             const oldCart = cart.findOne({ userId: ORDERS.userId });

//             if (!oldCart) {
//               throw new Error("Cart not found.");
//             }

//             // Convert old and new data to JSON strings for comparison
//             const oldCartJSON = JSON.stringify(oldCart.cart_products);
//             const newCartDataJSON = JSON.stringify(ORDERS.products);

//             if (oldCartJSON === newCartDataJSON) {
//               // If the data is equal, delete the cart
//               cart.deleteOne({ userId: ORDERS.userId });
//               return null; // Indicate that the cart has been deleted
//             } else {
//               // Compare old and new data to find new items in newCartData
//               for (const newItem of newCartDataJSON) {
//                 oldCart.cart_products.forEach((product, index) => {
//                   if (newItem._id === product._id) {
//                     oldCart.cart_products.splice(index, 1); // Loại bỏ phần tử tại vị trí index
//                   }
//                 });
//               }
//               // Update the cart with the filtered cart_products
//               const updatedCart = cart.findOneAndUpdate(
//                 { userId: ORDERS.userId },
//                 { $set: { cart_products: oldCart.cart_products } },
//                 { new: true }
//               );

//               return updatedCart;
//             }
//           } catch (error) {
//             console.error(error);
//             throw new Error("Failed to update transaction.");
//           }
//         }
//       });

//       return createdTransaction;
//     } catch (error) {
//       console.error(error);
//     }
//   } else {
//     console.log("quyquyquy");
//   }
// });

module.exports = router;
