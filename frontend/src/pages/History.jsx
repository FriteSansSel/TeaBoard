import React, { useEffect, useState } from 'react';
import BackButton from '../components/BackButton';
import { fetchOrders } from '../API/OrdersAPI';
import './History.css';

const History = () => {
    const [history, setHistory] = useState([]);

    const params = new URLSearchParams({
        noz: 'true',
        expand: 'items',
    });

    useEffect(() => {
        const getHistory = async () => {
            const ordersHistory = await fetchOrders(params.toString());
            console.log('Orders History:', ordersHistory);
            setHistory(ordersHistory);
        }

        getHistory();
        const interval = setInterval(getHistory, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="history-container">
            <BackButton />
            {history.map(o => (
                <div key={o.id} className="history-card">
                    <div className="history-header">
                        Commande#{o.display_id}
                    </div>

                    <ul className="history-items">
                        {o.items.map((item) => (
                            <li key={item.id} className="history-item">
                                {item.name}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    )
}

export default History;