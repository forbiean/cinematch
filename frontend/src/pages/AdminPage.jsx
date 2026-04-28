import { useMemo, useState } from "react";
import { movies } from "../data/mockData";

export default function AdminPage() {
  const [tags, setTags] = useState(["科幻", "剧情", "动作", "悬疑", "爱情", "犯罪", "动画", "冒险", "惊悚", "战争", "历史", "传记", "奇幻", "喜剧"]);
  const logs = useMemo(
    () => [
      { user: "user_1284", movie: "星际穿越", strategy: "标签偏好", score: 0.92, time: "2分钟前" },
      { user: "user_0892", movie: "盗梦空间", strategy: "协同过滤", score: 0.88, time: "5分钟前" },
      { user: "user_2103", movie: "千与千寻", strategy: "热门加权", score: 0.85, time: "12分钟前" },
      { user: "user_0567", movie: "肖申克的救赎", strategy: "标签偏好", score: 0.91, time: "18分钟前" },
      { user: "user_3401", movie: "阿甘正传", strategy: "冷启动", score: 0.78, time: "25分钟前" }
    ],
    []
  );

  const hotTags = [
    { name: "科幻", pct: 32 },
    { name: "剧情", pct: 28 },
    { name: "动作", pct: 18 },
    { name: "悬疑", pct: 12 },
    { name: "爱情", pct: 10 }
  ];

  const trend = [
    { d: "周一", h: 45 },
    { d: "周二", h: 62 },
    { d: "周三", h: 55 },
    { d: "周四", h: 80 },
    { d: "周五", h: 70 },
    { d: "周六", h: 95 },
    { d: "周日", h: 88 }
  ];

  return (
    <>
      <div style={{ padding: "40px 0 24px" }}>
        <h1 className="section-title">后台管理</h1>
        <p className="section-sub">数据概览与内容运营</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 40 }}>
        <div className="card" style={{ padding: 24 }}><div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>电影总数</div><div style={{ fontSize: 36, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>1,284</div><div style={{ fontSize: 12, color: "#4ade80", marginTop: 8 }}>↑ 本周新增 12 部</div></div>
        <div className="card" style={{ padding: 24 }}><div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>注册用户</div><div style={{ fontSize: 36, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>3,672</div><div style={{ fontSize: 12, color: "#4ade80", marginTop: 8 }}>↑ 本周新增 89 人</div></div>
        <div className="card" style={{ padding: 24 }}><div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>今日评分</div><div style={{ fontSize: 36, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>156</div><div style={{ fontSize: 12, color: "#4ade80", marginTop: 8 }}>↑ 较昨日 +23%</div></div>
        <div className="card" style={{ padding: 24 }}><div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>收藏率</div><div style={{ fontSize: 36, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>24.8%</div><div style={{ fontSize: 12, color: "#f87171", marginTop: 8 }}>↓ 较上周 -1.2%</div></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginBottom: 40 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 18, marginBottom: 20 }}>近7日评分趋势</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 160, paddingBottom: 24, position: "relative" }}>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "var(--border-subtle)" }} />
            {trend.map((t) => (
              <div key={t.d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ width: "100%", background: "linear-gradient(to top, var(--accent-gold), rgba(212,168,83,0.3))", borderRadius: "4px 4px 0 0", height: `${t.h}%` }} />
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{t.d}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 18, marginBottom: 20 }}>热门标签</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {hotTags.map((t) => (
              <div key={t.name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}><span>{t.name}</span><span style={{ color: "var(--text-muted)" }}>{t.pct}%</span></div>
                <div style={{ height: 6, background: "var(--bg-elevated)", borderRadius: 3, overflow: "hidden" }}><div style={{ width: `${t.pct}%`, height: "100%", background: "var(--accent-gold)", borderRadius: 3 }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 40 }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)" }}><h3 style={{ fontSize: 18 }}>推荐效果概览</h3></div>
        <div style={{ padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 24 }}>
            {["8.4%", "4.2", "62", "312ms"].map((v, i) => <div key={v} style={{ textAlign: "center", padding: 20, background: "var(--bg-elevated)", borderRadius: "var(--radius-md)" }}><div style={{ fontSize: 32, fontWeight: 700, color: "var(--accent-gold)", fontFamily: "'Playfair Display', serif" }}>{v}</div><div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>{["推荐点击率", "平均推荐评分", "冷启动用户", "推荐接口耗时"][i]}</div></div>)}
          </div>
          <h4 style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 12 }}>最近推荐记录</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {logs.map((log) => <div key={`${log.user}-${log.movie}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)" }}><div style={{ display: "flex", alignItems: "center", gap: 16 }}><span style={{ fontSize: 13, color: "var(--text-muted)", width: 80 }}>{log.user}</span><span style={{ fontSize: 14, fontWeight: 500 }}>{log.movie}</span><span className="tag-pill">{log.strategy}</span></div><div style={{ display: "flex", alignItems: "center", gap: 16 }}><span style={{ fontSize: 13, color: "var(--accent-gold)", fontWeight: 600 }}>匹配度 {Math.round(log.score * 100)}%</span><span style={{ fontSize: 12, color: "var(--text-muted)" }}>{log.time}</span></div></div>)}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 40 }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}><h3 style={{ fontSize: 18 }}>标签管理</h3><button className="btn btn-primary btn-sm" onClick={() => alert("打开新增标签弹窗")}>+ 新增标签</button></div>
        <div style={{ padding: 24 }}><div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>{tags.map((tag) => <div key={tag} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}><span style={{ fontSize: 13 }}>{tag}</span><button onClick={() => setTags((old) => old.filter((t) => t !== tag))} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>×</button></div>)}</div></div>
      </div>

      <div className="card" style={{ overflow: "visible" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}><h3 style={{ fontSize: 18 }}>电影管理</h3><button className="btn btn-primary btn-sm" onClick={() => alert("打开新增电影弹窗")}>+ 新增电影</button></div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead><tr style={{ borderBottom: "1px solid var(--border-subtle)" }}><th style={{ textAlign: "left", padding: "14px 24px", color: "var(--text-muted)", fontWeight: 500, fontSize: 13 }}>ID</th><th style={{ textAlign: "left", padding: "14px 24px", color: "var(--text-muted)", fontWeight: 500, fontSize: 13 }}>电影</th><th style={{ textAlign: "left", padding: "14px 24px", color: "var(--text-muted)", fontWeight: 500, fontSize: 13 }}>年份</th><th style={{ textAlign: "left", padding: "14px 24px", color: "var(--text-muted)", fontWeight: 500, fontSize: 13 }}>标签</th><th style={{ textAlign: "left", padding: "14px 24px", color: "var(--text-muted)", fontWeight: 500, fontSize: 13 }}>评分</th><th style={{ textAlign: "left", padding: "14px 24px", color: "var(--text-muted)", fontWeight: 500, fontSize: 13 }}>操作</th></tr></thead>
            <tbody>
              {movies.slice(0, 6).map((m) => (
                <tr key={m.id} style={{ borderBottom: "1px solid var(--border-subtle)", transition: "var(--transition)" }}>
                  <td style={{ padding: "14px 24px", color: "var(--text-muted)", fontSize: 13 }}>{m.id}</td>
                  <td style={{ padding: "14px 24px" }}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><img src={m.poster} style={{ width: 32, height: 48, objectFit: "cover", borderRadius: 4 }} alt={m.title} /><div><div style={{ fontWeight: 500 }}>{m.title}</div><div style={{ fontSize: 12, color: "var(--text-muted)" }}>{m.originalTitle}</div></div></div></td>
                  <td style={{ padding: "14px 24px", color: "var(--text-secondary)" }}>{m.year}</td>
                  <td style={{ padding: "14px 24px" }}><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{m.genres.map((g) => <span key={`${m.id}-${g}`} className="tag-pill">{g}</span>)}</div></td>
                  <td style={{ padding: "14px 24px", color: "var(--accent-gold)", fontWeight: 600 }}>{m.rating}</td>
                  <td style={{ padding: "14px 24px" }}><div style={{ display: "flex", gap: 8 }}><button className="btn btn-ghost btn-sm">编辑</button><button className="btn btn-ghost btn-sm" style={{ color: "var(--accent-crimson)" }}>删除</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 13, color: "var(--text-muted)" }}>共 1,284 条记录</span><div style={{ display: "flex", gap: 8 }}><button className="btn btn-ghost btn-sm">上一页</button><button className="btn btn-ghost btn-sm">下一页</button></div></div>
      </div>
    </>
  );
}
