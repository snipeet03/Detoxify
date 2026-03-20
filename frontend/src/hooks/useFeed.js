import { useState } from 'react';
import { feedApi } from '../services/api';
import { useAppStore } from '../store/useAppStore';

export function useFeed() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const { setFeedResults }    = useAppStore();

  async function generate(query) {
    setLoading(true);
    setError(null);
    try {
      const response = await feedApi.generate(query);
      if (!response.success) throw new Error(response.message || 'Failed to generate feed');
      setFeedResults(response.data, query);
      return response.data;
    } catch (err) {
      const msg = err.message || 'Failed to generate feed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { generate, loading, error };
}
