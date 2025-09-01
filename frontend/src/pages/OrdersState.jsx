import React, { useState , useEffect } from 'react';
import { useOrders } from '../context/OrdersContext';
import './OrdersState.css';

const OrdersState = () => {
    const { orders } = useOrders();

    const hasMatchingTransactions = (order) => {
        if (!order.transactions || order.transactions.length === 0) {
            return false;
        }
        const totalPaid = order.transactions.reduce((sum, t) => sum + t.price, 0);
        return totalPaid === order.price.final_amount_inc_tax;
        };

    return (
        <div className="status-container">
            <div className="status-column">
                <h2>En cours</h2>
                {orders.filter(o => o.status === 'closed').map(o => (
                    <div key={o.id} className="order-item">
                        {o.display_id}
                        {!hasMatchingTransactions(o) && <span> - À payer</span>}
                    </div>
                ))}
            </div>

            <div className="status-column">
                <h2>Terminées</h2>
                {orders.filter(o => o.status === 'ready').map(o => (
                    <div key={o.id} className="order-item">
                        {o.display_id}
                    </div>
                ))}
            </div>
        </div>

    )
}

export default OrdersState;