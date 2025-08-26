import dotenv from 'dotenv';
dotenv.config();

const VERSION = process.env.VERSION || "2.10";

export const PORT = process.env.PORT || 8000;

export const ZELTY_API = "https://api.zelty.fr/" + VERSION;

export const API_KEY = process.env.API_KEY || null;