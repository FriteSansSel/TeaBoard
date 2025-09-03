import { getPrinterManager } from "./printerService";
import { RESTO_NAME, RESTO_ADDRESS } from "./configs";

export const printTicket = async (order, item) => {
    const manager = getPrinterManager();
    if (!manager) {
        alert("❌ Printer not connected, ticket ignored.");
        return;
    }

    try {
        await manager.setCodePage({ codePage: "1252" });
        await manager.setInternationalCharacter({ internationalCharacter: "usa" });

        const totalItems = order.items.length;
        const currentIndex = order.items.findIndex(i => i.id === item.id) + 1;

        let text = "";
        text += `${RESTO_NAME}\n`;
        text += `${RESTO_ADDRESS}\n`;
        text += "------------------------\n";
        text += `Commande N°: ${order.display_id}\n`;
        text += `Date: ${new Date(order.created_at).toLocaleString()}\n`;
        text += `Article: ${currentIndex}/${totalItems}\n`;
        text += "------------------------\n";
        text += `${item.name}   x${item.quantity || 1}\n`;

        if (item.modifiers?.length) {
            text += "Options:\n";
            item.modifiers.forEach(m => {
                text += "- " + m.name + "\n";
            });
        }

        text += "\n------------------------\nMerci pour votre commande !\n\n";

        let result = await manager.appendText({ text });
        if (result.errorCode !== 0) throw new Error("appendText: " + result.errorString);

        if (item.qrCode) {
            if (item.qrCode.startsWith("data:image")) {
                const res = await fetch(item.qrCode);
                const blob = await res.blob();
                result = await manager.appendImage({
                    format: "png",
                    data: blob,
                    alignment: "center",
                });
                if (result.errorCode !== 0) throw new Error("appendImage: " + result.errorString);
            } else {
                result = await manager.appendBarcode({
                    symbol: "qrCode",
                    text: item.qrCode,
                    model: 2,
                    errorCorrection: "h",
                    moduleSize: 4,
                    alignment: "center",
                });
                if (result.errorCode !== 0) throw new Error("appendBarcode: " + result.errorString);
            }
        }

        await manager.appendCut({ cuttingMethod: "partial" });

        result = await manager.doPrint({});
        if (result.errorCode !== 0) throw new Error("doPrint: " + result.errorString);

    } catch (err) {
        alert("❌ Print error: " + err.message);
        console.error("❌ Print error:", err);
    }
};
