import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";
import productRouter from "./routes/productsRoutes.js";
import userRouter from "./routes/userRoutes.js";
import billsRouter from "./routes/billsRoutes.js";
import customerRouter from "./routes/customerRoutes.js";
import helmet from "helmet";

dotenv.config();

// Conectare la MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Conectat la baza de date: ${mongoose.connection.name}`);
  } catch (error) {
    console.error(`Eroare la conectarea la baza de date: ${error.message}`);
    process.exit(1); // Oprire server în caz de eroare critică
  }
};

connectDB();

const app = express();

// Middleware-uri globale
app.use(cors());
app.use(helmet()); // Middleware pentru securitate
app.use(express.json()); // Înlocuiește body-parser
app.use(morgan("dev"));

// Rute
app.use("/api/products/", productRouter);
app.use("/api/users/", userRouter);
app.use("/api/bills/", billsRouter);
app.use("/api/customers/", customerRouter);

// Middleware pentru erori
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Eroare internă a serverului" });
});

// Port și inițializare server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Serverul rulează pe: http://localhost:${PORT}`);
});
