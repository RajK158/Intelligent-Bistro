"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const aiOrder_1 = require("./aiOrder");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/", (_req, res) => {
    res.json({ status: "ok", name: "Intelligent Bistro API" });
});
app.get("/health", (_req, res) => {
    res.json({ status: "healthy" });
});
app.post("/api/ai/order", async (req, res) => {
    const result = aiOrder_1.OrderRequestSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({
            error: "Invalid request",
            details: result.error.flatten(),
        });
        return;
    }
    const { message, cart, history } = result.data;
    const response = await (0, aiOrder_1.processAIOrder)(message, cart, history);
    res.json(response);
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map