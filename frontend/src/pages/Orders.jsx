import React from 'react';
import { useOrders } from '../context/OrdersContext';
import BackButton from '../components/BackButton';
import { enqueuePrint } from "../utils/printQueue";
import './Orders.css';

const Orders = () => {
    const { orders, setOrders } = useOrders();

    const removeOrder = (orderId) => {
        const updated = orders.filter(o => o.id !== orderId);
        setOrders(updated);
        localStorage.setItem('orders', JSON.stringify(updated));
    };

    return (
        <div className="orders-container">
            <BackButton />
            {orders.map(o => (
                <div key={o.id} className="order-card">
                    <div className="order-content">
                        <div className="order-details">
                            <div className="order-header">
                                Commande #{o.display_id} {o.status === 'closed' ? '❌' : '✅'}
                            </div>

                            <ul className="order-items">
                                {o.items.map((item, i) => (
                                    <li key={i} className="order-item">
                                        <div>
                                            {item.name} {item.status === 'closed' ? '❌' : '✅'}
                                        </div>

                                        {item.qrCode && (
                                            <img
                                                src={item.qrCode}
                                                alt={`QR ${item.name}`}
                                                className="qr-code"
                                                style={{ width: '120px', marginTop: '0.5rem' }}
                                            />
                                        )}
                                        <button
                                            className="order-done-button"
                                            onClick={() => enqueuePrint(o, item)}
                                        >
                                            🖨️ Imprimer
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {o.status === 'ready' && (
                            <button
                                className="order-done-button"
                                onClick={() => removeOrder(o.id)}
                            >
                                Terminée
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Orders;
