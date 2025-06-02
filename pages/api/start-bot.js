import { Spot } from "@binance/connector";

export default async function handler(req, res) {
  const { apiKey, secretKey, entryPrice, profitTarget, tradeAmount } = req.body;

  if (!apiKey || !secretKey) {
    return res.status(400).json({ error: "API Key ve Secret Key gerekli" });
  }

  try {
    const client = new Spot(apiKey, secretKey);

    // Basit piyasa alım örneği
    const order = await client.newOrder("BTCUSDT", "BUY", "MARKET", {
      quantity: tradeAmount,
    });

    return res.status(200).json({
      message: "Alım işlemi başarıyla gerçekleştirildi.",
      type: "buy",
      price: order.data.fills?.[0]?.price,
      amount: tradeAmount,
    });
  } catch (err) {
    console.error("Emir gönderilemedi:", err);
    return res.status(500).json({ error: "İşlem hatası: " + err.message });
  }
}
