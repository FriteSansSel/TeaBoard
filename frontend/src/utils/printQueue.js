import { printTicket } from "./printTicket";

let queue = [];
let printing = false;

export const enqueuePrint = (order, item) => {
    return new Promise((resolve, reject) => {
        queue.push({ order, item, resolve, reject });
        processQueue();
    });
};

const processQueue = async () => {
    if (printing || queue.length === 0) return;

    printing = true;
    const { order, item, resolve, reject } = queue.shift();

    try {
        await printTicket(order, item);
        resolve();
    } catch (err) {
        reject(err);
    } finally {
        printing = false;
        setTimeout(processQueue, 500);
    }
};
