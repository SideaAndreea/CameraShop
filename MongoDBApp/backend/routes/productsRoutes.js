import express from "express";
import {
  getProductController,
  addProductController,
  updateProductController,
  deleteProductController,
  applyDiscountToProductController,
  getProductByIdController,
  updateStock,
} from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.get("/getproducts", getProductController);

productRouter.get("/getproducts/:id", getProductByIdController);

productRouter.post("/addproducts", addProductController);

productRouter.put("/updateproducts/:productId", updateProductController);

productRouter.delete("/deleteproducts/:productId", deleteProductController);

productRouter.post(
  "/applydiscount/:productId",
  applyDiscountToProductController
);

productRouter.post("/updateStock", updateStock);

export default productRouter;
