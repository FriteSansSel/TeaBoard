let printerManager = null;

export const connectPrinter = async () => {
    if (!PrinterManager) {
        throw new Error("❌ SDK not loaded");
    }
    if (!printerManager) {
        printerManager = new PrinterManager({ host: "localhost", port: 26900 });
    }

    const result = await printerManager.start({});
    if (result.errorCode !== 0) {
        printerManager = null;
        alert("❌ Printer connection failed: " + result.errorString);
        throw new Error("Start error: " + result.errorString);
    }

    alert("✅ Printer connected");
    return printerManager;
};

export const disconnectPrinter = async () => {
    if (printerManager) {
        await printerManager.stop({});
        alert("🔌 Printer disconnected");
        printerManager = null;
    }
};

export const getPrinterManager = () => printerManager;

export const isPrinterConnected = async () => {
    if (!printerManager) return false;

    const result = await printerManager.start({});
    return result.errorCode === 0;
};

