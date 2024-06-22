const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "OrderPayOs";
const COLLECTION_NAME = "OrderPayOss";

const OrderPayOsSchema = new Schema(
  {
    transaction_state: {
      type: String,
      required: true,
      enum: ["active", "completed", "failed", "pending"],
      default: "active",
    },

    userId: {
      type: String,
    },
    products: {
      type: Array,
      required: true,
      default: [],
    },

    count_product: {
      type: Number,
      default: 0,
    },
    orderId: {
      type: Number,
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: {
      createdAt: "createdOn",
      updatedAt: "modifieOn",
    },
  }
);

module.exports = {
  orderPayOs: model(DOCUMENT_NAME, OrderPayOsSchema),
};
