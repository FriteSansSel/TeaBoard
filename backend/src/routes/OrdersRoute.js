import { Router } from 'express';
// import { getOrders, getOrdersWithQRCode } from '../controllers/OrdersController.js';
import { savedOrders, deleteAllOrders, deleteSingleOrder } from '../controllers/OrdersController.js';

const ordersRouter = Router();

ordersRouter.get('/saved', savedOrders);

ordersRouter.delete('/saved', deleteAllOrders);

ordersRouter.delete('/saved/:id', deleteSingleOrder);

// ordersRouter.get('/', getOrders);

// ordersRouter.get('/with-qr', getOrdersWithQRCode);

export { ordersRouter };