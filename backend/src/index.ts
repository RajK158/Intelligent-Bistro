import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { OrderRequestSchema, processAIOrder } from "./aiOrder";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ status: "ok", name: "Intelligent Bistro API" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "healthy" });
});

app.post("/api/ai/order", async (req, res) => {
  const result = OrderRequestSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      error: "Invalid request",
      details: result.error.flatten(),
    });
    return;
  }

  const { message, cart, history } = result.data;
  const response = await processAIOrder(message, cart, history);
  res.json(response);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
