import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import "../styles/login.module.css";

export default function Login() {
  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (apiKey.trim() === "" || secretKey.trim() === "") {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }

    localStorage.setItem("API_KEY", apiKey);
    localStorage.setItem("SECRET_KEY", secretKey);

    router.push("/");
  };

  useEffect(() => {
    async function fetchIP() {
      const hostname = window.location.hostname;
      try {
        const res = await fetch(
          `https://dns.google/resolve?name=${hostname}&type=A`
        );
        const data = await res.json();
        const ip = data.Answer?.find((ans) => ans.type === 1)?.data;
        if (ip) setIpAddress(ip);
      } catch (err) {
        console.error("IP alınamadı:", err);
      }
    }

    fetchIP();
  }, []);

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className="login-title">API Girişi</h2>
        <div>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="API Key"
            className="full-width-field"
          />
        </div>
        <div>
          <input
            type="password"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            placeholder="Secret Key"
            className="full-width-field"
          />
        </div>
        <button type="submit" className="full-width-field button-primary">
          Giriş Yap
        </button>
        <p style={{ marginTop: "1rem", textAlign: "center" }}>
          Yayın yapan IP: {ipAddress || "Yükleniyor..."}
        </p>
      </form>
    </div>
  );
}
