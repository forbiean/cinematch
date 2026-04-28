import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";

export default function ProfilePage() {
  const nav = useNavigate();
  const [profile, setProfile] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({ nickname: "", password: "", confirm: "" });
  const [editError, setEditError] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("请先登录后查看个人中心");
      setLoading(false);
      return;
    }
    Promise.all([
      fetch("/api/me/profile", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/me/ratings", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/me/favorites", { headers: { Authorization: `Bearer ${token}` } })
    ])
      .then(async ([profileRes, ratingsRes, favoritesRes]) => {
        if (!profileRes.ok || !ratingsRes.ok || !favoritesRes.ok) {
          throw new Error("load failed");
        }
        const [profileData, ratingsData, favoritesData] = await Promise.all([
          profileRes.json(),
          ratingsRes.json(),
          favoritesRes.json()
        ]);
        setProfile(profileData);
        setRatings(Array.isArray(ratingsData) ? ratingsData : []);
        setFavorites(Array.isArray(favoritesData) ? favoritesData : []);
      })
      .catch(() => setError("加载个人信息失败，请重新登录后重试"))
      .finally(() => setLoading(false));
  }, []);

  const initial = (profile?.nickname || "U").slice(0, 1).toUpperCase();
  const nickname = profile?.nickname || "用户";
  const joinAt = profile?.joinAt || "未知时间";
  const ratedCount = profile?.ratedCount ?? 0;
  const favoriteCount = profile?.favoriteCount ?? 0;
  const avgScore = profile?.avgScore ?? 0;
  const favoriteGenre = profile?.favoriteGenre || "暂无";

  function openEditProfile() {
    setEditError("");
    setEditForm({ nickname: nickname || "", password: "", confirm: "" });
    setShowEditProfile(true);
  }

  function submitEditProfile(e) {
    e.preventDefault();
    setEditError("");
    if (!editForm.nickname.trim()) {
      setEditError("昵称不能为空");
      return;
    }
    if (editForm.password && editForm.password.length < 8) {
      setEditError("新密码长度至少8位");
      return;
    }
    if (editForm.password !== editForm.confirm) {
      setEditError("两次输入的新密码不一致");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setEditError("登录状态已失效，请重新登录");
      return;
    }
    setEditSaving(true);
    fetch("/api/me/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        nickname: editForm.nickname.trim(),
        password: editForm.password || ""
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error("保存失败，请稍后重试");
        return res.json();
      })
      .then(() => {
        setProfile((old) => (old ? { ...old, nickname: editForm.nickname.trim() } : old));
        setShowEditProfile(false);
      })
      .catch((err) => setEditError(err.message || "保存失败，请稍后重试"))
      .finally(() => setEditSaving(false));
  }

  function onLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenType");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    window.dispatchEvent(new Event("auth-changed"));
    nav("/login");
  }

  return (
    <>
      <div style={{ padding: "40px 0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-crimson), #8e2de2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700 }}>{initial}</div>
          <div><h1 style={{ fontSize: 32 }}>{nickname}</h1><p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>加入于 {joinAt} · 电影爱好者</p></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={openEditProfile}>修改资料</button>
            <button type="button" className="btn btn-ghost" onClick={onLogout}>退出登录</button>
          </div>
        </div>
      </div>
      {loading ? <div style={{ color: "var(--text-secondary)", marginBottom: 20 }}>正在加载个人信息...</div> : null}
      {error ? <div style={{ color: "#fca5a5", marginBottom: 20 }}>{error}</div> : null}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16, margin: "32px 0" }}>
        <div className="card" style={{ padding: 20, textAlign: "center" }}><div style={{ fontSize: 28, fontWeight: 700, color: "var(--accent-gold)" }}>{ratedCount}</div><div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>已评分</div></div>
        <div className="card" style={{ padding: 20, textAlign: "center" }}><div style={{ fontSize: 28, fontWeight: 700, color: "var(--accent-gold)" }}>{favoriteCount}</div><div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>收藏</div></div>
        <div className="card" style={{ padding: 20, textAlign: "center" }}><div style={{ fontSize: 28, fontWeight: 700, color: "var(--accent-gold)" }}>{avgScore}</div><div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>平均评分</div></div>
        <div className="card" style={{ padding: 20, textAlign: "center" }}><div style={{ fontSize: 28, fontWeight: 700, color: "var(--accent-gold)" }}>{favoriteGenre}</div><div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>最爱类型</div></div>
      </div>

      <div style={{ marginTop: 48 }}><div className="section-header"><h2 className="section-title" style={{ fontSize: 22 }}>我的评分</h2></div>
        <div>{ratings.map((item) => <div key={item.movieId} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderBottom: "1px solid var(--border-subtle)" }}><Link to={`/movies/${item.movieId}`}><img src={item.poster} style={{ width: 48, height: 72, objectFit: "cover", borderRadius: "var(--radius-sm)" }} alt={item.title} /></Link><div style={{ flex: 1 }}><Link to={`/movies/${item.movieId}`} style={{ fontWeight: 600, color: "var(--text-primary)", textDecoration: "none" }}>{item.title}</Link><div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{item.year}</div></div><div style={{ textAlign: "right" }}><div style={{ color: "var(--accent-gold)", fontSize: 16 }}>{"★".repeat(item.score)}{"☆".repeat(5 - item.score)}</div><div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{item.date}</div></div></div>)}</div>
      </div>

      <div style={{ marginTop: 48 }}><div className="section-header"><h2 className="section-title" style={{ fontSize: 22 }}>我的收藏</h2></div><div className="movie-grid">{favorites.map((m) => <MovieCard key={m.id} movie={m} />)}</div></div>
      {ratings.length === 0 && favorites.length === 0 ? <div style={{ marginTop: 24, color: "var(--text-secondary)" }}>你还没有评分或收藏任何电影，去电影页试试看。</div> : null}
      {showEditProfile ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(8, 10, 20, 0.72)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99, padding: 20 }}>
          <form onSubmit={submitEditProfile} style={{ width: "min(500px, 100%)", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "24px 22px", boxShadow: "0 24px 80px rgba(0, 0, 0, 0.45)" }}>
            <h3 style={{ fontSize: 22 }}>修改用户资料</h3>
            <div style={{ marginTop: 14 }}>
              <label style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>昵称</label>
              <input value={editForm.nickname} onChange={(e) => setEditForm((old) => ({ ...old, nickname: e.target.value }))} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "var(--text-primary)" }} />
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>新密码（可选）</label>
              <input type="password" value={editForm.password} onChange={(e) => setEditForm((old) => ({ ...old, password: e.target.value }))} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "var(--text-primary)" }} />
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>确认新密码</label>
              <input type="password" value={editForm.confirm} onChange={(e) => setEditForm((old) => ({ ...old, confirm: e.target.value }))} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "var(--text-primary)" }} />
            </div>
            {editError ? <div style={{ color: "#fca5a5", marginTop: 10, fontSize: 13 }}>{editError}</div> : null}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowEditProfile(false)} disabled={editSaving}>取消</button>
              <button type="submit" className="btn btn-primary" disabled={editSaving}>{editSaving ? "保存中..." : "保存修改"}</button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
