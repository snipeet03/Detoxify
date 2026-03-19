import { useEffect, useState } from 'react';
import { creatorsApi } from '../services/api';
import styles from './CreatorsPage.module.css';

const CATS = ['All','AI','Web Dev','DSA','System Design','Python','DevOps'];

function fmt(n) {
  if (!n) return '—';
  if (n>=1e6) return (n/1e6).toFixed(1)+'M';
  if (n>=1e3) return (n/1e3).toFixed(0)+'K';
  return String(n);
}

export default function CreatorsPage() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState('All');

  useEffect(() => {
    setLoading(true);
    creatorsApi.list(cat === 'All' ? undefined : cat)
      .then(r => setCreators(r.data || []))
      .catch(() => setCreators([]))
      .finally(() => setLoading(false));
  }, [cat]);

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.title}>Top Creators</h1>
        <div className={styles.filters}>
          {CATS.map(c => (
            <button key={c}
              className={`${styles.chip} ${cat===c ? styles.chipActive : ''}`}
              onClick={() => setCat(c)}
            >{c}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.grid}>
          {Array.from({length:12}).map((_,i) => (
            <div key={i} className={`${styles.skeleton} shimmer`}/>
          ))}
        </div>
      ) : creators.length > 0 ? (
        <div className={styles.grid}>
          {creators.map((c,i) => (
            <a key={c.channelId}
              href={`https://www.youtube.com/channel/${c.channelId}`}
              target="_blank" rel="noopener noreferrer"
              className={styles.card}
            >
              <div className={styles.rank}>#{i+1}</div>
              <div className={styles.avatar}>{(c.channelTitle||'?')[0].toUpperCase()}</div>
              <div className={styles.info}>
                <div className={styles.name}>{c.channelTitle}</div>
                <div className={styles.subs}>{fmt(c.subscriberCount)} subscribers</div>
              </div>
              <div className={styles.score}>⚡ {((c.score||0)*100).toFixed(0)}</div>
            </a>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <span>👥</span>
          <h3>No creators yet</h3>
          <p>Generate some feeds and creators will appear here.</p>
        </div>
      )}
    </div>
  );
}
