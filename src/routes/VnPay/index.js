/**
 * Created by CTT VNPAY
 */
const express = require("express");
const Payos = require("@payos/node");
const { cart } = require("../../models/cart.model");

const payos = new Payos(
  "a0c7a8fb-00dc-426c-ba85-41179a28b1df",
  "5f405556-7b3b-4359-a5e9-cc25e4518e99",
  "459703ad94886b85414a4fa4a99f8d77cf8080b4f6d0133c02e6e8d764b61aa7"
);

const app = express();
app.use(express.static("public"));
app.use(express.json());
let router = express.Router();
let $ = require("jquery");
const request = require("request");
const moment = require("moment");

router.post("/receive-hook", async (req, res) => {
  console.log(req.body);

  const paymentLinkInfo = await payos.getPaymentLinkInfomation(req.body.data.orderCode);
  console.log(paymentLinkInfo);
});

router.post("/create-payment-link", async (req, res) => {
  console.log(req.body);
  const MaDonHang = Math.floor(100000 + Math.random() * 900000);
  const order = {
    amount: req.body.amount,
    description: "2B-flower",
    orderCode: MaDonHang,
    items: req.body.product,
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

//https://6515-1-54-8-247.ngrok-free.app

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

module.exports = router;
