import { GenerateQRCode } from '../utils/functions.js';
import { ZELTY_API, API_KEY } from '../utils/configs.js';
import { routesZelty } from '../utils/constants.js';
import { saveOrder, getAllOrders, clearAllOrders, deleteOrder, getOrder } from '../utils/redisService.js';

export const getOrders = async (req, res) => {
    const params = new URLSearchParams(req.query).toString();
    try {
        const response = await fetch(`${ZELTY_API}${routesZelty.orders}?${params}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            redirect: 'follow',
        });

        const data = await response.json();
        // console.log('Fetched orders:', data);
        res.json(data);
    } catch (err) {
        console.error('Error fetching orders (Zelty):', err);
        res.status(500).json({ message: 'Error fetching orders (Zelty)' });
    }
};

// reusable utility function (for the webhook and the API, single order)
export const fetchOrderWithQRCodeInternal = async (params) => {
    const response = await fetch(`${ZELTY_API}${routesZelty.orders}${params}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
        },
        redirect: 'follow',
    });

    const data = await response.json();
    const order = data.order;

    if (!order || !order.items) {
        console.log('No order found or missing items');
        return null;
    }

    const itemsWithQRCode = await Promise.all(
        order.items.map(async (item) => {
            const qrPayload = `${order.id}/${item.id}`;
            const qrCode = await GenerateQRCode(qrPayload);
            return { ...item, qrCode, status: 'closed' };
        })
    );

    const fullOrder = {
        ...order,
        items: itemsWithQRCode,
    };

    try {
        await saveOrder(fullOrder);
        console.log(`✅ Order ${order.id} saved in KV`);
    } catch (err) {
        console.error(`❌ Failed to save order ${order.id}:`, err);
    }

    return fullOrder;
};

export const savedOrders = async (req, res) => {
    try {
        const orders = await getAllOrders();
        res.json(orders);
    } catch (err) {
        console.error('Error fetching saved orders from KV:', err);
        res.status(500).json({ message: 'Error fetching saved orders from KV' });
    }
};

export const deleteAllOrders = async (req, res) => {
    try {
        await clearAllOrders();
        res.json({ message: 'All saved orders deleted successfully' });
    } catch (err) {
        console.error('Error deleting saved orders from KV:', err);
        res.status(500).json({ message: 'Error deleting saved orders from KV' });
    }
};

export const deleteSingleOrder = async (req, res) => {
    const { id } = req.params;
    try {
        await deleteOrder(id);

        const { broadcast } = await import("../server.js");
        broadcast({ type: "ORDER_DELETED", payload: { id } });

        res.json({ message: `Order ${id} deleted successfully` });
    } catch (err) {
        console.error(`Error deleting order ${id} from KV:`, err);
        res.status(500).json({ message: `Error deleting order ${id} from KV` });
    }
};


export const updateOrder = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const existing = await getOrder(id);
        if (!existing) {
            return res.status(404).json({ message: `Order ${id} not found` });
        }

        const updatedOrder = { ...existing, ...updates };

        await saveOrder(updatedOrder);

        const { broadcast } = await import("../server.js");
        broadcast({ type: "ORDER_UPDATED", payload: updatedOrder });

        res.json(updatedOrder);
    } catch (err) {
        console.error(`❌ Error updating order ${id}:`, err);
        res.status(500).json({ message: "Error updating order" });
    }
};


// API endpoint to get orders with QR codes (internal function not for multiple orders, need to change it to make this
// function work)
// export const getOrdersWithQRCode = async (req, res) => {
//   const fullQueryString = req.originalUrl.split('?')[1];
//   console.log('req:', fullQueryString);

//   try {
//     const dataWithQRCodes = await fetchOrdersWithQRCodeInternal(fullQueryString);
//     res.json(dataWithQRCodes);
//   } catch (err) {
//     console.error('Error fetching orders with QR code (Zelty):', err);
//     res.status(500).json({ message: 'Error fetching orders with QR code (Zelty)' });
//   }
// };