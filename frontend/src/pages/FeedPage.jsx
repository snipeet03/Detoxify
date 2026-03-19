import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useFeed } from '../hooks/useFeed';
import VideoCard from '../components/VideoCard';
import SkeletonCard from '../components/SkeletonCard';
import styles from './FeedPage.module.css';

export default function FeedPage() {
  const navigate = useNavigate();
  const { feedResults, lastQuery, bookmarks } = useAppStore();
  const { generate, loading, error } = useFeed();

  const topVideos = feedResults?.topVideos || [];
  const shorts    = feedResults?.shorts    || [];
  const creators  = feedResults?.creators  || [];
  const hasResults = topVideos.length > 0 || shorts.length > 0;

  function refresh() {
    if (lastQuery) generate(lastQuery);
  }

  if (!feedResults && !loading) {
    return (
      <div className={styles.empty}>
        <span>📭</span>
        <h2>No feed yet</h2>
        <p>Search for a topic to generate your curated learning feed.</p>
        <button className={styles.goBtn} onClick={() => navigate('/')}>← Discover Topics</button>
      </div>
    );
  }

  return (
    <div className={styles.page}>

      {/* Top bar */}
      {lastQuery && (
        <div className={styles.topBar}>
          <button className={styles.backBtn} onClick={() => navigate('/')}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
            Back
          </button>
          <div className={styles.queryPill}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            <strong>"{lastQuery.keyword}"</strong>
            <span className={styles.meta}>{lastQuery.type} · {lastQuery.level || 'any level'}</span>
          </div>
          <button className={styles.refreshBtn} onClick={refresh} disabled={loading}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" className={loading ? styles.spin : ''}>
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            Refresh
          </button>
        </div>
      )}

      {error && <div className={styles.error}>⚠️ {error}</div>}

      {/* Skeletons */}
      {loading && (
        <div className={styles.gridWrap}>
          <div className={styles.grid}>
            {Array.from({length: 8}).map((_,i) => <SkeletonCard key={i}/>)}
          </div>
        </div>
      )}

      {!loading && hasResults && (
        <>
          {/* Long videos */}
          {topVideos.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/></svg>
                <h2>Today's Learning Feed</h2>
                <span className={styles.cnt}>{topVideos.length}</span>
              </div>
              <div className={styles.grid}>
                {topVideos.map(v => <VideoCard key={v.videoId} video={v}/>)}
              </div>
            </section>
          )}

          {/* Shorts */}
          {shorts.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <svg viewBox="0 0 24 24" fill="#ff0000" width="26" height="26"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                <h2>Shorts</h2>
                <span className={styles.cnt}>{shorts.length}</span>
              </div>
              <div className={styles.shortsGrid}>
                {shorts.map(v => <VideoCard key={v.videoId} video={v} layout="short"/>)}
              </div>
            </section>
          )}

          {/* Creators */}
          {creators.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                <h2>Top Creators</h2>
              </div>
              <div className={styles.creatorGrid}>
                {creators.map((c,i) => (
                  <a key={c.channelId} href={`https://www.youtube.com/channel/${c.channelId}`}
                    target="_blank" rel="noopener noreferrer" className={styles.creatorCard}>
                    <span className={styles.creatorRank}>#{i+1}</span>
                    <span className={styles.creatorAvatar}>{(c.channelTitle||'?')[0].toUpperCase()}</span>
                    <span className={styles.creatorName}>{c.channelTitle}</span>
                    <span className={styles.creatorScore}>⚡ {((c.score||0)*100).toFixed(0)}</span>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Bookmarks */}
          {bookmarks.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
                <h2>Saved Videos</h2>
                <span className={styles.cnt}>{bookmarks.length}</span>
              </div>
              <div className={styles.grid}>
                {bookmarks.map(v => <VideoCard key={v.videoId} video={v}/>)}
              </div>
            </section>
          )}
        </>
      )}

      {!loading && !hasResults && feedResults && (
        <div className={styles.empty}>
          <span>🔍</span>
          <h2>No videos found</h2>
          <p>Try a different topic or content type.</p>
          <button className={styles.goBtn} onClick={() => navigate('/')}>← Try Again</button>
        </div>
      )}
    </div>
  );
}
