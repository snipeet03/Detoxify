import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import FeedPage from './pages/FeedPage';
import CreatorsPage from './pages/CreatorsPage';
import NotFoundPage from './pages/NotFoundPage';
import styles from './App.module.css';

export default function App() {
  return (
    <div className={styles.shell}>
      <Header />
      <Sidebar />
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/creators" element={<CreatorsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}
