import { SERVER_URL } from '../utils/configs';
import { routesRequest } from '../utils/constants';

export const fetchOrders = async (params) => {

            try {
                const res = await fetch(SERVER_URL + routesRequest.orders + "?" + params)

                if (!res.ok) {
                    throw new Error('Orders fetching failed');
                };

                const data = await res.json();
                return data.orders || [];
            } catch (error) {
                console.error('Error fetching orders:', error);
                return [];
            };
        };

export const fetchOrdersWithQRCode = async (params) => {
            try {
                console.log("req:", SERVER_URL + routesRequest.orders + "/with-qr?" + params);
                const res = await fetch(SERVER_URL + routesRequest.orders + "/with-qr?" + params)

                if (!res.ok) {
                    throw new Error('Orders with QR code fetching failed');
                };

                const data = await res.json();
                return data || [];
            } catch (error) {
                console.error('Error fetching orders with QR code:', error);
                return [];
            };
        }