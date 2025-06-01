import { useState } from "react";
import { useRouter } from "next/router";
import "../styles/globals.css";

export default function Login() {
  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
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
      </form>
    </div>
  );
}
