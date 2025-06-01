// api/balance.js
import Binance from "node-binance-api";
import { apiStore } from "./login";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    const binance = new Binance().options({
      APIKEY: process.env.BINANCE_API || apiStore.apiKey,
      APISECRET: process.env.BINANCE_SECRET || apiStore.secretKey,
    });

    const balances = await binance.balance();
    res.status(200).json(balances);
  } catch (error) {
    res.status(500).json({ error: "Balance alınamadı." });
  }
}
