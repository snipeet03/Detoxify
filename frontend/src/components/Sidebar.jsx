import { useLocation, Link } from 'react-router-dom';
import styles from './Sidebar.module.css';

const NAV = [
  {
    to: '/',
    label: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
    ),
    iconActive: (
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
    ),
  },
  {
    to: '/feed',
    label: 'Feed',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 8L6 7h12l-6 4z"/></svg>
    ),
  },
  {
    to: '/creators',
    label: 'Creators',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zm-2 6H6v-4h12v4zM4 11h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1zm2-6h12v4H6V5z"/></svg>
    ),
  },
 
];

export default function Sidebar() {
  const { pathname } = useLocation();

  return (
    <nav className={styles.sidebar}>
      {NAV.map(({ to, label, icon }) => {
        const active = pathname === to;
        return (
          <Link key={label} to={to} className={`${styles.item} ${active ? styles.active : ''}`}>
            <span className={styles.icon}>{icon}</span>
            <span className={styles.label}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
