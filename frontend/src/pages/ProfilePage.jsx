import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import { movies, profileRatings, profileTags } from "../data/mockData";

export default function ProfilePage() {
  const favorites = movies.filter((m) => m.isFavorite);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("请先登录后查看个人中心");
      setLoading(false);
      return;
    }
    fetch("/api/me/profile", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setProfile(data))
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

  return (
    <>
      <div style={{ padding: "40px 0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-crimson), #8e2de2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700 }}>{initial}</div>
          <div><h1 style={{ fontSize: 32 }}>{nickname}</h1><p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>加入于 {joinAt} · 电影爱好者</p></div>
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
        <div>{profileRatings.map((pr) => { const m = movies.find((x) => x.id === pr.movieId); if (!m) return null; return <div key={pr.movieId} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderBottom: "1px solid var(--border-subtle)" }}><Link to={`/movies/${m.id}`}><img src={m.poster} style={{ width: 48, height: 72, objectFit: "cover", borderRadius: "var(--radius-sm)" }} alt={m.title} /></Link><div style={{ flex: 1 }}><Link to={`/movies/${m.id}`} style={{ fontWeight: 600, color: "var(--text-primary)", textDecoration: "none" }}>{m.title}</Link><div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{m.year} · {m.genres.join("/")}</div></div><div style={{ textAlign: "right" }}><div style={{ color: "var(--accent-gold)", fontSize: 16 }}>{"★".repeat(pr.rating)}{"☆".repeat(5 - pr.rating)}</div><div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{pr.date}</div></div></div>; })}</div>
      </div>

      <div style={{ marginTop: 48 }}><div className="section-header"><h2 className="section-title" style={{ fontSize: 22 }}>我的收藏</h2></div><div className="movie-grid">{favorites.map((m) => <MovieCard key={m.id} movie={m} />)}</div></div>
      <div style={{ marginTop: 48 }}><div className="section-header"><h2 className="section-title" style={{ fontSize: 22 }}>偏好标签</h2></div><div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{profileTags.map((t) => <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "var(--bg-elevated)", borderRadius: 20, border: "1px solid var(--border-subtle)" }}><span style={{ fontSize: 14, fontWeight: 500 }}>{t.name}</span><span style={{ fontSize: 12, color: "var(--text-muted)" }}>{t.count}部</span></div>)}</div></div>
    </>
  );
}
