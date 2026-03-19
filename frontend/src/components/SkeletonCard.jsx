import styles from './SkeletonCard.module.css';
export default function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={`${styles.thumb} shimmer`}/>
      <div className={styles.body}>
        <div className={`${styles.avatar} shimmer`}/>
        <div className={styles.lines}>
          <div className={`${styles.line} shimmer`}/>
          <div className={`${styles.lineShort} shimmer`}/>
          <div className={`${styles.lineXs} shimmer`}/>
        </div>
      </div>
    </div>
  );
}
