import Binance from "node-binance-api";
import dotenv from "dotenv";
dotenv.config();

const binance = new Binance().options({
  APIKEY: process.env.BINANCE_API,
  APISECRET: process.env.BINANCE_SECRET,
});

let isBotRunning = false;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Yalnızca POST desteklenir." });
  }

  const { profitTarget, tradeAmount, entryPrice } = req.body;
  const logMessages = [];

  const log = (msg) => {
    console.log(msg);
    logMessages.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
  };

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

  // API cevabı hemen dönüyor, döngü arka planda devam edecek
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

              // Bir sonraki alış için döngüyü başlat
              // Burada yeni giriş fiyatı için güncelleme yapabilirsin (örneğin satılan fiyat veya başka bir strateji)
              // Şu an örnek olarak, satılan fiyat ile tekrar alıyor
              const nextEntryPrice = currentPrice;
              log(
                "♻️ Döngü yeniden başlatılıyor, yeni giriş fiyatı: " +
                  nextEntryPrice
              );
              // 5 saniye bekleyip tekrar başlat (isteğe bağlı)
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

  // İlk alış-satış döngüsünü başlat
  tradeCycle(entryPrice);
}
