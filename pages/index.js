import { useState, useEffect } from "react";
import "../styles/homepage.css";

export default function Home() {
  const [entryPrice, setEntryPrice] = useState("");
  const [profitTarget, setProfitTarget] = useState("");
  const [tradeAmount, setTradeAmount] = useState("");
  const [message, setMessage] = useState("");
  const [currentPrice, setCurrentPrice] = useState(null);
  const [logs, setLogs] = useState([]);

  const [btcBalance, setBtcBalance] = useState({ available: 0, locked: 0 });
  const [usdtBalance, setUsdtBalance] = useState({ available: 0, locked: 0 });

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const apiKey = localStorage.getItem("API_KEY");
        const secretKey = localStorage.getItem("SECRET_KEY");

        if (!apiKey || !secretKey) {
          console.warn("API veya Secret Key eksik!");
          return;
        }

        const res = await fetch("/api/price", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ apiKey, secretKey }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Fiyat alınamadı");
        }

        const data = await res.json();
        setCurrentPrice(data.currentPrice);
      } catch (err) {
        console.error("Fiyat alınamadı:", err.message);
        addLog("⚠️ Fiyat alınırken hata oluştu.");
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const apiKey = localStorage.getItem("API_KEY");
    const secretKey = localStorage.getItem("SECRET_KEY");

    if (!apiKey || !secretKey) {
      window.location.href = "/login"; // Eğer giriş yapılmamışsa login'e yönlendir
    }

    // API'ye bu key'lerle istek yapacaksan headers'a veya body'e ekle
  }, []);

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const apiKey = localStorage.getItem("API_KEY");
        const secretKey = localStorage.getItem("SECRET_KEY");

        if (!apiKey || !secretKey) {
          console.warn("API veya Secret Key eksik!");
          return;
        }

        const res = await fetch("/api/balance", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ apiKey, secretKey }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Bilinmeyen hata");
        }

        const data = await res.json();

        setBtcBalance(data.BTC);
        setUsdtBalance(data.USDT);
      } catch (error) {
        console.error("Balance fetch error:", error.message);
        addLog("⚠️ Bakiye alınırken hata oluştu.");
      }
    };

    fetchBalances();
    const interval = setInterval(fetchBalances, 30000);
    return () => clearInterval(interval);
  }, []);

  const addLog = (text) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prevLogs) => [`[${timestamp}] ${text}`, ...prevLogs]);
  };

  const startBot = async () => {
    setMessage("Bot başlatılıyor...");
    addLog("🚀 Bot başlatılıyor...");

    try {
      const apiKey = localStorage.getItem("API_KEY");
      const secretKey = localStorage.getItem("SECRET_KEY");

      if (!apiKey || !secretKey) {
        setMessage("API bilgileri eksik.");
        addLog("❌ API bilgileri bulunamadı.");
        return;
      }

      const res = await fetch("/api/start-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryPrice: parseFloat(entryPrice),
          profitTarget: parseFloat(profitTarget),
          tradeAmount: parseFloat(tradeAmount),
          apiKey,
          secretKey,
        }),
      });

      const data = await res.json();
      setMessage(data.message || "Bot çalışıyor...");

      // ✅ İşlem bilgisi varsa logla
      if (data.type === "buy" || data.type === "sell") {
        const emoji = data.type === "buy" ? "🟢 ALIM" : "🔴 SATIM";
        addLog(
          `${emoji} işlemi yapıldı → Fiyat: ${data.price} USDT, Miktar: ${data.amount} BTC`
        );
      }

      addLog(`✅ ${data.message || "Bot çalışıyor..."}`);
    } catch (err) {
      console.error(err);
      setMessage("Bir hata oluştu.");
      addLog("❌ Bot başlatılamadı.");
    }
  };

  return (
    <main className="container">
      <header className="header">
        <h1 className="header-title">🟢 Binance Al-Sat Bot</h1>
        <div className="header-price">
          Güncel BTC/USDT Fiyatı:
          <strong>
            {currentPrice ? `${currentPrice} USDT` : "Yükleniyor..."}
          </strong>
        </div>
      </header>

      <section className="main-grid">
        {/* Ayarlar */}
        <div className="card card-border-green">
          <h2>Ayarlar</h2>
          <div className="input-group">
            <label>🎯 Hedef Alış Fiyatı</label>
            <input
              type="number"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              placeholder="Örn: 60000"
            />
          </div>

          <div className="input-group">
            <label>📈 Kar Oranı (%)</label>
            <input
              type="number"
              value={profitTarget}
              onChange={(e) => setProfitTarget(e.target.value)}
              placeholder="Örn: 0.5"
              step="0.1"
            />
          </div>

          <div className="input-group">
            <label>💵 İşlem Miktarı (BTC)</label>
            <input
              type="number"
              value={tradeAmount}
              onChange={(e) => setTradeAmount(e.target.value)}
              placeholder="Örn: 0.0001"
              step="0.00001"
            />
            <p className="usd-value">
              💲 USD Karşılığı:{" "}
              <span>
                {tradeAmount && currentPrice
                  ? `${(parseFloat(tradeAmount) * currentPrice).toFixed(
                      2
                    )} USDT`
                  : "0.00 USDT"}
              </span>
            </p>
          </div>

          <button className="button-primary" onClick={startBot}>
            🚀 Botu Başlat
          </button>

          {message && <p className="message">{message}</p>}
        </div>

        {/* Bakiyeler */}
        <div className="card card-border-yellow">
          <h2>📊 Bakiyeleriniz</h2>
          <div className="balances-text">
            <p>
              <span>BTC:</span>{" "}
              {btcBalance && btcBalance.available ? btcBalance.available : 0}
            </p>
            <p>
              <span>USDT:</span>{" "}
              {usdtBalance && usdtBalance.available ? usdtBalance.available : 0}
            </p>
          </div>
        </div>

        {/* İşlem Geçmişi */}
        <div className="card card-border-purple">
          <h2>📜 İşlem Geçmişi</h2>
          <div className="logs-container">
            {logs.length === 0 ? (
              <p className="logs-empty">Henüz işlem yok.</p>
            ) : (
              <ul>
                {logs.map((log, idx) => (
                  <li key={idx}>{log}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
