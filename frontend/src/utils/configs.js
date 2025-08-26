const PORT = import.meta.env.PORT || "8000";
const SERVER_DOMAIN = import.meta.env.SERVER_DOMAIN || "localhost";

export const SERVER_URL = "http://" + SERVER_DOMAIN + ":" + PORT;