const { Schema, model } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Discount";
const COLLECTION_NAME = "discounts";

// Declare the Schema of the Mongo model
var discountSchema = new Schema(
  {
    // tên giảm giá
    discount_name: {
      type: String,
      required: true,
    },
    // mô tả
    discount_description: {
      type: String,
      // required: true,
    },
    // kiểu giảm giá (% or số tiền)
    discount_type: {
      type: String,
      default: "fixed_amount", // or percentage
    },
    // giá trị giảm giá
    discount_value: {
      type: Number,
      required: true,
    },
    // mã giảm giá
    discount_code: {
      type: String,
      required: true,
    },
    // ngày bắt đầu
    discount_start_date: {
      type: Date,
      required: true,
    },
    // ngày kết thúc
    discount_end_date: {
      type: Date,
      required: true,
    },
    // số lượng mã được áp dụng
    discount_max_uses: {
      type: Number,
      // required: true,
    },
    // số mã giảm giá đã sử dụng
    discount_uses_count: {
      type: Number,
      default: 0,
    },
    // những người đã dùng mã giảm giá
    discount_users_used: {
      type: Array,
      default: [],
    },
    // số lượng mã giảm giá mỗi người có thể sử dụng
    discount_user_notification_used: {
      type: Array,
      default: [],
    },
    // giá trị tối thiểu cho mỗi đơn hàng
    discount_min_order_value: {
      type: Number,
      // required: true,
    },
    discount_max_value: {
      type: Number,
      // required: true,
    },
    discount_shopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
    // mã còn hoạt động hay không
    discount_is_active: {
      type: Boolean,
      // default: true,
    },
    // áp dụng cho tất cả hay chỉ 1 vài sản phẩm
    discount_applies_to: {
      type: String,
      // required: true,
      enum: ["all", "specific"],
    },
    // số sản phẩm được áp dụng mã giảm giá
    discount_product_ids: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = model(DOCUMENT_NAME, discountSchema);
