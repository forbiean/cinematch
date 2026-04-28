import { Link } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import { movies, recommendations } from "../data/mockData";

export default function HomePage() {
  const trending = [movies[1], movies[0], movies[3], movies[4], movies[2]].filter(Boolean);
  const recMovies = recommendations.slice(0, 5).map((r) => movies.find((m) => m.id === r.movieId)).filter(Boolean);

  return (
    <>
      <section className="hero" style={{ padding: "80px 0 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.15, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "-20%", left: "-10%", width: 500, height: 500, background: "radial-gradient(circle, var(--accent-gold), transparent 70%)", filter: "blur(80px)" }} />
          <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: 400, height: 400, background: "radial-gradient(circle, var(--accent-crimson), transparent 70%)", filter: "blur(80px)" }} />
        </div>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", lineHeight: 1.1, position: "relative", zIndex: 1 }}>发现下一部<br /><span className="text-gold">心动电影</span></h1>
        <p style={{ fontSize: 18, color: "var(--text-secondary)", maxWidth: 520, margin: "20px auto 0", position: "relative", zIndex: 1 }}>基于你的口味，从数万部影片中精准推荐。评分越多，推荐越懂你。</p>
        <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center", position: "relative", zIndex: 1 }}>
          <Link to="/movies" className="btn btn-primary">浏览电影</Link>
          <Link to="/recommendations" className="btn btn-ghost">查看推荐</Link>
        </div>
      </section>

      <section className="mt-48">
        <div className="section-header"><div><h2 className="section-title">本周热门</h2><p className="section-sub">社区评分最高的影片</p></div><Link to="/movies" style={{ color: "var(--accent-gold)", fontSize: 14, fontWeight: 500 }}>查看全部 →</Link></div>
        <div className="movie-grid-lg">{trending.map((m) => <MovieCard key={m.id} movie={m} size="large" />)}</div>
      </section>

      <section className="mt-48">
        <div className="section-header"><div><h2 className="section-title">为你推荐</h2><p className="section-sub">基于你的评分历史</p></div><Link to="/recommendations" style={{ color: "var(--accent-gold)", fontSize: 14, fontWeight: 500 }}>查看全部 →</Link></div>
        <div className="movie-grid-lg">{recMovies.map((m) => <MovieCard key={m.id} movie={m} size="large" />)}</div>
      </section>

      <section className="mt-48" style={{ background: "var(--bg-card)", borderRadius: "var(--radius-lg)", padding: 48, border: "1px solid var(--border-subtle)", textAlign: "center" }}>
        <h2 style={{ fontSize: 32 }}>开始记录你的观影旅程</h2>
        <p style={{ color: "var(--text-secondary)", marginTop: 12, maxWidth: 480, marginInline: "auto" }}>评分和收藏电影，让推荐算法更懂你的品味。</p>
        <Link to="/movies" className="btn btn-primary mt-24">去评分</Link>
      </section>
    </>
  );
}
