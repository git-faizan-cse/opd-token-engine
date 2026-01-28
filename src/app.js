import express from "express";
import tokenRoutes from "./routes/token.routes.js";
import errorHandler from "./middleware/error.middleware.js";

const app = express();

app.use(express.json());

app.use("/api/tokens", tokenRoutes);

app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("OPD Token Allocation Engine is running");
});

export default app;
