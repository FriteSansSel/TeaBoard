import React, { useState, useEffect } from 'react';
import { useOrders } from '../context/OrdersContext';
import { jsPDF } from 'jspdf';

const PrintTicket = ({ orderId }) => {
    const { orders } = useOrders();
    const order = orders.find(o => o.id === orderId);
    const [printedItems, setPrintedItems] = useState(() => {
        const saved = localStorage.getItem('printedItems');
        
        if (saved) {
            try {
                const savedItems = JSON.parse(saved);

                const today = new Date().toISOString().split('T')[0];

                const validItems = savedItems.filter(item => {
                    const itemDate = new Date(item.printedAt).toISOString().split('T')[0];
                    return itemDate === today;
                });

                if (validItems.length !== savedItems.length) {
                    localStorage.setItem('printedItems', JSON.stringify(validItems));
                }
                
                return validItems;
            } catch (error) {
                console.error('Error parsing saved items:', error);
                localStorage.removeItem('printedItems');
            }
        }
        return [];
    });

    useEffect(() => {
        localStorage.setItem('printedItems', JSON.stringify(printedItems));
    }, [printedItems]);

    const printItemTicket = (item) => {
        if (!item || printedItems.some(printed => printed.itemId === item.id && printed.orderId === orderId)) {
            console.log('Article déjà imprimé');
            return;
        }

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
        doc.text(`Commande: ${order.display_id || order.id}`, 40, 16, { align: 'center' });
        
        const orderDate = new Date(order.created_at);
        doc.text(orderDate.toLocaleDateString(), 40, 22, { align: 'center' });
        doc.text(orderDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 40, 26, { align: 'center' });

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

        if (item.options && item.options.length > 0) {
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

        if (item.qr_code) {
            try {
                const qrCodeSize = 40;
                const qrCodeX = (80 - qrCodeSize) / 2;
                
                doc.addImage({
                    imageData: item.qr_code,
                    x: qrCodeX,
                    y: yPosition,
                    width: qrCodeSize,
                    height: qrCodeSize
                });
                
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                yPosition += qrCodeSize + 10;
            } catch (error) {
                console.error('Erreur avec le QR code de l\'article:', error);
            }
        }

        doc.setFontSize(8);

        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        const printWindow = window.open(pdfUrl);
        printWindow.onload = () => {
            printWindow.print();
            setPrintedItems(prev => [
                ...prev, 
                {
                    orderId,
                    itemId: item.id,
                    printedAt: new Date().toISOString()
                }
            ]);
        };
    };

    const handlePrintAllItems = () => {
        if (!order || !order.items) return;
        
        order.items.forEach(item => {
            if (!printedItems.some(printed => printed.itemId === item.id && printed.orderId === orderId)) {
                printItemTicket(item);
            }
        });
    };

    const isAllItemsPrinted = order?.items?.every(item => 
        printedItems.some(printed => printed.itemId === item.id && printed.orderId === orderId)
    );

    return (
        <div style={{ display: 'flex', gap: '10px' }}>
            <button 
                onClick={handlePrintAllItems}
                disabled={isAllItemsPrinted}
                style={{
                    padding: '8px 15px',
                    backgroundColor: isAllItemsPrinted ? '#cccccc' : '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isAllItemsPrinted ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                }}
            >
                {isAllItemsPrinted ? 'Tous imprimés' : 'Imprimer tous les articles'}
            </button>

            {order?.items?.map(item => {
                const isItemPrinted = printedItems.some(
                    printed => printed.itemId === item.id && printed.orderId === orderId
                );
                
                return (
                    <button
                        key={item.id}
                        onClick={() => printItemTicket(item)}
                        disabled={isItemPrinted}
                        style={{
                            padding: '6px 10px',
                            backgroundColor: isItemPrinted ? '#e0e0e0' : '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isItemPrinted ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            margin: '2px'
                        }}
                    >
                        {isItemPrinted ? `✓ ${item.name}` : `Imprimer ${item.name}`}
                    </button>
                );
            })}
        </div>
    );
};

export default PrintTicket;