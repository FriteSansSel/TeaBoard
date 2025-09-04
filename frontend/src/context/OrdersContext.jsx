import React, { createContext, useContext, useState, useEffect } from 'react';
// import { fetchOrdersWithQRCode, fetchOrders } from '../API/OrdersAPI';
import { connectPrinter, disconnectPrinter } from '../utils/printerService';
import { enqueuePrint } from "../utils/printQueue";
import { WS_URL, SERVER_URL } from '../utils/configs';

const OrdersContext = createContext();
export const useOrders = () => useContext(OrdersContext);

export const OrdersProvider = ({ children }) => {
    const [orders, setOrders] = useState([]);
    // const [orders, setOrders] = useState(() => {
    //     const saved = localStorage.getItem('orders');

    //     if (saved) {
    //         try {
    //             const savedOrders = JSON.parse(saved);

    //             const today = new Date().toISOString().split('T')[0];

    //             const validOrders = savedOrders.filter(o => {
    //                 const orderDate = new Date(o.created_at).toISOString().split('T')[0];
    //                 return orderDate === today;
    //             })

    //             if (validOrders.length !== savedOrders.length) {
    //                 localStorage.setItem('orders', JSON.stringify(validOrders));
    //             }
                
    //             return validOrders;
    //         } catch (error) {
    //             console.error('Error parsing saved orders:', error);
    //             // localStorage.removeItem('orders');
    //         }
    //     }
    //     return [];
    // });

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
        const fetchSavedOrders = async () => {
            try {
                const res = await fetch(`${SERVER_URL}/orders/saved`);
                if (!res.ok) throw new Error("Failed to fetch saved orders");
                const allOrders = await res.json();

                const today = new Date().toISOString().split('T')[0];

                const validOrders = allOrders.filter(o => {
                    const orderDate = new Date(o.created_at).toISOString().split('T')[0];
                    return orderDate === today;
                });

                setOrders(validOrders);

                const oldOrders = allOrders.filter(o => {
                    const orderDate = new Date(o.created_at).toISOString().split('T')[0];
                    return orderDate !== today;
                });

                for (const old of oldOrders) {
                    await fetch(`${SERVER_URL}/orders/saved/${old.id}`, { method: "DELETE" });
                }
            } catch (err) {
                console.error("❌ Error fetching saved orders:", err);
            }
        };

        fetchSavedOrders();
    }, []);

    useEffect(() => {
        let ws;

        const connect = () => {
            ws = new WebSocket(WS_URL);

            ws.onopen = () => {
            console.log("✅ WebSocket connected");
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === "ORDER_ENDED") {
                    const newOrders = data.payload;

                    (async () => {
                        for (const order of newOrders) {
                            for (const item of order.items) {
                                try {
                                    await enqueuePrint(order, item);
                                } catch (err) {
                                    console.error(`❌ Print error for ${item.name}`, err);
                                }
                            }
                        }
                    })();

                    setOrders((prevOrders) => {
                    const updated = [
                        ...newOrders,
                        ...prevOrders.filter((o) => !newOrders.some((no) => no.id === o.id)),
                    ];
                    // localStorage.setItem("orders", JSON.stringify(updated));
                    return updated;
                    });
                }

                if (data.type === "ORDER_UPDATED") {
                    const updatedOrder = data.payload;
                    setOrders(prevOrders => {
                        return prevOrders.map(o =>
                            o.id === updatedOrder.id ? updatedOrder : o
                        );
                    });
                }

                if (data.type === "ORDER_DELETED") {
                    const { id } = data.payload;
                    setOrders(prevOrders => prevOrders.filter(o => String(o.id) !== String(id)));
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

    const closeItemByQRCode = async (qrCode) => {
        const orderToUpdate = orders.find(o => o.id === qrCode.orderId);
        if (!orderToUpdate) return;

        const updatedItems = orderToUpdate.items.map(item =>
            qrCode.itemId === item.id
                ? { ...item, status: 'ready' }
                : item
        );
        const allReady = updatedItems.every(i => i.status === 'ready');

        const updatedOrder = {
            ...orderToUpdate,
            items: updatedItems,
            status: allReady ? 'ready' : orderToUpdate.status,
        };

        try {
            const res = await fetch(`${SERVER_URL}/orders/saved/${orderToUpdate.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedOrder)
            });

            if (!res.ok) throw new Error("Failed to update order");

        } catch (err) {
            console.error("❌ Error updating order:", err);
        }
    };

    // useEffect(() => {
    //     const handleStorageChange = (event) => {
    //         if (event.key === 'orders') {
    //             try {
    //                 const updatedOrders = JSON.parse(event.newValue);
    //                 setOrders(updatedOrders);
    //             } catch (e) {
    //                 console.error('Error parsing orders from storage event:', e);
    //             }
    //         }
    //     };

    //     window.addEventListener('storage', handleStorageChange);
    //     return () => {
    //         window.removeEventListener('storage', handleStorageChange);
    //     };
    // }, []);

    return (
        <OrdersContext.Provider value={{ orders, setOrders, closeItemByQRCode }}>
            {children}
        </OrdersContext.Provider>
    );
};
