import React from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../utils/constants";
import CastButton from "../components/CastButton";
import "./Menu.css";

const Menu = () => {
  const navigate = useNavigate();

  const handleTestPrint = async () => {
    if (!PrinterManager) {
      alert("❌ SDK non chargé (siiWebSdk.js manquant)");
      return;
    }

    const printerManager = new PrinterManager({});

    try {
      // Connexion
      let result = await printerManager.start({});
      if (result.errorCode !== 0) {
        throw new Error("Erreur start: " + result.errorString);
      }

      // ⚙️ Config comme dans le sample
      await printerManager.setCodePage({ codePage: "1252" });
      await printerManager.setInternationalCharacter({ internationalCharacter: "usa" });

      // 🧾 Fake ticket
      let text = "";
      text += "\n";
      text += "⭐ TeaBoard ⭐\n";
      text += "Commande: TEST-001\n";
      text += "--------------------------------\n";
      text += "Thé Vert Matcha     1 x 4.50€\n";
      text += "Tapioca Fraise      2 x 5.00€\n";
      text += "--------------------------------\n";
      text += "TOTAL:              14.50€\n";
      text += "\nMerci pour votre commande 🍵\n\n";

      // 📝 Ajout du texte
      result = await printerManager.appendText({ text });
      if (result.errorCode !== 0) {
        throw new Error("appendText: " + result.errorString);
      }

      // 📦 Feed (avancer papier)
      await printerManager.appendFeed({ value: 0 });

      // 📱 QR Code (comme le sample)
      await printerManager.appendBarcode({
        symbol: "qrCode",
        text: "https://teaboard.example.com",
        model: 2,
        errorCorrection: "h",
        moduleSize: 4,
        alignment: "center",
      });

      // ✂️ Coupe
      await printerManager.appendCut({ cuttingMethod: "partial" });

      // 🚀 Envoi au printer
      result = await printerManager.doPrint({});
      if (result.errorCode !== 0) {
        throw new Error("Erreur doPrint: " + result.errorString);
      }

      console.log("✅ Impression terminée");
    } catch (err) {
      console.error("Erreur impression:", err);
    } finally {
      // Déconnexion
      await printerManager.stop({});
    }
  };

  return (
    <div className="container">
      <h1 className="title">Bienvenue sur TeaBoard</h1>
      <CastButton />
      <button className="button" onClick={() => navigate(routes.orders)}>
        Commandes
      </button>
      <button className="button" onClick={() => window.open(routes.ordersstate)}>
        État des commandes
      </button>
      <button className="button" onClick={() => navigate(routes.history)}>
        Historique
      </button>

      <button className="button" onClick={handleTestPrint}>
        🧪 Test impression (style sample Seiko)
      </button>
    </div>
  );
};

export default Menu;
