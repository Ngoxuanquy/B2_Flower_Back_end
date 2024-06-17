const express = require("express");
const Payos = require("@payos/node");
const { cart } = require("../../models/cart.model");
const { LocalStorage } = require("node-localstorage");
const localStorage = new LocalStorage("./scratch");
const payos = new Payos(
  "a0c7a8fb-00dc-426c-ba85-41179a28b1df",
  "5f405556-7b3b-4359-a5e9-cc25e4518e99",
  "459703ad94886b85414a4fa4a99f8d77cf8080b4f6d0133c02e6e8d764b61aa7"
);

const app = express();
app.use(express.static("public"));
app.use(express.json());

let router = express.Router();

// Route to handle webhook from Payos
router.post("/receive-hook", async (req, res) => {
  console.log(req.body);
  const value = localStorage.getItem("products");
  console.log({ value });
  res.sendStatus(200); // Respond with 200 OK to acknowledge the webhook
});

// Route to create a payment link
router.post("/create-payment-link", async (req, res) => {
  console.log(req.body);

  // Convert products to required format
  const convertedProducts = req.body.product?.map((product) => ({
    name: product.product_name,
    quantity: product.quantity,
    price: product.product_price,
  }));

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
    // Create payment link using Payos SDK
    const paymentLink = await payos.createPaymentLink(order);

    res.json(paymentLink.checkoutUrl);
  } catch (error) {
    console.error("Error creating payment link:", error.message);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
