import { Link, NavLink } from "react-router-dom";

export default function Layout({ children }) {
  const token = localStorage.getItem("token") || "";
  const userRole = (localStorage.getItem("userRole") || "").toUpperCase();
  const userEmail = localStorage.getItem("userEmail") || "";
  const isLoggedIn = Boolean(token);
  const isAdmin = userRole === "ADMIN";
  const avatarText = (userEmail.trim().charAt(0) || "U").toUpperCase();

  return (
    <div className="app-shell">
      <nav className="top-nav">
        <div className="nav-inner">
          <Link className="brand" to="/"><div className="brand-mark">C</div>CineMatch</Link>
          <ul className="nav-links">
            <li><NavLink to="/">首页</NavLink></li>
            <li><NavLink to="/movies">电影</NavLink></li>
            {isLoggedIn ? <li><NavLink to="/recommendations">推荐</NavLink></li> : null}
            {isAdmin ? <li><NavLink to="/admin">后台</NavLink></li> : null}
          </ul>
          <div className="nav-user">
            {!isLoggedIn ? <Link to="/login" className="btn btn-ghost btn-sm">登录</Link> : null}
            {isLoggedIn ? <Link to="/me" className="avatar">{avatarText}</Link> : null}
          </div>
        </div>
      </nav>
      <main className="main-content page">{children}</main>
      <footer className="app-footer"><p>CineMatch · 电影推荐系统</p><p style={{ marginTop: 4 }}>基于 Spring Boot + React 构建</p></footer>
    </div>
  );
}
