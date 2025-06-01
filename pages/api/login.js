let apiStore = { apiKey: "", secretKey: "" }; // Geçici bellek – sadece demo

import Binance from "node-binance-api";

export async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { apiKey, secretKey } = req.body;

  try {
    const binance = new Binance().options({
      APIKEY: apiKey,
      APISECRET: secretKey,
    });
    await binance.balance(); // test amaçlı istek
    apiStore = { apiKey, secretKey }; // key’leri sadece backend'de tut

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(401).json({ error: "API Key doğrulanamadı." });
  }
}

export { apiStore };
