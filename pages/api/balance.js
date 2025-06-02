export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const { apiKey, secretKey } = req.body;

  if (!apiKey || !secretKey) {
    return res.status(400).json({ error: "API key ve Secret key gerekli" });
  }

  // Binance API ile bakiye verisini al
  try {
    const Binance = require("node-binance-api");
    const binance = new Binance().options({
      APIKEY: apiKey,
      APISECRET: secretKey,
    });

    const accountInfo = await binance.balance();
    const BTC = accountInfo.BTC || "0";
    const USDT = accountInfo.USDT || "0";

    res.status(200).json({ BTC, USDT });
  } catch (err) {
    console.error("Binance API hatası:", err);
    res.status(500).json({ error: "Binance API hatası" });
  }
}
