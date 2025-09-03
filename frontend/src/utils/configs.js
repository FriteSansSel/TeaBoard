const PORT = import.meta.env.PORT || "8000";
const SERVER_DOMAIN = import.meta.env.SERVER_DOMAIN || "localhost";
const SERVER_PROTOCOL = import.meta.env.SERVER_PROTOCOL || "http";

export const SERVER_URL = SERVER_PROTOCOL + "://" + SERVER_DOMAIN + ":" + PORT;

export const RESTO_NAME = "Stella Café";
export const RESTO_ADDRESS = "13 Rue Saint-Lazare, 75009 Paris";