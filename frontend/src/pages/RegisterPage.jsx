import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({ nickname: "", email: "", password: "", confirm: "" });

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

  function submit(e) {
    e.preventDefault();
    if (!form.nickname || !form.email || !form.password) return alert("请填写所有必填项");
    if (form.password !== form.confirm) return alert("两次输入的密码不一致");
    if (form.password.length < 8) return alert("密码长度至少8位");
    alert(`注册成功！欢迎加入 CineMatch，${form.nickname}`);
    nav("/login");
  }

  return (
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
        <button className="btn btn-primary" style={{ width: "100%", marginTop: 8 }}>注册</button>
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", marginTop: 8 }}>已有账号？<Link to="/login" style={{ color: "var(--accent-gold)", textDecoration: "none" }}>立即登录</Link></p>
      </div>
    </form>
  );
}
