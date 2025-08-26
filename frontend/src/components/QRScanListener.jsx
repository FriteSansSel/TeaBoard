import React, { useEffect, useState } from 'react';
import { useOrders } from '../context/OrdersContext';

const QRScanListener = () => {
    const { closeItemByQRCode } = useOrders();
    const [qrCode, setQrCode] = useState('');

    useEffect(() => {
        let timeout;

        const handleQRCodeScan = (e) => {
            if (e.key === 'Enter') {
                try {
                    console.log('QR Code scanned:', qrCode);
                    const [orderId, itemId] = qrCode.split('/');
                    if (orderId && itemId) {
                        closeItemByQRCode({orderId: parseInt(orderId), itemId: parseInt(itemId)});
                    } else {
                        console.error('Invalid QR Code data:', qrData);
                    }
                } catch (error) {
                    console.error('Error parsing QR Code:', error);
                }
                setQrCode('');
            } else if (e.key.length === 1) {
                setQrCode(prev => prev + e.key);
                clearTimeout(timeout);
                timeout = setTimeout(() => {setQrCode('');}, 1000);
            }
        };

        window.addEventListener('keydown', handleQRCodeScan);

        return () => {
            window.removeEventListener('keydown', handleQRCodeScan);
        };
    }, [qrCode, closeItemByQRCode]);

    return null;
}

export default QRScanListener;