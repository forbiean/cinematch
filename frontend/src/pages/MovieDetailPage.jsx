import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MovieCard from "../components/MovieCard";

export default function MovieDetailPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [savedText, setSavedText] = useState("");
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetch(`/api/movies/${id}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setMovie(data);
        setRating(data.userRating || 0);
        setFavorite(Boolean(data.isFavorite));
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError("加载电影详情失败，请稍后重试");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [id]);

  function rateMovie(n) {
    setRating(n);
    setSavedText("评分已保存");
    setTimeout(() => setSavedText(""), 1500);
  }

  if (loading) {
    return <div style={{ padding: "40px 0", color: "var(--text-secondary)" }}>正在加载...</div>;
  }

  if (error || !movie) {
    return <div style={{ padding: "40px 0", color: "#fca5a5" }}>{error || "电影不存在"}</div>;
  }

  const similar = Array.isArray(movie.similar) ? movie.similar : [];

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 40, padding: "40px 0" }}>
        <div>
          <div style={{ borderRadius: "var(--radius-md)", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}><img src={movie.poster} alt={movie.title} style={{ width: "100%", display: "block" }} /></div>
          <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
            <button className="btn btn-primary" style={{ flex: 1, background: favorite ? "var(--accent-crimson)" : undefined, borderColor: favorite ? "var(--accent-crimson)" : undefined }} onClick={() => setFavorite((v) => !v)}>{favorite ? "已收藏" : "收藏"}</button>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => alert("分享链接已复制到剪贴板")}>分享</button>
          </div>
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
            <div><h1 style={{ fontSize: 42, lineHeight: 1.1 }}>{movie.title}</h1><p style={{ fontSize: 16, color: "var(--text-secondary)", marginTop: 8, fontStyle: "italic", fontFamily: "'Playfair Display', serif" }}>{movie.originalTitle || movie.title} · {movie.year}</p></div>
            <div style={{ textAlign: "center", flexShrink: 0 }}><div style={{ fontSize: 42, fontWeight: 700, color: "var(--accent-gold)", fontFamily: "'Playfair Display', serif" }}>{movie.rating}</div><div style={{ fontSize: 12, color: "var(--text-muted)" }}>社区评分</div></div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap" }}>
            {(movie.genres || []).map((g) => <span key={g} className="tag-pill" style={{ fontSize: 13, padding: "5px 14px" }}>{g}</span>)}
            {(movie.tags || []).map((t) => <span key={t} className="tag-pill" style={{ fontSize: 13, padding: "5px 14px", background: "var(--accent-crimson-soft)", color: "var(--accent-crimson)", borderColor: "rgba(192,57,43,0.2)" }}>{t}</span>)}
          </div>
          <div style={{ marginTop: 28 }}><h3 style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>剧情简介</h3><p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--text-secondary)" }}>{movie.summary}</p></div>
          <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div><h3 style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>导演</h3><p style={{ fontSize: 16 }}>{movie.director}</p></div>
            <div><h3 style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>主演</h3><p style={{ fontSize: 16, color: "var(--text-secondary)" }}>{(movie.cast || []).join("、")}</p></div>
          </div>
          <div style={{ marginTop: 32, padding: 24, background: "var(--bg-card)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <h3 style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500, marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>你的评分</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ fontSize: 28, color: "var(--accent-gold)", cursor: "pointer", userSelect: "none" }}>
                {[1, 2, 3, 4, 5].map((n) => <span key={n} onClick={() => rateMovie(n)} onMouseOver={() => setHoverRating(n)} onMouseOut={() => setHoverRating(0)}>{n <= (hoverRating || rating) ? "★" : "☆"}</span>)}
              </div>
              <span style={{ fontSize: 14, color: "var(--text-muted)" }}>{(hoverRating || rating) ? `${hoverRating || rating} 星` : "点击星星评分"}{savedText ? ` — ${savedText}` : ""}</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 48 }}><div className="section-header"><h2 className="section-title" style={{ fontSize: 22 }}>相似推荐</h2></div><div className="movie-grid-lg">{similar.map((m) => <MovieCard key={m.id} movie={m} size="large" />)}</div></div>
    </>
  );
}
