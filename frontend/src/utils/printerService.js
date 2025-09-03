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
        throw new Error("Start error: " + result.errorString);
    }

    console.log("✅ Printer connected");
    return printerManager;
};

export const disconnectPrinter = async () => {
    if (printerManager) {
        await printerManager.stop({});
        console.log("🔌 Printer disconnected");
        printerManager = null;
    }
};

export const getPrinterManager = () => printerManager;

export const isPrinterConnected = async () => {
    if (!printerManager) return false;

    const result = await printerManager.start({});
    return result.errorCode === 0;
};

