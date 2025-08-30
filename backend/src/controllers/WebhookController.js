import { fetchOrdersWithQRCodeInternal } from './OrdersController.js';
import { ZELTY_API, API_KEY } from '../utils/configs.js';
import { routesZelty } from '../utils/constants.js';

export const handleWebhook = async (req, res) => {
  try {
    const event = req.body;
    console.log("Webhook:", event);

    if (event.type === "order.ended") {
      const orderId = event.data?.id;
      console.log("Order id:", orderId);

      const params = `id=${orderId}&expand[]=items&expand[]=transactions&expand[]=transactions.method`;
      const ordersWithQRCode = await fetchOrdersWithQRCodeInternal(params);

      console.log("Order :", ordersWithQRCode);

      broadcast({ type: "ORDER_ENDED", payload: ordersWithQRCode });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Erreur webhook :", err);
    res.sendStatus(500);
  }
};
