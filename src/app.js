import express from "express";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("OPD Token Allocation Engine is running");
});

export default app;
