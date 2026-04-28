import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { parseApiError } from "../utils/api";

export default function RegisterPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({ nickname: "", email: "", password: "", confirm: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

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

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.nickname || !form.email || !form.password) return setError("请填写所有必填项");
    if (form.password !== form.confirm) return setError("两次输入的密码不一致");
    if (form.password.length < 8) return setError("密码长度至少8位");
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: form.nickname.trim(),
          email: form.email.trim(),
          password: form.password
        })
      });
      if (!res.ok) {
        if (res.status === 409) throw new Error(await parseApiError(res, "该邮箱已注册"));
        throw new Error(await parseApiError(res, "注册失败，请稍后重试"));
      }
      setShowSuccess(true);
    } catch (err) {
      setError(err.message || "注册失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form onSubmit={submit} style={{ maxWidth: 400, margin: "60px auto", padding: 40, background: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div className="brand-mark" style={{ margin: "0 auto 16px", width: 48, height: 48, fontSize: 24 }}>C</div>
          <h2 style={{ fontSize: 24 }}>创建账号</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 8 }}>加入 CineMatch，开启个性化电影推荐</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div><label style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>昵称</label><input placeholder="你的昵称" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} style={inputStyle} /></div>
          <div><label style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>邮箱</label><input type="email" placeholder="name@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} /></div>
          <div><label style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>密码</label><input type="password" placeholder="至少8位字符" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={inputStyle} /></div>
          <div><label style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>确认密码</label><input type="password" placeholder="再次输入密码" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} style={inputStyle} /></div>
          {error ? <p style={{ color: "#fca5a5", fontSize: 13 }}>{error}</p> : null}
          <button className="btn btn-primary" disabled={submitting} style={{ width: "100%", marginTop: 8 }}>{submitting ? "注册中..." : "注册"}</button>
          <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", marginTop: 8 }}>已有账号？<Link to="/login" style={{ color: "var(--accent-gold)", textDecoration: "none" }}>立即登录</Link></p>
        </div>
      </form>
      {showSuccess ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(8, 10, 20, 0.72)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99, padding: 20 }}>
          <div style={{ width: "min(460px, 100%)", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "28px 24px", textAlign: "center", boxShadow: "0 24px 80px rgba(0, 0, 0, 0.45)" }}>
            <div className="brand-mark" style={{ margin: "0 auto 14px", width: 44, height: 44, fontSize: 22 }}>✓</div>
            <h3 style={{ fontSize: 24 }}>注册成功</h3>
            <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>欢迎加入 CineMatch，{form.nickname}。</p>
            <button type="button" className="btn btn-primary" style={{ marginTop: 20, minWidth: 180 }} onClick={() => nav("/login")}>前往登录</button>
          </div>
        </div>
      ) : null}
    </>
  );
}
