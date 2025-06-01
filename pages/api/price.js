// pages/api/price.js
import Binance from "node-binance-api";
import dotenv from "dotenv";
dotenv.config();

const binance = new Binance().options({
  APIKEY: process.env.BINANCE_API,
  APISECRET: process.env.BINANCE_SECRET,
});

export default async function handler(req, res) {
  try {
    const prices = await binance.prices("BTCUSDT");
    const currentPrice = parseFloat(prices.BTCUSDT);
    res.status(200).json({ currentPrice });
  } catch (error) {
    console.error("Fiyat alınamadı:", error);
    res.status(500).json({ error: "Fiyat alınamadı" });
  }
}
