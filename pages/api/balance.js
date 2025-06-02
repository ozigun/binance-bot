import { Spot } from "@binance/connector";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ error: "Sadece POST istekleri kabul edilir" });
  }

  const { apiKey, secretKey } = req.body;

  if (!apiKey || !secretKey) {
    return res.status(400).json({ error: "API Key ve Secret Key gerekli" });
  }

  try {
    const client = new Spot(apiKey, secretKey);

    const accountInfo = await client.account();

    const balances = accountInfo.data.balances;

    const btc = balances.find((b) => b.asset === "BTC");
    const usdt = balances.find((b) => b.asset === "USDT");

    res.status(200).json({
      BTC: { available: btc?.free || "0", locked: btc?.locked || "0" },
      USDT: { available: usdt?.free || "0", locked: usdt?.locked || "0" },
    });
  } catch (err) {
    console.error("Binance Hatası:", err);
    res.status(500).json({ error: "Binance API hatası: " + err.message });
  }
}
