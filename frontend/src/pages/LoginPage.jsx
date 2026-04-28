import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text-primary)",
    fontFamily: "inherit",
    fontSize: 14,
    outline: "none"
  };

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("请输入邮箱和密码");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password })
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("邮箱或密码错误");
        throw new Error("登录失败，请稍后重试");
      }
      const data = await res.json();
      localStorage.setItem("token", data.token || "");
      localStorage.setItem("tokenType", data.tokenType || "Bearer");
      localStorage.setItem("userEmail", data.email || email.trim());
      nav("/");
    } catch (err) {
      setError(err.message || "登录失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 400, margin: "80px auto", padding: 40, background: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div className="brand-mark" style={{ margin: "0 auto 16px", width: 48, height: 48, fontSize: 24 }}>C</div>
        <h2 style={{ fontSize: 24 }}>欢迎回来</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 8 }}>登录以同步你的评分和收藏</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>邮箱</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>密码</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
        </div>
        {error ? <p style={{ color: "#fca5a5", fontSize: 13 }}>{error}</p> : null}
        <button className="btn btn-primary" disabled={submitting} style={{ width: "100%", marginTop: 8 }}>{submitting ? "登录中..." : "登录"}</button>
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", marginTop: 8 }}>还没有账号？<Link to="/register" style={{ color: "var(--accent-gold)", textDecoration: "none" }}>立即注册</Link></p>
      </div>
    </form>
  );
}
