import styles from './TopicCard.module.css';

// Keyword → emoji icon map
const ICON_MAP = {
  'machine learning': '🤖',
  'web dev': '🌐',
  'web development': '🌐',
  dsa: '🧮',
  'data structures': '🧮',
  'system design': '🏗️',
  python: '🐍',
  react: '⚛️',
  devops: '🐳',
  docker: '🐳',
  kubernetes: '☸️',
  'ai / llms': '🧠',
  'ai/llms': '🧠',
  llms: '🧠',
  javascript: '🟨',
  js: '🟨',
  sql: '🗃️',
  typescript: '📘',
  ts: '📘',
  shorts: '⚡',
  rust: '🦀',
  golang: '🐹',
  go: '🐹',
  java: '☕',
  'c++': '⚙️',
  cpp: '⚙️',
  cloud: '☁️',
  aws: '☁️',
  gcp: '☁️',
  azure: '☁️',
  blockchain: '🔗',
  crypto: '🔗',
  cybersecurity: '🔐',
  security: '🔐',
  'ui/ux': '🎨',
  design: '🎨',
  flutter: '💙',
  'react native': '📱',
  android: '🤖',
  ios: '🍎',
  swift: '🍎',
  database: '🗄️',
  mongodb: '🍃',
  postgresql: '🐘',
  graphql: '💜',
  api: '🔌',
  testing: '🧪',
  junit: '🧪',
  linux: '🐧',
  'open source': '🔓',
  git: '🔀',
  'data science': '📊',
};

function getIcon(label) {
  const key = label.toLowerCase();
  // Direct match
  if (ICON_MAP[key]) return ICON_MAP[key];
  // Partial match — check if any icon key appears in the label
  for (const [k, icon] of Object.entries(ICON_MAP)) {
    if (key.includes(k)) return icon;
  }
  return '📚';
}

/**
 * TopicCard — a single clickable topic tile.
 * Props:
 *   label     {string}   the card keyword
 *   onClick   {function} called when user clicks the card
 *   index     {number}   used for staggered animation delay
 */
export default function TopicCard({ label, onClick, index = 0 }) {
  return (
    <button
      className={styles.card}
      onClick={() => onClick(label)}
      style={{ animationDelay: `${index * 40}ms` }}
      title={label}
    >
      <span className={styles.icon}>{getIcon(label)}</span>
      <span className={styles.label}>{label}</span>
    </button>
  );
}
