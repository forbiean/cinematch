import { useEffect, useState } from "react";
import MovieCard from "../components/MovieCard";

export default function MoviesPage() {
  const [genre, setGenre] = useState("all");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const perPage = 8;
  const maxPage = Math.max(1, Math.ceil(total / perPage));

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(perPage),
      genre,
      sort: sortBy
    });
    if (query.trim()) {
      params.set("query", query.trim());
    }

    setLoading(true);
    setError("");
    fetch(`/api/movies?${params.toString()}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setItems(Array.isArray(data.items) ? data.items : []);
        setTotal(Number.isFinite(data.total) ? data.total : 0);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError("加载电影列表失败，请稍后重试");
        setItems([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [genre, page, query, sortBy]);

  function onGenre(g) { setGenre(g); setPage(1); }
  function onQuery(v) { setQuery(v); setPage(1); }
  const canPrev = page > 1 && !loading;
  const canNext = page < maxPage && !loading;

  return (
    <>
      <div style={{ padding: "40px 0 24px" }}><h1 className="section-title">电影库</h1><p className="section-sub">浏览、搜索和筛选你感兴趣的影片</p></div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 24 }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 260 }}><input placeholder="搜索电影名称、导演、演员..." value={query} onChange={(e) => onQuery(e.target.value)} /></div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", padding: "10px 16px", borderRadius: "var(--radius-sm)", fontFamily: "inherit", fontSize: 14, outline: "none", cursor: "pointer" }}>
          <option value="rating">按评分排序</option><option value="year">按年份排序</option><option value="title">按名称排序</option>
        </select>
      </div>
      <div className="filter-row">{["all", "科幻", "剧情", "动作", "爱情", "悬疑", "动画", "犯罪"].map((g) => <button key={g} className={`chip ${genre === g ? "active" : ""}`} onClick={() => onGenre(g)}>{g === "all" ? "全部" : g}</button>)}</div>
      {error ? <div className="card" style={{ padding: 16, marginBottom: 12, color: "#fca5a5" }}>{error}</div> : null}
      {loading ? <div style={{ color: "var(--text-secondary)", margin: "20px 0" }}>正在加载...</div> : null}
      {!loading && !error && items.length === 0 ? <div style={{ color: "var(--text-secondary)", margin: "20px 0" }}>暂无数据</div> : null}
      <div className="movie-grid">{items.map((m) => <MovieCard key={m.id} movie={m} />)}</div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 48, gap: 8 }}>
        <button className="btn btn-ghost btn-sm" disabled={!canPrev} onClick={() => setPage((p) => Math.max(1, p - 1))}>上一页</button>
        <span style={{ display: "flex", alignItems: "center", padding: "0 16px", color: "var(--text-secondary)", fontSize: 14 }}>第 <strong style={{ color: "var(--text-primary)", margin: "0 4px" }}>{page}</strong> / {maxPage} 页</span>
        <button className="btn btn-ghost btn-sm" disabled={!canNext} onClick={() => setPage((p) => Math.min(maxPage, p + 1))}>下一页</button>
      </div>
    </>
  );
}
