import Binance from "node-binance-api";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ error: "Sadece POST isteklerine izin verilir." });
  }

  const { apiKey, secretKey } = req.body;

  if (!apiKey || !secretKey) {
    return res.status(400).json({ error: "API key ve Secret key gereklidir." });
  }

  try {
    const binance = new Binance().options({
      APIKEY: apiKey,
      APISECRET: secretKey,
    });

    const prices = await binance.prices("BTCUSDT");
    const currentPrice = parseFloat(prices.BTCUSDT);

    res.status(200).json({ currentPrice });
  } catch (error) {
    console.error("Fiyat alınamadı:", error);
    res.status(500).json({ error: "Fiyat alınamadı" });
  }
}
