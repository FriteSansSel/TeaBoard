import express from 'express';
import cors from 'cors';

import { ordersRouter } from './routes/OrdersRoute.js';

const app = express();

app.use(cors());

app.use('/orders', ordersRouter);
app.use('/webhook', webhookRouter);

export default app;