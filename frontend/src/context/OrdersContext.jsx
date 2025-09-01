import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchOrdersWithQRCode, fetchOrders } from '../API/OrdersAPI';

const OrdersContext = createContext();
export const useOrders = () => useContext(OrdersContext);

export const OrdersProvider = ({ children }) => {
    const PORT = import.meta.env.PORT || "8000";
    const SERVER_DOMAIN = import.meta.env.SERVER_DOMAIN || "localhost";
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

    // const params = "from=2025-08-28&to=2025-08-28&expand[]=items&expand[]=transactions.method&expand[]=transactions";
    // useEffect(() => {
    //     const getOrders = async () => {
    //         const newOrders = await fetchOrdersWithQRCode(params);
    //         console.log('Fetched orders with QR code:', newOrders);
    //         // const newTransactions = await fetchOrders(paramsTransactions.toString());

    //         // const ordersMerged = newOrders.map(order => {
    //         //     const match = newTransactions.find(t => t.id === order.id);
    //         //     if (!match) {console.log('No matching transactions for order:', order.id);}
    //         //     return {
    //         //         ...order,
    //         //         transactions: match ? match.transactions : [],
    //         //     }
    //         // })
    //         // setOrders(prevOrders => {
    //         //     const updated = [
    //         //         ...ordersMerged,
    //         //         ...prevOrders.filter(o => !ordersMerged.some(no => no.id === o.id))
    //         //     ]
    //         //     // console.log('Orders:', updated);
    //         //     localStorage.setItem('orders', JSON.stringify(updated));
    //         //     return updated;
    //         // })
    //     };

    //     getOrders();
    //     // const interval = setInterval(getOrders, 2000);
    //     // return () => clearInterval(interval);
    // }, []);

    // useEffect(() => {
    //     localStorage.removeItem('orders');
    // }, []);

    useEffect(() => {
        let ws;

        const connect = () => {
            ws = new WebSocket("ws://" + SERVER_DOMAIN + ":" + PORT);

            ws.onopen = () => {
            console.log("✅ WebSocket connected");
            };

            ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("📩 WebSocket message received :", data);

            if (data.type === "ORDER_ENDED") {
                const newOrders = data.payload;
                setOrders((prevOrders) => {
                const updated = [
                    ...newOrders,
                    ...prevOrders.filter((o) => !newOrders.some((no) => no.id === o.id)),
                ];
                localStorage.setItem("orders", JSON.stringify(updated));
                return updated;
                });
            }
            };

            ws.onclose = () => {
            console.log("⚠️ WebSocket closed, attempting to reconnect...");
            setTimeout(connect, 2000);
            };

            ws.onerror = (err) => {
            console.error("❌ Websocket error:", err);
            ws.close();
            };
        };

        connect();

        return () => {
            if (ws) ws.close();
        };
        }, []);

    const closeItemByQRCode = (qrCode) => {
        setOrders(prevOrders => {
            console.log('Item ready by QR code:', qrCode);
            const updatedOrders = prevOrders.map(order => {
                if (qrCode.orderId === order.id) {
                    const updatedItems = order.items.map(item => 
                        qrCode.itemId === item.id
                            ? { ...item, status: 'ready' }
                            : item
                    );
                    const allReady = updatedItems.every(item => item.status === 'ready');

                    if (allReady) {console.log('All items ready for order:', order.id);}

                    return {
                        ...order,
                        items: updatedItems,
                        status: allReady ? 'ready' : order.status,
                    };
                }
                return order;
            });
            console.log('Updated orders after ready item:', updatedOrders);
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
