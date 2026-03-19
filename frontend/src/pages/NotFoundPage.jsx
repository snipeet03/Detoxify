import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.icon}>
        <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
      </div>
      <h1 className={styles.code}>404</h1>
      <p className={styles.msg}>This page isn't available. The link may be broken, or the page may have been removed.</p>
      <Link to="/" className={styles.btn}>Go to Detoxify Home</Link>
    </div>
  );
}
