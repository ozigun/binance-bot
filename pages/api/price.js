import { Spot } from "@binance/connector";

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
    const client = new Spot(apiKey, secretKey);

    // BTCUSDT fiyatını al
    const { data } = await client.tickerPrice("BTCUSDT");

    const currentPrice = parseFloat(data.price);

    return res.status(200).json({ currentPrice });
  } catch (error) {
    console.error("Fiyat alınamadı:", error);
    return res.status(500).json({ error: "Fiyat alınamadı" });
  }
}
