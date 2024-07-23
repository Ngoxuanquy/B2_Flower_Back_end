const { Schema, model } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "brokenFlowers";
const COLLECTION_NAME = "brokenFlowers";

// Declare the Schema of the Mongo model
var brokenFlowerSchema = new Schema(
  {
    productId: {
      type: String,
      required: true,
    },
    product_Name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      default: true,
    },
    img: {
      type: String,
    },

    status: {
      type: String,
      default: true,
    },
    email: {
      type: String,
      default: true,
    },
    date: {
      type: Date,
      default: new Date(),
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = {
  brokenFlowers: model(DOCUMENT_NAME, brokenFlowerSchema),
};
