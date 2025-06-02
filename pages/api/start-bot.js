import Binance from "node-binance-api";

let isBotRunning = false;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Yalnızca POST desteklenir." });
  }

  const { profitTarget, tradeAmount, entryPrice, apiKey, secretKey } = req.body;

  const logMessages = [];

  const log = (msg) => {
    console.log(msg);
    logMessages.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
  };

  if (!apiKey || !secretKey) {
    return res.status(400).json({ message: "API anahtarları eksik." });
  }

  const binance = new Binance().options({
    APIKEY: apiKey,
    APISECRET: secretKey,
  });

  if (isBotRunning) {
    log("⚠️ Bot zaten çalışıyor.");
    return res.status(400).json({
      message: "Bot zaten çalışıyor.",
      logs: logMessages,
    });
  }

  isBotRunning = true;
  log("🤖 Bot başlatıldı:");
  log(`🔹 Giriş fiyatı: ${entryPrice}`);
  log(`🔹 Kar hedefi: ${profitTarget}%`);
  log(`🔹 İşlem miktarı: ${tradeAmount} BTC`);

  res.status(200).json({
    message: "Bot çalışmaya başladı.",
    logs: logMessages,
  });

  // Döngü fonksiyonu
  async function tradeCycle(currentEntryPrice) {
    try {
      const targetSellPrice = currentEntryPrice * (1 + profitTarget / 100);
      log(`🎯 Hedef satış fiyatı: ${targetSellPrice.toFixed(2)}`);

      // Alış işlemi
      log(`⏳ ${currentEntryPrice} fiyatından satın alma işlemi yapılıyor...`);
      const buyResult = await binance.marketBuy("BTCUSDT", tradeAmount);
      log("✅ Satın alındı: " + JSON.stringify(buyResult));

      // Fiyatı düzenli kontrol et
      return new Promise((resolve) => {
        const interval = setInterval(async () => {
          try {
            const currentPrice = parseFloat(
              (await binance.prices("BTCUSDT")).BTCUSDT
            );
            log(`📈 Şu anki fiyat: ${currentPrice}`);

            if (currentPrice >= targetSellPrice) {
              clearInterval(interval);
              log(
                `💰 Hedefe ulaşıldı. ${currentPrice} fiyatından satış yapılıyor...`
              );
              const sellResult = await binance.marketSell(
                "BTCUSDT",
                tradeAmount
              );
              log("✅ Satış yapıldı: " + JSON.stringify(sellResult));

              const nextEntryPrice = currentPrice;
              log(
                "♻️ Döngü yeniden başlatılıyor, yeni giriş fiyatı: " +
                  nextEntryPrice
              );

              setTimeout(() => {
                tradeCycle(nextEntryPrice);
              }, 5000);

              resolve();
            }
          } catch (error) {
            log("📉 Fiyat kontrolü hatası: " + error.message);
          }
        }, 15000);
      });
    } catch (error) {
      log(
        "❌ Bot hatası: " +
          (error.body || error.message || JSON.stringify(error))
      );
      isBotRunning = false;
    }
  }

  tradeCycle(entryPrice);
}
