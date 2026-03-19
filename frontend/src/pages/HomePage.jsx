import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeed } from '../hooks/useFeed';
import { useAppStore } from '../store/useAppStore';
import VideoCard from '../components/VideoCard';
import SkeletonCard from '../components/SkeletonCard';
import styles from './HomePage.module.css';

const CHIPS = [
  { label: 'All',               keyword: '',               type: 'both' },
  { label: 'Machine Learning',  keyword: 'machine learning', type: 'long' },
  { label: 'Web Dev',           keyword: 'web development', type: 'both' },
  { label: 'DSA',               keyword: 'data structures algorithms', type: 'long' },
  { label: 'System Design',     keyword: 'system design interview', type: 'long' },
  { label: 'Python',            keyword: 'python programming', type: 'both' },
  { label: 'React',             keyword: 'react tutorial', type: 'both' },
  { label: 'DevOps',            keyword: 'docker kubernetes devops', type: 'long' },
  { label: 'AI / LLMs',         keyword: 'large language models AI', type: 'both' },
  { label: 'JavaScript',        keyword: 'javascript tutorial', type: 'both' },
  { label: 'SQL',               keyword: 'sql database tutorial', type: 'long' },
  { label: 'TypeScript',        keyword: 'typescript tutorial', type: 'both' },
  { label: 'Shorts',            keyword: 'coding tips', type: 'short' },
];

export default function HomePage() {
  const [activeChip, setActiveChip] = useState(0);
  const navigate = useNavigate();
  const { generate, loading } = useFeed();
  const { feedResults } = useAppStore();

  async function pickChip(idx) {
    setActiveChip(idx);
    const chip = CHIPS[idx];
    if (!chip.keyword) return;
    try {
      await generate({ keyword: chip.keyword, type: chip.type });
    } catch (_) {}
  }

  const allVideos = feedResults
    ? [...(feedResults.topVideos || []), ...(feedResults.shorts || [])]
    : [];

  const shorts = feedResults?.shorts || [];
  const longVideos = feedResults?.topVideos || [];

  return (
    <div className={styles.page}>

      {/* ── CHIPS ── */}
      <div className={styles.chipsWrap}>
        {CHIPS.map((c, i) => (
          <button
            key={c.label}
            className={`${styles.chip} ${activeChip === i ? styles.chipActive : ''}`}
            onClick={() => pickChip(i)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* ── HERO (when no chip selected) ── */}
      {activeChip === 0 && !feedResults && (
        <div className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.heroBadge}>⚡ Distraction-Free Learning</div>
            <h1 className={styles.heroTitle}>YouTube without the rabbit hole.</h1>
            <p className={styles.heroSub}>Pick a topic above to generate your curated learning feed — no autoplay, no infinite scroll, no algorithmic noise.</p>
          </div>

          {/* Suggested topics grid */}
          <div className={styles.topicsGrid}>
            {CHIPS.slice(1).map((chip, i) => (
              <button
                key={chip.label}
                className={styles.topicCard}
                onClick={() => pickChip(i + 1)}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <span className={styles.topicIcon}>{TOPIC_ICONS[i] || '📚'}</span>
                <span className={styles.topicLabel}>{chip.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── LOADING ── */}
      {loading && (
        <div className={styles.gridWrap}>
          <div className={styles.grid}>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      )}

      {/* ── RESULTS ── */}
      {!loading && feedResults && (
        <div className={styles.results}>

          {/* Long-form videos */}
          {longVideos.length > 0 && (
            <div className={styles.gridWrap}>
              <div className={styles.grid}>
                {longVideos.map(v => <VideoCard key={v.videoId} video={v} />)}
              </div>
            </div>
          )}

          {/* Shorts section */}
          {shorts.length > 0 && (
            <div className={styles.shortsSection}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>
                  <svg viewBox="0 0 24 24" fill="#ff0000" width="28" height="28">
                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                  </svg>
                  Shorts
                </div>
              </div>
              <div className={styles.shortsGrid}>
                {shorts.map(v => <VideoCard key={v.videoId} video={v} layout="short" />)}
              </div>
            </div>
          )}

          {/* Creators row */}
          {feedResults.creators?.length > 0 && (
            <div className={styles.creatorsRow}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>
                  Top Creators in this topic
                </div>
              </div>
              <div className={styles.creatorChips}>
                {feedResults.creators.map(c => (
                  <a
                    key={c.channelId}
                    href={`https://www.youtube.com/channel/${c.channelId}`}
                    target="_blank" rel="noopener noreferrer"
                    className={styles.creatorChip}
                  >
                    <span className={styles.creatorAvatar}>
                      {(c.channelTitle||'?')[0].toUpperCase()}
                    </span>
                    {c.channelTitle}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!loading && feedResults && allVideos.length === 0 && (
        <div className={styles.empty}>
          <span>🔍</span>
          <h3>No results found</h3>
          <p>Try a different topic chip above.</p>
        </div>
      )}
    </div>
  );
}

const TOPIC_ICONS = ['🤖','🌐','🧮','🏗️','🐍','⚛️','🐳','🧠','🟨','🗃️','📘','⚡'];
