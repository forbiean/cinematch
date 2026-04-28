function createMovieCard(movie, size = 'normal') {
  const stars = '★'.repeat(Math.floor(movie.rating / 2)) + '☆'.repeat(5 - Math.floor(movie.rating / 2));
  return `
    <div class="card" style="cursor: pointer;" onclick="location.href='movie-detail.html?id=${movie.id}'">
      <div class="poster">
        <img src="${movie.poster}" alt="${movie.title}" loading="lazy">
        <div class="rating-badge">${movie.rating}</div>
        <div class="poster-overlay">
          <div style="color: var(--text-primary); font-size: 13px; font-weight: 500;">查看详情 →</div>
        </div>
      </div>
      <div style="padding: 14px;">
        <h3 style="font-size: ${size === 'large' ? '16px' : '14px'}; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: 'Noto Sans SC', sans-serif;">${movie.title}</h3>
        <div style="display: flex; align-items: center; gap: 8px; margin-top: 6px;">
          <span style="font-size: 12px; color: var(--text-muted);">${movie.year}</span>
          <span style="font-size: 12px; color: var(--accent-gold);">${stars}</span>
        </div>
        <div style="display: flex; gap: 4px; margin-top: 8px; flex-wrap: wrap;">
          ${movie.genres.slice(0, 2).map(g => `<span class="tag-pill">${g}</span>`).join('')}
        </div>
      </div>
    </div>
  `;
}

function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function setActiveNav() {
  const path = window.location.pathname;
  const page = path.split('/').pop().replace('.html', '') || 'index';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;
    const target = href.replace('.html', '').replace('./', '');
    const current = page === 'index' ? 'index' : page;
    if (target === current || (current === 'index' && target === 'index')) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', setActiveNav);
