import express from "express";
import {
  getBillsController,
  addBillsController,
  modifyBillController,
  deleteBillController,
  getMonthlySales,
  getBillsByUserId,
  getUserOrderCount,
} from "../controllers/billsController.js";

const billsRouter = express.Router();

// Obține toate facturile
billsRouter.get("/getbills", getBillsController);

// Ruta pentru obținerea facturilor pe baza userId
billsRouter.get("/getbills/:userId", getBillsByUserId);

// Creează o factură nouă
billsRouter.post("/addbills", addBillsController);

// Modifică o factură
billsRouter.put("/updatebills/:billId", modifyBillController);

// Șterge o factură
billsRouter.delete("/deletebills/:billId", deleteBillController);

// Obține vânzările pe luni
billsRouter.get("/get-monthly-sales", getMonthlySales);

// Obține numărul de comenzii al fiecărui utilizator
billsRouter.get("/get-user-order-count", getUserOrderCount);

export default billsRouter;
