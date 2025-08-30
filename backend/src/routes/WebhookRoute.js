import { Router } from "express";
import { handleWebhook } from "../controllers/WebhookController.js";

const webhookRouter = Router();

webhookRouter.post("/", express.json(), handleWebhook);

export { webhookRouter };
