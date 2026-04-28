import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function RecommendationsPage() {
  const [items, setItems] = useState([]);
  const [strategy, setStrategy] = useState("标签偏好 + 热门加权");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("请先登录后查看推荐");
      setLoading(false);
      return;
    }
    fetch("/api/recommendations", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setItems(Array.isArray(data?.items) ? data.items : []);
        if (data?.strategy) setStrategy(data.strategy);
      })
      .catch(() => setError("加载推荐失败，请稍后重试"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div style={{ padding: "40px 0 24px" }}><h1 className="section-title">个性化推荐</h1><p className="section-sub">基于你的评分与收藏，为你精选的影片</p></div>
      <div style={{ background: "var(--accent-crimson-soft)", border: "1px solid rgba(192,57,43,0.2)", borderRadius: "var(--radius-md)", padding: "20px 24px", marginBottom: 32, display: "flex", alignItems: "center", gap: 16 }}>
        <div><div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>推荐策略：{strategy}</div><div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>优先基于你的行为偏好推荐，并自动过滤已评分和已收藏影片。</div></div>
      </div>
      {loading ? <div style={{ color: "var(--text-secondary)" }}>正在加载推荐...</div> : null}
      {error ? <div style={{ color: "#fca5a5" }}>{error}</div> : null}
      {!loading && !error && items.length === 0 ? <div style={{ color: "var(--text-secondary)" }}>可推荐内容不足。请先评分或收藏更多电影后再试。</div> : null}
      <div>{items.map((movie) => { const score = Number(movie.score || 0); const stars = "★".repeat(Math.floor(Number(movie.rating || 0) / 2)) + "☆".repeat(5 - Math.floor(Number(movie.rating || 0) / 2)); return (
        <Link key={movie.id} to={`/movies/${movie.id}`} className="card" style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 24, padding: 20, marginBottom: 16, cursor: "pointer", textDecoration: "none", color: "inherit" }}>
          <div style={{ borderRadius: "var(--radius-sm)", overflow: "hidden", aspectRatio: "2/3" }}><img src={movie.poster} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={movie.title} /></div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}><h3 style={{ fontSize: 20 }}>{movie.title}</h3><span className="tag-pill" style={{ background: "var(--accent-gold)", color: "#0a0e17", borderColor: "var(--accent-gold)", fontWeight: 600 }}>匹配度 {(score * 100).toFixed(0)}%</span></div>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 12, lineHeight: 1.6 }}>{(movie.summary || "").substring(0, 80)}...</p>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}><span style={{ fontSize: 13, color: "var(--accent-gold)" }}>{stars} {movie.rating}</span><span style={{ fontSize: 13, color: "var(--text-muted)" }}>{movie.year}</span><span style={{ fontSize: 13, color: "var(--text-muted)" }}>{(movie.genres || []).join(" / ")}</span></div>
            <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--accent-crimson-soft)", borderRadius: "var(--radius-sm)", borderLeft: "3px solid var(--accent-crimson)" }}><span style={{ fontSize: 13, color: "var(--text-secondary)" }}>推荐理由：{movie.reason}</span></div>
          </div>
        </Link>
      ); })}</div>
    </>
  );
}
