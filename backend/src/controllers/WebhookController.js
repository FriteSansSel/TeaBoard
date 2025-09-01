import { fetchOrderWithQRCodeInternal } from "../controllers/OrdersController.js";
import { broadcast } from "../server.js";

export const handleWebhook = async (req, res) => {
    try {
        const event = req.body;

        if (event.event_name === "order.ended") {
            const orderId = event.data?.id;

            const params = `/${orderId}?expand[]=items&expand[]=transactions&expand[]=transactions.method`;
            const orderWithQRCode = await fetchOrderWithQRCodeInternal(params);

            if (!orderWithQRCode) {
                throw new Error(`No order found for id=${orderId}`);
            }

            console.log("Order with QR codes :", orderWithQRCode);

            broadcast({ type: "ORDER_ENDED", payload: [orderWithQRCode] });
        }

        res.sendStatus(200);
    } catch (err) {
        console.error("Error in handleWebhook:", err);
        res.sendStatus(500);
    }
};
