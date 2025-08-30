import { GenerateQRCode } from '../utils/functions.js';
import { ZELTY_API, API_KEY } from '../utils/configs.js';
import { routesZelty } from '../utils/constants.js';

export const getOrders = async (req, res) => {
    const params = new URLSearchParams(req.query).toString();
    try {
        const response = await fetch(`${ZELTY_API}${routesZelty.orders}?${params}`, {
            method : 'GET',
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

// reusable utility function (for the webhook and the API)
// In "await fetch(`${ZELTY_API}${routesZelty.orders}?${params}`," the "?" can be an issue.
export const fetchOrdersWithQRCodeInternal = async (params) => {
  const response = await fetch(`${ZELTY_API}${routesZelty.orders}?${params}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
  });

  const data = await response.json();

  if (!data.orders || data.orders.length === 0) {
    console.log('No orders found');
    return [];
  }

  const dataWithQRCodes = await Promise.all(
    data.orders.map(async (order) => {
      const itemsWithQRCode = await Promise.all(
        order.items.map(async (item) => {
          const qrPayload = `${order.id}/${item.id}`;
          const qrCode = await GenerateQRCode(qrPayload);
          return { ...item, qrCode, status: 'opened' };
        })
      );
      return {
        ...order,
        items: itemsWithQRCode,
      };
    })
  );

  return dataWithQRCodes;
};

// API endpoint to get orders with QR codes
export const getOrdersWithQRCode = async (req, res) => {
  const fullQueryString = req.originalUrl.split('?')[1];
  console.log('req:', fullQueryString);

  try {
    const dataWithQRCodes = await fetchOrdersWithQRCodeInternal(fullQueryString);
    res.json(dataWithQRCodes);
  } catch (err) {
    console.error('Error fetching orders with QR code (Zelty):', err);
    res.status(500).json({ message: 'Error fetching orders with QR code (Zelty)' });
  }
};
