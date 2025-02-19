import mongoose from "mongoose";

//for create table into database
const billsSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    customerAddress: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    subTotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    cartItems: {
      type: Array,
      required: true,
    },
  },
  {
    //for date
    timestamps: true,
  }
);

const Bills = mongoose.model("Bills", billsSchema);
export default Bills;
