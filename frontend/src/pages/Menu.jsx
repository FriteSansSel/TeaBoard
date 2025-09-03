import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../utils/constants";
import CastButton from "../components/CastButton";
import "./Menu.css";
import { connectPrinter, disconnectPrinter, isPrinterConnected } from "../utils/printerService";

const Menu = () => {
    const navigate = useNavigate();
    const [connected, setConnected] = useState(isPrinterConnected());

    const checkConnection = async () => {
        setConnected(await isPrinterConnected());
    };

    // To refresh the connection status at the mount of the component
    useEffect(() => {
        const timer = setTimeout(() => {
            checkConnection();
        }, 1);

        return () => clearTimeout(timer);
    }, []);

    const handleConnect = async () => {
        try {
            await connectPrinter();
            checkConnection();
        } catch (err) {
            console.error(err);
            alert("❌ Connection error: " + err.message);
        }
    };

    const handleDisconnect = async () => {
        try {
            await disconnectPrinter();
            checkConnection();
        } catch (err) {
            console.error(err);
            alert("❌ Disconnection error: " + err.message);
        }
    };

    return (
        <div className="container">
            <h1 className="title">Bienvenue sur TeaBoard</h1>
            <CastButton />

            <button className="button" onClick={() => navigate(routes.orders)}>Commandes</button>
            <button className="button" onClick={() => window.open(routes.ordersstate)}>État des commandes</button>
            {/* <button className="button" onClick={() => navigate(routes.history)}>Historique</button> */}

            <div style={{ margin: "1rem 0", fontWeight: "bold" }}>
                Imprimante :{" "}
                {connected ? (
                    <span style={{ color: "green" }}>✅ Connectée</span>
                ) : (
                    <span style={{ color: "red" }}>❌ Déconnectée</span>
                )}
            </div>

            <button className="button" onClick={handleConnect}>Connecter imprimante</button>
            <button className="button" onClick={handleDisconnect}>Déconnecter imprimante</button>
        </div>
    );
};

export default Menu;
