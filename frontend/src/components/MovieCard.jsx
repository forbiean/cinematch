import { Link } from "react-router-dom";

export default function MovieCard({ movie, size = "normal" }) {
  const rating = Number(movie.rating || 0);
  const starCount = Math.max(0, Math.min(5, Math.round(rating / 2)));
  const stars = "★".repeat(starCount) + "☆".repeat(5 - starCount);
  return (
    <Link className="card" style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }} to={`/movies/${movie.id}`}>
      <div className="poster">
        <img src={movie.poster} alt={movie.title} loading="lazy" />
        <div className="rating-badge">{movie.rating}</div>
        <div className="poster-overlay"><div style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 500 }}>查看详情 →</div></div>
      </div>
      <div style={{ padding: 14 }}>
        <h3 style={{ fontSize: size === "large" ? 16 : 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "'Noto Sans SC', sans-serif" }}>{movie.title}</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{movie.year}</span>
          <span style={{ fontSize: 12, color: "var(--accent-gold)" }}>{stars}</span>
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>{movie.genres.slice(0, 2).map((g) => <span key={g} className="tag-pill">{g}</span>)}</div>
      </div>
    </Link>
  );
}
