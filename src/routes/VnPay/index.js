/**
 * Created by CTT VNPAY
 */
const express = require('express');
const Payos = require('@payos/node');

const payos = new Payos(
    'a0c7a8fb-00dc-426c-ba85-41179a28b1df',
    '5f405556-7b3b-4359-a5e9-cc25e4518e99',
    '459703ad94886b85414a4fa4a99f8d77cf8080b4f6d0133c02e6e8d764b61aa7',
);

const app = express();
app.use(express.static('public'));
app.use(express.json());
let router = express.Router();
let $ = require('jquery');
const request = require('request');
const moment = require('moment');

router.post('/receive-hook', async (req, res) => {
    console.log(req.body);
    res.json();
});

router.post('/create-payment-link', async (req, res) => {
    const MaDonHang = Math.floor(100000 + Math.random() * 900000);
    const order = {
        amount: req.body.amount.toFixed(0),
        description: '2B-flower',
        buyerName: req.body.name,
        buyerEmail: 'buyer-email@gmail.com',
        buyerPhone: req.body.number,
        buyerAddress:
            req.body.user.diaChiCuThe +
            req.body.user.phuongXa +
            req.body.user.quanHuyen +
            req.body.user.tinhThanh,
        orderCode: MaDonHang,
        items: req.body.product,
        returnUrl: `http://localhost:3000/information`,
        cancelUrl: `http://localhost:3000/cart`,
    };

    try {
        const paymentLink = await payos.createPaymentLink(order);
        res.json(paymentLink.checkoutUrl);
    } catch (error) {
        console.error('Error creating payment link:', error.message);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
