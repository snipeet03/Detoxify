import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeed } from '../hooks/useFeed';
import { useCards } from '../hooks/useCards';
import { useAppStore } from '../store/useAppStore';
import VideoCard from '../components/VideoCard';
import SkeletonCard from '../components/SkeletonCard';
import TopicCard from '../components/TopicCard';
import AddCardModal from '../components/AddCardModal';
import styles from './HomePage.module.css';

export default function HomePage() {
  const [activeCard, setActiveCard] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const { generate, loading } = useFeed();
  const { feedResults } = useAppStore();
  const { cards, loading: cardsLoading, addLoading, addCard, isLoggedIn } = useCards();

  async function pickCard(keyword) {
    setActiveCard(keyword);
    try {
      await generate({ keyword, type: 'both' });
    } catch (_) {}
  }

  const allVideos = feedResults
    ? [...(feedResults.topVideos || []), ...(feedResults.shorts || [])]
    : [];

  const shorts = feedResults?.shorts || [];
  const longVideos = feedResults?.topVideos || [];

  return (
    <div className={styles.page}>

      {/* ── HERO (when no card selected) ── */}
      {!activeCard && !feedResults && (
        <div className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.heroBadge}>⚡ Distraction-Free Learning</div>
            <h1 className={styles.heroTitle}>YouTube without the rabbit hole.</h1>
            <p className={styles.heroSub}>
              Pick a topic below to generate your curated learning feed — no autoplay, no infinite scroll, no algorithmic noise.
            </p>
          </div>

          {/* ── TOPIC GRID ── */}
          {!isLoggedIn ? (
            <div className={styles.loginPrompt}>
              <span className={styles.loginIcon}>🔐</span>
              <p>Log in to get your personalized topic cards</p>
              <button className={styles.loginBtn} onClick={() => navigate('/login')}>
                Log In
              </button>
            </div>
          ) : cardsLoading ? (
            <div className={styles.topicsGrid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.skeletonCard} style={{ animationDelay: `${i * 60}ms` }} />
              ))}
            </div>
          ) : (
            <div className={styles.topicsGrid}>
              {cards.map((card, i) => (
                <TopicCard
                  key={card}
                  label={card}
                  index={i}
                  onClick={pickCard}
                />
              ))}

              {/* ── ADD CARD BUTTON ── */}
              <button
                className={styles.addCard}
                onClick={() => setModalOpen(true)}
                disabled={addLoading}
                title="Add new topic card"
                style={{ animationDelay: `${cards.length * 40}ms` }}
              >
                <span className={styles.addIcon}>+</span>
                <span className={styles.addLabel}>Add Card</span>
              </button>
            </div>
          )}
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

          {/* Active chip label */}
          {activeCard && (
            <div className={styles.resultHeader}>
              <button className={styles.backBtn} onClick={() => { setActiveCard(null); }}>
                ← Back to topics
              </button>
              <span className={styles.activeLabel}>Results for: <strong>{activeCard}</strong></span>
            </div>
          )}

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
                      {(c.channelTitle || '?')[0].toUpperCase()}
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
          <p>Try a different topic card.</p>
        </div>
      )}

      {/* ── ADD CARD MODAL ── */}
      <AddCardModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={addCard}
        currentCount={cards.length}
        maxCards={15}
      />
    </div>
  );
}
