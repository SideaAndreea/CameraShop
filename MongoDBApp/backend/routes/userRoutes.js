import express from "express";
import {
  loginController,
  registerController,
  getUsersController,
  modifyUserController,
  deleteUserController,
  verifyUserController,
  resetPasswordController,
  getUserIdByName,
} from "../controllers/userController.js";

const userRouter = express.Router();

// Login utilizator
userRouter.post("/login", loginController);

// Înregistrare utilizator
userRouter.post("/register", registerController);

// Verificare utilizator
userRouter.put("/verify/:userId", verifyUserController);

// Resetare parolă
userRouter.put("/reset-password", resetPasswordController);

// Obținere toți utilizatorii
userRouter.get("/", getUsersController);

// Modificare utilizator
userRouter.put("/:userId", modifyUserController);

// Ștergere utilizator
userRouter.delete("/:userId", deleteUserController);

// Ruta pentru obținerea userId pe baza username
userRouter.get("/getUserId/:name", getUserIdByName);

export default userRouter;
