import { Router } from 'express';
import { getOrders, getOrdersWithQRCode } from '../controllers/OrdersController.js';

const ordersRouter = Router();

ordersRouter.get('/', getOrders);

ordersRouter.get('/with-qr', getOrdersWithQRCode);

export { ordersRouter };