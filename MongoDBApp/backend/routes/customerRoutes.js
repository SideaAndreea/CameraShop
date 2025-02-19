import express from "express";
import {
  addCustomerController,
  getCustomersController,
  modifyCustomerController,
  deleteCustomerController,
} from "../controllers/customerController.js";

const router = express.Router();

// Rute pentru clienți
router.post("/addcustomer", addCustomerController);
router.get("/getcustomers", getCustomersController);
router.put("/updatecustomer/:customerId", modifyCustomerController);
router.delete("/deletecustomer/:customerId", deleteCustomerController);

export default router;
