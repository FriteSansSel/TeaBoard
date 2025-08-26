import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchOrdersWithQRCode, fetchOrders } from '../API/OrdersAPI';

const OrdersContext = createContext();
export const useOrders = () => useContext(OrdersContext);

export const OrdersProvider = ({ children }) => {
    const [orders, setOrders] = useState(() => {
        const saved = localStorage.getItem('orders');

        if (saved) {
            try {
                const savedOrders = JSON.parse(saved);

                const today = new Date().toISOString().split('T')[0];

                const validOrders = savedOrders.filter(o => {
                    const orderDate = new Date(o.created_at).toISOString().split('T')[0];
                    return orderDate === today;
                })

                if (validOrders.length !== savedOrders.length) {
                    localStorage.setItem('orders', JSON.stringify(validOrders));
                }
                
                return validOrders;
            } catch (error) {
                console.error('Error parsing saved orders:', error);
                // localStorage.removeItem('orders');
            }
        }
        return [];
    });

    const params = new URLSearchParams({
        opened: 'true',
        expand: 'items',
    });

    const paramsTransactions = new URLSearchParams({
        opened: 'true',
        expand: 'transactions',
    });

    useEffect(() => {
        const getOrders = async () => {
            const newOrders = await fetchOrdersWithQRCode(params.toString());
            const newTransactions = await fetchOrders(paramsTransactions.toString());

            const ordersMerged = newOrders.map(order => {
                const match = newTransactions.find(t => t.id === order.id);
                if (!match) {console.log('No matching transactions for order:', order.id);}
                return {
                    ...order,
                    transactions: match ? match.transactions : [],
                }
            })
            setOrders(prevOrders => {
                const updated = [
                    ...ordersMerged,
                    ...prevOrders.filter(o => !ordersMerged.some(no => no.id === o.id))
                ]
                // console.log('Orders:', updated);
                localStorage.setItem('orders', JSON.stringify(updated));
                return updated;
            })
        };

        getOrders();
        const interval = setInterval(getOrders, 2000);
        return () => clearInterval(interval);
    }, []);

    const closeItemByQRCode = (qrCode) => {
        setOrders(prevOrders => {
            console.log('Closing item by QR code:', qrCode);
            const updatedOrders = prevOrders.map(order => {
                if (qrCode.orderId === order.id) {
                    const updatedItems = order.items.map(item => 
                        qrCode.itemId === item.id
                            ? { ...item, status: 'closed' }
                            : item
                    );
                    const allClosed = updatedItems.every(item => item.status === 'closed');

                    if (allClosed) {console.log('All items closed for order:', order.id);}

                    return {
                        ...order,
                        items: updatedItems,
                        status: allClosed ? 'closed' : order.status,
                    };
                }
                return order;
            });
            console.log('Updated orders after closing item:', updatedOrders);
            localStorage.setItem('orders', JSON.stringify(updatedOrders));
            return updatedOrders;
        });
    };

    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === 'orders') {
                try {
                    const updatedOrders = JSON.parse(event.newValue);
                    setOrders(updatedOrders);
                } catch (e) {
                    console.error('Error parsing orders from storage event:', e);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return (
        <OrdersContext.Provider value={{ orders, setOrders, closeItemByQRCode }}>
            {children}
        </OrdersContext.Provider>
    );
};
