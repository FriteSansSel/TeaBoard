import React from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '../utils/constants';
import CastButton from '../components/CastButton';
import './Menu.css';
import { jsPDF } from 'jspdf';

const Menu = () => {
    const navigate = useNavigate();

    const handleTestPrint = () => {
        const fakeOrder = {
            id: 'test-order-001',
            display_id: 'TEST-001',
            created_at: new Date().toISOString(),
            items: [
                {
                    id: 'item-1',
                    name: 'Thé Vert Matcha',
                    quantity: 1,
                    price: 4.5,
                    options: [{ name: 'Sucre' }, { name: 'Lait d\'amande' }],
                    qr_code: null, // tu peux ajouter une image base64 si besoin
                },
                {
                    id: 'item-2',
                    name: 'Tapioca Fraise',
                    quantity: 2,
                    price: 5.0,
                    options: [],
                    qr_code: null,
                }
            ]
        };

        fakeOrder.items.forEach(item => {
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [56, 90]
            });

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.text(`ARTICLE #${item.id}`, 40, 10, { align: 'center' });

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(`Commande: ${fakeOrder.display_id}`, 40, 16, { align: 'center' });

            const date = new Date(fakeOrder.created_at);
            doc.text(date.toLocaleDateString(), 40, 22, { align: 'center' });
            doc.text(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 40, 26, { align: 'center' });

            doc.setDrawColor(0);
            doc.line(10, 30, 70, 30);

            let yPosition = 38;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text(item.name, 40, yPosition, { align: 'center' });
            yPosition += 8;

            doc.setFontSize(10);
            doc.text(`Quantité: ${item.quantity}`, 15, yPosition);
            doc.text(`Prix: ${item.price.toFixed(2)}€`, 65, yPosition, { align: 'right' });
            yPosition += 8;

            if (item.options?.length > 0) {
                doc.setFont('helvetica', 'normal');
                doc.text('Options:', 15, yPosition);
                yPosition += 5;

                doc.setFontSize(8);
                item.options.forEach(option => {
                    doc.text(`• ${option.name}`, 20, yPosition);
                    yPosition += 4;
                });
                doc.setFontSize(10);
                yPosition += 2;
            }

            // Si un QR code est disponible
            if (item.qr_code) {
                try {
                    const size = 40;
                    doc.addImage(item.qr_code, 'PNG', (80 - size) / 2, yPosition, size, size);
                    yPosition += size + 10;
                } catch (err) {
                    console.error("Erreur QR code :", err);
                }
            }

            const blob = doc.output('blob');
            const url = URL.createObjectURL(blob);
            const win = window.open(url);
            win.onload = () => win.print();
        });
    };

    return (
        <div className="container">
            <h1 className="title">Bienvenue sur TeaBoard</h1>
            <CastButton />
            <button className="button" onClick={() => navigate(routes.orders)}>Commandes</button>
            <button className="button" onClick={() => window.open(routes.ordersstate)}>État des commandes</button>
            <button className="button" onClick={() => navigate(routes.history)}>Historique</button>
            
            <button className="button" onClick={handleTestPrint}>
                🧪 Test impression
            </button>
        </div>
    );
};

export default Menu;
