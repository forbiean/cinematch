import { Link } from "react-router-dom";
import { movies, recommendations } from "../data/mockData";

export default function RecommendationsPage() {
  return (
    <>
      <div style={{ padding: "40px 0 24px" }}><h1 className="section-title">个性化推荐</h1><p className="section-sub">基于你的评分与收藏，为你精选的影片</p></div>
      <div style={{ background: "var(--accent-crimson-soft)", border: "1px solid rgba(192,57,43,0.2)", borderRadius: "var(--radius-md)", padding: "20px 24px", marginBottom: 32, display: "flex", alignItems: "center", gap: 16 }}>
        <div><div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>推荐策略：标签偏好 + 热门加权</div><div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>你近期给高分的科幻与剧情标签影片较多，已优先匹配同类内容。</div></div>
      </div>
      <div>{recommendations.map((rec) => { const movie = movies.find((m) => m.id === rec.movieId); if (!movie) return null; const stars = "★".repeat(Math.floor(movie.rating / 2)) + "☆".repeat(5 - Math.floor(movie.rating / 2)); return (
        <Link key={movie.id} to={`/movies/${movie.id}`} className="card" style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 24, padding: 20, marginBottom: 16, cursor: "pointer", textDecoration: "none", color: "inherit" }}>
          <div style={{ borderRadius: "var(--radius-sm)", overflow: "hidden", aspectRatio: "2/3" }}><img src={movie.poster} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={movie.title} /></div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}><h3 style={{ fontSize: 20 }}>{movie.title}</h3><span className="tag-pill" style={{ background: "var(--accent-gold)", color: "#0a0e17", borderColor: "var(--accent-gold)", fontWeight: 600 }}>匹配度 {(rec.score * 100).toFixed(0)}%</span></div>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 12, lineHeight: 1.6 }}>{movie.summary.substring(0, 80)}...</p>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}><span style={{ fontSize: 13, color: "var(--accent-gold)" }}>{stars} {movie.rating}</span><span style={{ fontSize: 13, color: "var(--text-muted)" }}>{movie.year}</span><span style={{ fontSize: 13, color: "var(--text-muted)" }}>{movie.genres.join(" / ")}</span></div>
            <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--accent-crimson-soft)", borderRadius: "var(--radius-sm)", borderLeft: "3px solid var(--accent-crimson)" }}><span style={{ fontSize: 13, color: "var(--text-secondary)" }}>推荐理由：{rec.reason}</span></div>
          </div>
        </Link>
      ); })}</div>
    </>
  );
}
