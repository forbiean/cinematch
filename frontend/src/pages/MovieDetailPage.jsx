import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import { parseApiError } from "../utils/api";

export default function MovieDetailPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [savedText, setSavedText] = useState("");
  const [favorite, setFavorite] = useState(false);
  const [actionError, setActionError] = useState("");
  const [showShare, setShowShare] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

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

        const token = localStorage.getItem("token");
        if (!token) return;

        Promise.all([
          fetch("/api/me/ratings", { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal }),
          fetch("/api/me/favorites", { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal })
        ])
          .then(async ([ratingsRes, favoritesRes]) => {
            if (!ratingsRes.ok || !favoritesRes.ok) return;
            const ratings = await ratingsRes.json();
            const favorites = await favoritesRes.json();
            const mine = Array.isArray(ratings) ? ratings.find((x) => Number(x.movieId) === Number(id)) : null;
            const isFav = Array.isArray(favorites) ? favorites.some((x) => Number(x.id) === Number(id)) : false;
            if (mine?.score) setRating(mine.score);
            setFavorite(isFav);
          })
          .catch(() => {});
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError("加载电影详情失败，请稍后重试");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [id]);

  async function rateMovie(n) {
    const token = localStorage.getItem("token");
    if (!token) {
      setActionError("请先登录后再评分");
      return;
    }
    setActionError("");
    try {
      const res = await fetch(`/api/movies/${id}/ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ score: n })
      });
      if (!res.ok) throw new Error(await parseApiError(res, "评分保存失败，请稍后重试"));
      setRating(n);
      setSavedText("评分已保存");
      setTimeout(() => setSavedText(""), 1500);
    } catch (err) {
      setActionError(err.message || "评分保存失败，请稍后重试");
    }
  }

  async function toggleFavorite() {
    const token = localStorage.getItem("token");
    if (!token) {
      setActionError("请先登录后再收藏");
      return;
    }
    setActionError("");
    const nextFavorite = !favorite;
    try {
      const res = await fetch(`/api/movies/${id}/favorite`, {
        method: nextFavorite ? "POST" : "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(await parseApiError(res, "收藏状态更新失败，请稍后重试"));
      setFavorite(nextFavorite);
      setSavedText(nextFavorite ? "已加入收藏" : "已取消收藏");
      setTimeout(() => setSavedText(""), 1500);
    } catch (err) {
      setActionError(err.message || "收藏状态更新失败，请稍后重试");
    }
  }

  async function copyShareLink() {
    const link = window.location.href;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link);
      } else {
        const input = document.createElement("input");
        input.value = link;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setShareCopied(true);
      setTimeout(() => {
        setShareCopied(false);
        setShowShare(false);
      }, 800);
    } catch (err) {
      setActionError("复制分享链接失败，请手动复制地址栏链接");
      setShowShare(false);
    }
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
            <button className="btn btn-primary" style={{ flex: 1, background: favorite ? "var(--accent-crimson)" : undefined, borderColor: favorite ? "var(--accent-crimson)" : undefined }} onClick={toggleFavorite}>{favorite ? "已收藏" : "收藏"}</button>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowShare(true)}>分享</button>
          </div>
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
            <div><h1 style={{ fontSize: 42, lineHeight: 1.1 }}>{movie.title}</h1><p style={{ fontSize: 16, color: "var(--text-secondary)", marginTop: 8, fontStyle: "italic", fontFamily: "'Playfair Display', serif" }}>{movie.originalTitle || movie.title} · {movie.year}</p></div>
            <div style={{ textAlign: "center", flexShrink: 0 }}><div style={{ fontSize: 42, fontWeight: 700, color: "var(--accent-gold)", fontFamily: "'Playfair Display', serif" }}>{movie.rating}</div><div style={{ fontSize: 12, color: "var(--text-muted)" }}>社区评分</div></div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap" }}>
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
            {actionError ? <div style={{ marginTop: 10, color: "#fca5a5", fontSize: 13 }}>{actionError}</div> : null}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 48 }}><div className="section-header"><h2 className="section-title" style={{ fontSize: 22 }}>相似推荐</h2></div><div className="movie-grid-lg">{similar.map((m) => <MovieCard key={m.id} movie={m} size="large" />)}</div></div>
      {showShare ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(8, 10, 20, 0.72)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99, padding: 20 }}>
          <div style={{ width: "min(500px, 100%)", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "24px 22px", boxShadow: "0 24px 80px rgba(0, 0, 0, 0.45)" }}>
            <h3 style={{ fontSize: 22 }}>分享电影</h3>
            <p style={{ color: "var(--text-secondary)", marginTop: 6 }}>将当前电影链接发送给朋友。</p>
            <div style={{ marginTop: 16, padding: "10px 12px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--text-secondary)", wordBreak: "break-all" }}>{window.location.href}</div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowShare(false)}>关闭</button>
              <button type="button" className="btn btn-primary" onClick={copyShareLink}>{shareCopied ? "已复制" : "复制链接"}</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
