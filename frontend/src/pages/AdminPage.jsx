import { Fragment, useEffect, useState } from "react";
import { parseApiError } from "../utils/api";

function parseCastInput(castText) {
  return String(castText || "").split(",").map((x) => x.trim()).filter(Boolean);
}

export default function AdminPage() {
  const [tags, setTags] = useState([]);
  const [tagLoading, setTagLoading] = useState(false);
  const [tagError, setTagError] = useState("");
  const [showCreateTagForm, setShowCreateTagForm] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [createTagSaving, setCreateTagSaving] = useState(false);
  const [pendingDeleteTag, setPendingDeleteTag] = useState(null);
  const [deleteTagSaving, setDeleteTagSaving] = useState(false);
  const [overview, setOverview] = useState({
    movieTotal: 0,
    weekNewMovies: 0,
    userTotal: 0,
    weekNewUsers: 0,
    todayRatings: 0,
    todayRatingsDeltaPct: 0,
    favoriteRate: 0
  });
  const [trend, setTrend] = useState([]);
  const [hotTags, setHotTags] = useState([]);
  const [recommendationOverview, setRecommendationOverview] = useState({
    requestCount7d: 0,
    avgResultCount7d: 0,
    coldStartUsers7d: 0,
    requestCountToday: 0
  });
  const [recommendationLogs, setRecommendationLogs] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");
  const [movieRows, setMovieRows] = useState([]);
  const [movieTotal, setMovieTotal] = useState(0);
  const [moviePage, setMoviePage] = useState(1);
  const [moviePageSize] = useState(10);
  const [movieLoading, setMovieLoading] = useState(false);
  const [movieError, setMovieError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({ title: "", year: "", poster: "", director: "", castText: "", tags: [], summary: "" });
  const [createTagOpen, setCreateTagOpen] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", year: "", poster: "", director: "", castText: "", tags: [], summary: "" });
  const [editTagOpen, setEditTagOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [pendingDeleteMovie, setPendingDeleteMovie] = useState(null);
  const [deleteMovieSaving, setDeleteMovieSaving] = useState(false);
  function loadDashboard() {
    const token = localStorage.getItem("token");
    if (!token) {
      setDashboardError("请先登录管理员账号");
      return;
    }
    setDashboardLoading(true);
    setDashboardError("");
    fetch("/api/admin/dashboard", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) throw new Error("请先登录");
          if (res.status === 403) throw new Error("无权限访问后台（仅管理员）");
          return parseApiError(res, "加载后台概览失败，请稍后重试").then((msg) => { throw new Error(msg); });
        }
        return res.json();
      })
      .then((data) => {
        const o = data?.overview || {};
        setOverview({
          movieTotal: Number(o.movieTotal || 0),
          weekNewMovies: Number(o.weekNewMovies || 0),
          userTotal: Number(o.userTotal || 0),
          weekNewUsers: Number(o.weekNewUsers || 0),
          todayRatings: Number(o.todayRatings || 0),
          todayRatingsDeltaPct: Number(o.todayRatingsDeltaPct || 0),
          favoriteRate: Number(o.favoriteRate || 0)
        });
        setTrend(Array.isArray(data?.trend) ? data.trend : []);
        setHotTags(Array.isArray(data?.hotTags) ? data.hotTags : []);
        const ro = data?.recommendationOverview || {};
        setRecommendationOverview({
          requestCount7d: Number(ro.requestCount7d || 0),
          avgResultCount7d: Number(ro.avgResultCount7d || 0),
          coldStartUsers7d: Number(ro.coldStartUsers7d || 0),
          requestCountToday: Number(ro.requestCountToday || 0)
        });
        setRecommendationLogs(Array.isArray(data?.recommendationLogs) ? data.recommendationLogs : []);
      })
      .catch((err) => setDashboardError(err.message || "加载后台概览失败，请稍后重试"))
      .finally(() => setDashboardLoading(false));
  }

  function loadTags() {
    const token = localStorage.getItem("token");
    if (!token) {
      setTagError("请先登录管理员账号");
      return;
    }
    setTagLoading(true);
    setTagError("");
    fetch("/api/admin/tags", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) throw new Error("请先登录");
          if (res.status === 403) throw new Error("无权限访问标签管理（仅管理员）");
          return parseApiError(res, "加载标签失败，请稍后重试").then((msg) => { throw new Error(msg); });
        }
        return res.json();
      })
      .then((data) => setTags(Array.isArray(data) ? data : []))
      .catch((err) => setTagError(err.message || "加载标签失败，请稍后重试"))
      .finally(() => setTagLoading(false));
  }

  function loadMovies(page) {
    const token = localStorage.getItem("token");
    if (!token) {
      setMovieRows([]);
      setMovieTotal(0);
      setMovieError("请先登录管理员账号");
      return;
    }
    setMovieLoading(true);
    setMovieError("");
    fetch(`/api/admin/movies?page=${page}&pageSize=${moviePageSize}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) throw new Error("请先登录");
          if (res.status === 403) throw new Error("无权限访问后台（仅管理员）");
          return parseApiError(res, "加载电影管理数据失败，请稍后重试").then((msg) => { throw new Error(msg); });
        }
        return res.json();
      })
      .then((data) => {
        setMovieRows(Array.isArray(data?.items) ? data.items : []);
        setMovieTotal(Number(data?.total || 0));
      })
      .catch((err) => setMovieError(err.message || "加载电影管理数据失败，请稍后重试"))
      .finally(() => setMovieLoading(false));
  }

  useEffect(() => {
    loadDashboard();
    loadTags();
  }, []);

  useEffect(() => {
    loadMovies(moviePage);
  }, [moviePage, moviePageSize]);

  function updateCreateField(key, value) {
    setCreateForm((old) => ({ ...old, [key]: value }));
  }

  function submitCreateMovie(e) {
    e.preventDefault();
    setCreateError("");
    const yearNum = Number(createForm.year);
    if (!createForm.title.trim()) {
      setCreateError("请输入电影标题");
      return;
    }
    if (!Number.isInteger(yearNum) || yearNum < 1888 || yearNum > 2100) {
      setCreateError("请输入有效年份");
      return;
    }

    setCreateSaving(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setCreateSaving(false);
      setCreateError("请先登录管理员账号");
      return;
    }
    fetch("/api/admin/movies", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: createForm.title.trim(),
        year: yearNum,
        poster: createForm.poster.trim(),
        director: createForm.director.trim(),
        cast: parseCastInput(createForm.castText),
        summary: createForm.summary.trim(),
        tags: createForm.tags
      })
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) throw new Error("请先登录");
          if (res.status === 403) throw new Error("无权限新增电影（仅管理员）");
          return parseApiError(res, "新增电影失败，请稍后重试").then((msg) => { throw new Error(msg); });
        }
        return res.json();
      })
      .then(() => {
        setShowCreateForm(false);
        setCreateForm({ title: "", year: "", poster: "", director: "", castText: "", tags: [], summary: "" });
        setMoviePage(1);
        loadMovies(1);
        loadTags();
      })
      .catch((err) => setCreateError(err.message || "新增电影失败，请稍后重试"))
      .finally(() => setCreateSaving(false));
  }

  function openEditMovie(m) {
    setEditError("");
    setEditingId(m.id);
    setEditForm({
      title: m.title || "",
      year: String(m.year || ""),
      poster: m.poster || "",
      director: m.director || "",
      castText: (m.cast || []).join(","),
      tags: m.genres || [],
      summary: m.summary || ""
    });
    setEditTagOpen(false);
  }

  function updateEditField(key, value) {
    setEditForm((old) => ({ ...old, [key]: value }));
  }

  function submitEditMovie(e) {
    e.preventDefault();
    if (!editingId) return;
    setEditError("");
    const yearNum = Number(editForm.year);
    if (!editForm.title.trim()) {
      setEditError("请输入电影标题");
      return;
    }
    if (!Number.isInteger(yearNum) || yearNum < 1888 || yearNum > 2100) {
      setEditError("请输入有效年份");
      return;
    }
    setEditSaving(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setEditSaving(false);
      setEditError("请先登录管理员账号");
      return;
    }
    fetch(`/api/admin/movies/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: editForm.title.trim(),
        year: yearNum,
        poster: editForm.poster.trim(),
        director: editForm.director.trim(),
        cast: parseCastInput(editForm.castText),
        summary: editForm.summary.trim(),
        tags: editForm.tags
      })
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) throw new Error("请先登录");
          if (res.status === 403) throw new Error("无权限编辑电影（仅管理员）");
          return parseApiError(res, "编辑电影失败，请稍后重试").then((msg) => { throw new Error(msg); });
        }
        return res.json();
      })
      .then(() => {
        setEditingId(null);
        loadMovies(moviePage);
        loadTags();
      })
      .catch((err) => setEditError(err.message || "编辑电影失败，请稍后重试"))
      .finally(() => setEditSaving(false));
  }

  function submitCreateTag(e) {
    e.preventDefault();
    if (!newTagName.trim()) {
      setTagError("请输入标签名称");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setTagError("请先登录管理员账号");
      return;
    }
    setCreateTagSaving(true);
    setTagError("");
    fetch("/api/admin/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: newTagName.trim() })
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) throw new Error("请先登录");
          if (res.status === 403) throw new Error("无权限新增标签（仅管理员）");
          return parseApiError(res, "新增标签失败，请稍后重试").then((msg) => { throw new Error(msg); });
        }
        return res.json();
      })
      .then(() => {
        setNewTagName("");
        setShowCreateTagForm(false);
        loadTags();
      })
      .catch((err) => setTagError(err.message || "新增标签失败，请稍后重试"))
      .finally(() => setCreateTagSaving(false));
  }

  function removeTag(tagName) {
    const token = localStorage.getItem("token");
    if (!token) {
      setTagError("请先登录管理员账号");
      return;
    }
    setDeleteTagSaving(true);
    fetch(`/api/admin/tags/${encodeURIComponent(tagName)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) throw new Error("请先登录");
          if (res.status === 403) throw new Error("无权限删除标签（仅管理员）");
          return parseApiError(res, "删除标签失败，请稍后重试").then((msg) => { throw new Error(msg); });
        }
        return res.json();
      })
      .then(() => {
        loadTags();
        loadMovies(moviePage);
        setPendingDeleteTag(null);
      })
      .catch((err) => setTagError(err.message || "删除标签失败，请稍后重试"))
      .finally(() => setDeleteTagSaving(false));
  }

  function requestRemoveTag(tag) {
    if ((tag.usageCount || 0) > 0) {
      setPendingDeleteTag(tag);
      return;
    }
    removeTag(tag.name);
  }

  function requestDeleteMovie(movie) {
    setPendingDeleteMovie(movie);
  }

  function confirmDeleteMovie() {
    if (!pendingDeleteMovie) return;
    const token = localStorage.getItem("token");
    if (!token) {
      setMovieError("请先登录管理员账号");
      return;
    }
    setDeleteMovieSaving(true);
    fetch(`/api/admin/movies/${pendingDeleteMovie.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) throw new Error("请先登录");
          if (res.status === 403) throw new Error("无权限删除电影（仅管理员）");
          if (res.status === 404) throw new Error("电影不存在或已被删除");
          return parseApiError(res, "删除电影失败，请稍后重试").then((msg) => { throw new Error(msg); });
        }
        return res.json();
      })
      .then(() => {
        const deletedId = pendingDeleteMovie.id;
        setPendingDeleteMovie(null);
        if (editingId === deletedId) setEditingId(null);
        const maxPage = Math.max(1, Math.ceil((movieTotal - 1) / moviePageSize));
        const nextPage = Math.min(moviePage, maxPage);
        setMoviePage(nextPage);
        loadMovies(nextPage);
        loadTags();
      })
      .catch((err) => setMovieError(err.message || "删除电影失败，请稍后重试"))
      .finally(() => setDeleteMovieSaving(false));
  }

  return (
    <>
      <div style={{ padding: "40px 0 24px" }}>
        <h1 className="section-title">后台管理</h1>
        <p className="section-sub">数据概览与内容运营</p>
      </div>
      {dashboardError ? <div style={{ color: "#fca5a5", marginBottom: 16 }}>{dashboardError}</div> : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 40 }}>
        <div className="card" style={{ padding: 24 }}><div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>电影总数</div><div style={{ fontSize: 36, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{overview.movieTotal.toLocaleString()}</div><div style={{ fontSize: 12, color: "#4ade80", marginTop: 8 }}>本周新增 {overview.weekNewMovies} 部</div></div>
        <div className="card" style={{ padding: 24 }}><div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>注册用户</div><div style={{ fontSize: 36, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{overview.userTotal.toLocaleString()}</div><div style={{ fontSize: 12, color: "#4ade80", marginTop: 8 }}>本周新增 {overview.weekNewUsers} 人</div></div>
        <div className="card" style={{ padding: 24 }}><div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>今日评分</div><div style={{ fontSize: 36, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{overview.todayRatings.toLocaleString()}</div><div style={{ fontSize: 12, color: overview.todayRatingsDeltaPct >= 0 ? "#4ade80" : "#f87171", marginTop: 8 }}>{overview.todayRatingsDeltaPct >= 0 ? "↑" : "↓"} 较昨日 {overview.todayRatingsDeltaPct >= 0 ? "+" : ""}{overview.todayRatingsDeltaPct.toFixed(1)}%</div></div>
        <div className="card" style={{ padding: 24 }}><div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>收藏率</div><div style={{ fontSize: 36, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{overview.favoriteRate.toFixed(1)}%</div><div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 8 }}>有收藏行为用户占比</div></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginBottom: 40 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 18, marginBottom: 50 }}>近7日评分趋势</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 300, position: "relative" }}>
            <div style={{ position: "absolute", bottom: 24, left: 0, right: 0, height: 1, background: "var(--border-subtle)" }} />
            {(trend.length > 0 ? trend : [{ day: "-", pct: 0, count: 0 }]).map((t) => (
              <div key={t.day} style={{ flex: 1, height: "100%", display: "grid", gridTemplateRows: "1fr 24px", rowGap: 8 }}>
                <div style={{ width: "100%", display: "flex", alignItems: "flex-end" }}>
                  <div title={`${t.day}：${t.count || 0} 条`} style={{ width: "100%", background: "linear-gradient(to top, var(--accent-gold), rgba(212,168,83,0.3))", borderRadius: "4px 4px 0 0", height: `${t.pct || 0}%` }} />
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", lineHeight: "24px" }}>{t.day}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 18, marginBottom: 20 }}>热门标签</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {(hotTags.length > 0 ? hotTags : [{ name: "暂无数据", pct: 0, count: 0 }]).map((t) => (
              <div key={t.name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}><span>{t.name}</span><span style={{ color: "var(--text-muted)" }}>{Number(t.pct || 0).toFixed(1)}% · {t.count || 0}</span></div>
                <div style={{ height: 6, background: "var(--bg-elevated)", borderRadius: 3, overflow: "hidden" }}><div style={{ width: `${Math.min(100, Number(t.pct || 0))}%`, height: "100%", background: "var(--accent-gold)", borderRadius: 3 }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {dashboardLoading ? <div style={{ color: "var(--text-secondary)", marginBottom: 20 }}>正在加载概览数据...</div> : null}

      <div className="card" style={{ marginBottom: 40 }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)" }}><h3 style={{ fontSize: 18 }}>推荐效果概览</h3></div>
        <div style={{ padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 24 }}>
            {[
              { value: recommendationOverview.requestCount7d, label: "近7日推荐请求" },
              { value: recommendationOverview.avgResultCount7d.toFixed(2), label: "平均返回条数" },
              { value: recommendationOverview.coldStartUsers7d, label: "近7日冷启动用户" },
              { value: recommendationOverview.requestCountToday, label: "今日推荐请求" }
            ].map((v) => <div key={v.label} style={{ textAlign: "center", padding: 20, background: "var(--bg-elevated)", borderRadius: "var(--radius-md)" }}><div style={{ fontSize: 32, fontWeight: 700, color: "var(--accent-gold)", fontFamily: "'Playfair Display', serif" }}>{v.value}</div><div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>{v.label}</div></div>)}
          </div>
          <h4 style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 12 }}>最近推荐记录</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(recommendationLogs.length > 0 ? recommendationLogs : []).map((log, idx) => <div key={`${log.user}-${log.time}-${idx}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)" }}><div style={{ display: "flex", alignItems: "center", gap: 16 }}><span style={{ fontSize: 13, color: "var(--text-muted)", width: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.user}</span><span className="tag-pill">{log.strategy}</span></div><div style={{ display: "flex", alignItems: "center", gap: 16 }}><span style={{ fontSize: 13, color: "var(--accent-gold)", fontWeight: 600 }}>返回 {log.resultCount} 条</span><span style={{ fontSize: 12, color: "var(--text-muted)" }}>{String(log.time || "").replace("T", " ").slice(0, 19)}</span></div></div>)}
            {recommendationLogs.length === 0 ? <div style={{ padding: "12px 16px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", color: "var(--text-secondary)", fontSize: 13 }}>暂无推荐日志，先使用一次推荐功能后这里会显示记录。</div> : null}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 40 }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}><h3 style={{ fontSize: 18 }}>标签管理</h3><button className="btn btn-primary btn-sm" onClick={() => setShowCreateTagForm((v) => !v)}>{showCreateTagForm ? "取消新增" : "+ 新增标签"}</button></div>
        {showCreateTagForm ? (
          <form onSubmit={submitCreateTag} style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <input value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder="标签名（如 科幻）" style={{ flex: 1, minWidth: 220, padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "var(--text-primary)" }} />
            <button className="btn btn-primary btn-sm" type="submit" disabled={createTagSaving}>{createTagSaving ? "保存中..." : "提交新增"}</button>
          </form>
        ) : null}
        <div style={{ padding: 24 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {tags.map((tag) => (
              <div key={tag.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: 13 }}>{tag.name}</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>({tag.usageCount || 0})</span>
                <button type="button" onClick={() => requestRemoveTag(tag)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>×</button>
              </div>
            ))}
          </div>
          {tagLoading ? <div style={{ marginTop: 12, color: "var(--text-secondary)", fontSize: 13 }}>正在加载标签...</div> : null}
          {tagError ? <div style={{ marginTop: 12, color: "#fca5a5", fontSize: 13 }}>{tagError}</div> : null}
          {tags.length === 0 && !tagLoading ? <div style={{ marginTop: 12, color: "var(--text-secondary)", fontSize: 13 }}>暂无标签</div> : null}
        </div>
      </div>
      {pendingDeleteTag ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(8, 10, 20, 0.72)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99, padding: 20 }}>
          <div style={{ width: "min(520px, 100%)", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "24px 22px", boxShadow: "0 24px 80px rgba(0, 0, 0, 0.45)" }}>
            <h3 style={{ fontSize: 22, color: "var(--accent-crimson)" }}>确认删除标签</h3>
            <p style={{ color: "var(--text-secondary)", marginTop: 10, lineHeight: 1.7 }}>
              标签「{pendingDeleteTag.name}」当前已关联 {pendingDeleteTag.usageCount} 条电影标签记录。
              删除后，这些电影上的该标签也会一并移除。
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 8 }}>此操作不可撤销，请确认是否继续。</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setPendingDeleteTag(null)} disabled={deleteTagSaving}>取消</button>
              <button type="button" className="btn btn-primary" style={{ background: "var(--accent-crimson)", borderColor: "var(--accent-crimson)" }} onClick={() => removeTag(pendingDeleteTag.name)} disabled={deleteTagSaving}>{deleteTagSaving ? "删除中..." : "确认删除"}</button>
            </div>
          </div>
        </div>
      ) : null}
      {pendingDeleteMovie ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(8, 10, 20, 0.72)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99, padding: 20 }}>
          <div style={{ width: "min(540px, 100%)", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "24px 22px", boxShadow: "0 24px 80px rgba(0, 0, 0, 0.45)" }}>
            <h3 style={{ fontSize: 22, color: "var(--accent-crimson)" }}>确认删除电影</h3>
            <p style={{ color: "var(--text-secondary)", marginTop: 10, lineHeight: 1.7 }}>
              电影「{pendingDeleteMovie.title}」将被永久删除。
              相关评分、收藏与标签关联记录也会被一并清理。
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 8 }}>此操作不可撤销，请确认是否继续。</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setPendingDeleteMovie(null)} disabled={deleteMovieSaving}>取消</button>
              <button type="button" className="btn btn-primary" style={{ background: "var(--accent-crimson)", borderColor: "var(--accent-crimson)" }} onClick={confirmDeleteMovie} disabled={deleteMovieSaving}>{deleteMovieSaving ? "删除中..." : "确认删除"}</button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="card" style={{ overflow: "visible" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}><h3 style={{ fontSize: 18 }}>电影管理</h3><button className="btn btn-primary btn-sm" onClick={() => setShowCreateForm((v) => !v)}>{showCreateForm ? "取消新增" : "+ 新增电影"}</button></div>
        {showCreateForm ? (
          <form onSubmit={submitCreateMovie} style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-subtle)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
            <input value={createForm.title} onChange={(e) => updateCreateField("title", e.target.value)} placeholder="标题（必填）" style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "var(--text-primary)" }} />
            <input value={createForm.year} onChange={(e) => updateCreateField("year", e.target.value)} placeholder="年份（如 2024）" style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "var(--text-primary)" }} />
            <input value={createForm.poster} onChange={(e) => updateCreateField("poster", e.target.value)} placeholder="海报 URL（可选）" style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "var(--text-primary)" }} />
            <input value={createForm.director} onChange={(e) => updateCreateField("director", e.target.value)} placeholder="导演（可选）" style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "var(--text-primary)" }} />
            <input value={createForm.castText} onChange={(e) => updateCreateField("castText", e.target.value)} placeholder="主演，逗号分隔（可选）" style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "var(--text-primary)" }} />
            <div style={{ gridColumn: "1 / -1", position: "relative" }}>
              <div onClick={() => setCreateTagOpen((v) => !v)} style={{ minHeight: 42, padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "var(--text-primary)", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", cursor: "pointer" }}>
                {createForm.tags.length === 0 ? <span style={{ color: "var(--text-muted)", fontSize: 13 }}>选择标签（可多选）</span> : createForm.tags.map((t) => <span key={`create-${t}`} style={{ position: "relative", padding: "6px 20px 6px 10px", background: "var(--bg-card)", borderRadius: 999, border: "1px solid var(--border-subtle)", fontSize: 12 }}>{t}<button type="button" onClick={(e) => { e.stopPropagation(); updateCreateField("tags", createForm.tags.filter((x) => x !== t)); }} style={{ position: "absolute", right: 5, top: 2, border: "none", background: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 12 }}>×</button></span>)}
              </div>
              {createTagOpen ? <div style={{ position: "absolute", zIndex: 10, top: "calc(100% + 6px)", left: 0, right: 0, background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 8, padding: 8, maxHeight: 180, overflowY: "auto" }}>{tags.filter((t) => !createForm.tags.includes(t.name)).map((t) => <button key={`opt-create-${t.name}`} type="button" onClick={() => updateCreateField("tags", [...createForm.tags, t.name])} style={{ width: "100%", textAlign: "left", padding: "8px 10px", border: "none", borderRadius: 6, background: "transparent", color: "var(--text-primary)", cursor: "pointer" }}>{t.name}</button>)}</div> : null}
            </div>
            <input value={createForm.summary} onChange={(e) => updateCreateField("summary", e.target.value)} placeholder="简介（可选）" style={{ gridColumn: "1 / -1", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "var(--text-primary)" }} />
            {createError ? <div style={{ gridColumn: "1 / -1", color: "#fca5a5", fontSize: 13 }}>{createError}</div> : null}
            <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}><button className="btn btn-primary btn-sm" type="submit" disabled={createSaving}>{createSaving ? "保存中..." : "提交新增"}</button></div>
          </form>
        ) : null}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead><tr style={{ borderBottom: "1px solid var(--border-subtle)" }}><th style={{ textAlign: "left", padding: "14px 24px", color: "var(--text-muted)", fontWeight: 500, fontSize: 13 }}>ID</th><th style={{ textAlign: "left", padding: "14px 24px", color: "var(--text-muted)", fontWeight: 500, fontSize: 13 }}>电影</th><th style={{ textAlign: "left", padding: "14px 24px", color: "var(--text-muted)", fontWeight: 500, fontSize: 13 }}>年份</th><th style={{ textAlign: "left", padding: "14px 24px", color: "var(--text-muted)", fontWeight: 500, fontSize: 13 }}>标签</th><th style={{ textAlign: "left", padding: "14px 24px", color: "var(--text-muted)", fontWeight: 500, fontSize: 13 }}>评分</th><th style={{ textAlign: "left", padding: "14px 24px", color: "var(--text-muted)", fontWeight: 500, fontSize: 13 }}>操作</th></tr></thead>
            <tbody>
              {movieRows.map((m) => (
                <Fragment key={m.id}>
                <tr key={`row-${m.id}`} style={{ borderBottom: "1px solid var(--border-subtle)", transition: "var(--transition)" }}>
                  <td style={{ padding: "14px 24px", color: "var(--text-muted)", fontSize: 13 }}>{m.id}</td>
                  <td style={{ padding: "14px 24px" }}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><img src={m.poster} style={{ width: 32, height: 48, objectFit: "cover", borderRadius: 4 }} alt={m.title} /><div><div style={{ fontWeight: 500 }}>{m.title}</div><div style={{ fontSize: 12, color: "var(--text-muted)" }}>{m.originalTitle}</div></div></div></td>
                  <td style={{ padding: "14px 24px", color: "var(--text-secondary)" }}>{m.year}</td>
                  <td style={{ padding: "14px 24px" }}><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{m.genres.map((g) => <span key={`${m.id}-${g}`} className="tag-pill">{g}</span>)}</div></td>
                  <td style={{ padding: "14px 24px", color: "var(--accent-gold)", fontWeight: 600 }}>{m.rating}</td>
                  <td style={{ padding: "14px 24px" }}><div style={{ display: "flex", gap: 8 }}><button className="btn btn-ghost btn-sm" onClick={() => openEditMovie(m)}>编辑</button><button type="button" className="btn btn-ghost btn-sm" style={{ color: "var(--accent-crimson)" }} onClick={() => requestDeleteMovie(m)}>删除</button></div></td>
                </tr>
                {editingId === m.id ? (
                  <tr key={`edit-${m.id}`} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td colSpan={6} style={{ padding: "16px 24px" }}>
                      <form onSubmit={submitEditMovie} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
                        <input value={editForm.title} onChange={(e) => updateEditField("title", e.target.value)} placeholder="标题（必填）" style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "var(--text-primary)" }} />
                        <input value={editForm.year} onChange={(e) => updateEditField("year", e.target.value)} placeholder="年份（如 2024）" style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "var(--text-primary)" }} />
                        <input value={editForm.poster} onChange={(e) => updateEditField("poster", e.target.value)} placeholder="海报 URL（可选）" style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "var(--text-primary)" }} />
                        <input value={editForm.director} onChange={(e) => updateEditField("director", e.target.value)} placeholder="导演（可选）" style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "var(--text-primary)" }} />
                        <input value={editForm.castText} onChange={(e) => updateEditField("castText", e.target.value)} placeholder="主演，逗号分隔（可选）" style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "var(--text-primary)" }} />
                        <div style={{ gridColumn: "1 / -1", position: "relative" }}>
                          <div onClick={() => setEditTagOpen((v) => !v)} style={{ minHeight: 42, padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "var(--text-primary)", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", cursor: "pointer" }}>
                            {editForm.tags.length === 0 ? <span style={{ color: "var(--text-muted)", fontSize: 13 }}>选择标签（可多选）</span> : editForm.tags.map((t) => <span key={`edit-${t}`} style={{ position: "relative", padding: "6px 20px 6px 10px", background: "var(--bg-card)", borderRadius: 999, border: "1px solid var(--border-subtle)", fontSize: 12 }}>{t}<button type="button" onClick={(e) => { e.stopPropagation(); updateEditField("tags", editForm.tags.filter((x) => x !== t)); }} style={{ position: "absolute", right: 5, top: 2, border: "none", background: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 12 }}>×</button></span>)}
                          </div>
                          {editTagOpen ? <div style={{ position: "absolute", zIndex: 10, top: "calc(100% + 6px)", left: 0, right: 0, background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 8, padding: 8, maxHeight: 180, overflowY: "auto" }}>{tags.filter((t) => !editForm.tags.includes(t.name)).map((t) => <button key={`opt-edit-${t.name}`} type="button" onClick={() => updateEditField("tags", [...editForm.tags, t.name])} style={{ width: "100%", textAlign: "left", padding: "8px 10px", border: "none", borderRadius: 6, background: "transparent", color: "var(--text-primary)", cursor: "pointer" }}>{t.name}</button>)}</div> : null}
                        </div>
                        <input value={editForm.summary} onChange={(e) => updateEditField("summary", e.target.value)} placeholder="简介（可选）" style={{ gridColumn: "1 / -1", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "var(--text-primary)" }} />
                        {editError ? <div style={{ gridColumn: "1 / -1", color: "#fca5a5", fontSize: 13 }}>{editError}</div> : null}
                        <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 8 }}>
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)} disabled={editSaving}>取消</button>
                          <button className="btn btn-primary btn-sm" type="submit" disabled={editSaving}>{editSaving ? "保存中..." : "提交编辑"}</button>
                        </div>
                      </form>
                    </td>
                  </tr>
                ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
          {movieLoading ? <div style={{ padding: "12px 24px", color: "var(--text-secondary)" }}>正在加载电影列表...</div> : null}
          {movieError ? <div style={{ padding: "12px 24px", color: "#fca5a5" }}>{movieError}</div> : null}
        </div>
        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 13, color: "var(--text-muted)" }}>共 {movieTotal} 条记录</span><div style={{ display: "flex", gap: 8 }}><button className="btn btn-ghost btn-sm" disabled={moviePage <= 1 || movieLoading} onClick={() => setMoviePage((p) => Math.max(1, p - 1))}>上一页</button><button className="btn btn-ghost btn-sm" disabled={movieLoading || moviePage * moviePageSize >= movieTotal} onClick={() => setMoviePage((p) => p + 1)}>下一页</button></div></div>
      </div>
    </>
  );
}
