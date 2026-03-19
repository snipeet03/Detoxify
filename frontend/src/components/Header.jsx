import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeed } from '../hooks/useFeed';
import { useAppStore } from '../store/useAppStore';
import styles from './Header.module.css';

export default function Header() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('both');
  const navigate = useNavigate();
  const { generate, loading } = useFeed();
  const { bookmarks } = useAppStore();

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim() || loading) return;
    try {
      await generate({ keyword: query.trim(), type });
      navigate('/feed');
    } catch (_) {}
  }

  return (
    <header className={styles.header}>
      {/* Left: Hamburger + Logo */}
      <div className={styles.left}>
        <button className={styles.iconBtn} aria-label="Menu">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
        <a href="/" className={styles.logo}>
          <svg className={styles.ytIcon} viewBox="0 0 90 20" width="90" height="20">
            <rect x="0" y="1" width="26" height="18" rx="4" fill="#FF0000"/>
            <polygon points="10,5 20,10 10,15" fill="white"/>
            <text x="30" y="15" fontFamily="Roboto,sans-serif" fontSize="16" fontWeight="700" fill="#f1f1f1">Detoxify</text>
          </svg>
          <span className={styles.inBadge}>IN</span>
        </a>
      </div>

      {/* Center: Search */}
      <div className={styles.center}>
        <form onSubmit={handleSearch} className={styles.searchRow}>
          <div className={styles.searchBox}>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search topics to learn..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button type="submit" className={styles.searchBtn} disabled={loading}>
              {loading
                ? <span className={styles.spin}/>
                : <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
              }
            </button>
          </div>
          <button type="button" className={styles.micBtn} aria-label="Voice search">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
          </button>
        </form>
      </div>

      {/* Right: Actions */}
      <div className={styles.right}>
        <a href="/feed" className={styles.createBtn}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          Create
        </a>
        <button className={styles.iconBtn} aria-label="Notifications">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
          {bookmarks.length > 0 && <span className={styles.badge}>{bookmarks.length}</span>}
        </button>
        <div className={styles.avatar}>D</div>
      </div>
    </header>
  );
}
