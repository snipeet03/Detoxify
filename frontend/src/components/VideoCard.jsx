import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import styles from './VideoCard.module.css';

function fmt(n) {
  if (!n) return '0';
  if (n >= 1e9) return (n/1e9).toFixed(1)+'B';
  if (n >= 1e6) return (n/1e6).toFixed(1)+'M';
  if (n >= 1e3) return (n/1e3).toFixed(0)+'K';
  return String(n);
}

function fmtDur(s) {
  if (!s) return '';
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  return `${m}:${String(sec).padStart(2,'0')}`;
}

function ago(d) {
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff/60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)} hours ago`;
  if (diff < 2592000) return `${Math.floor(diff/86400)} days ago`;
  if (diff < 31536000) return `${Math.floor(diff/2592000)} months ago`;
  return `${Math.floor(diff/31536000)} years ago`;
}

const COLORS = ['#c41e3a','#1565c0','#e65100','#1b5e20','#4a148c','#880e4f','#004d40','#0d47a1'];
function avatarColor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h + str.charCodeAt(i)) % COLORS.length;
  return COLORS[h];
}

export default function VideoCard({ video, layout = 'grid' }) {
  const [imgOk, setImgOk] = useState(true);
  const { toggleBookmark, isBookmarked, addToHistory } = useAppStore();
  const bookmarked = isBookmarked(video.videoId);
  const initials = (video.channelTitle||'?')[0].toUpperCase();
  const bgColor = avatarColor(video.channelTitle || '');

  function open() {
    addToHistory(video);
    window.open(video.url, '_blank', 'noopener,noreferrer');
  }

  if (layout === 'short') {
    return (
      <div className={styles.shortCard} onClick={open}>
        <div className={styles.shortThumb}>
          {imgOk
            ? <img src={video.thumbnail} alt={video.title} onError={()=>setImgOk(false)} loading="lazy"/>
            : <div className={styles.thumbFallback} style={{background:bgColor}}>{initials}</div>
          }
          {video.duration > 0 && <span className={styles.shortDur}>{fmtDur(video.duration)}</span>}
        </div>
        <div className={styles.shortInfo}>
          <p className={styles.shortTitle}>{video.title}</p>
          <p className={styles.shortViews}>{fmt(video.views)} views</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      {/* Thumbnail */}
      <div className={styles.thumb} onClick={open}>
        {imgOk
          ? <img src={video.thumbnail} alt={video.title} onError={()=>setImgOk(false)} loading="lazy"/>
          : <div className={styles.thumbFallback} style={{background:bgColor}}>{initials}</div>
        }
        {video.duration > 0 && <span className={styles.duration}>{fmtDur(video.duration)}</span>}
        {video.isShort && <span className={styles.shortBadge}>SHORT</span>}
      </div>

      {/* Meta row */}
      <div className={styles.meta}>
        <div className={styles.chAvatar} style={{background:bgColor}} onClick={open}>
          {initials}
        </div>
        <div className={styles.info}>
          <p className={styles.title} onClick={open} title={video.title}>{video.title}</p>
          <p className={styles.channel}>{video.channelTitle}</p>
          <p className={styles.stats}>
            {fmt(video.views)} views
            {video.publishedAt && <><span className={styles.dot}>•</span>{ago(video.publishedAt)}</>}
          </p>
        </div>
        <button
          className={`${styles.moreBtn}`}
          onClick={e=>{e.stopPropagation(); toggleBookmark(video);}}
          title={bookmarked ? 'Remove bookmark' : 'Save'}
        >
          {bookmarked
            ? <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
            : <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 14.82l-5-2.14-5 2.14V5h10v12.82z"/></svg>
          }
        </button>
      </div>
    </div>
  );
}
