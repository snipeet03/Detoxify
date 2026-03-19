import { useState, useEffect, useCallback } from 'react';
import { cardsApi } from '../services/api';
import { useAppStore } from '../store/useAppStore';

const MAX_CARDS = 15;

/**
 * useCards — manages the user's personalized topic cards.
 *
 * - Fetches cards from /api/user/cards on mount (if logged in)
 * - Provides addCard with optimistic update + rollback on error
 * - Syncs state to useAppStore (persisted)
 */
export function useCards() {
  const { user, userCards, setUserCards, addUserCard } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cards from backend on mount
  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setLoading(true);

    cardsApi
      .getCards()
      .then((res) => {
        if (!cancelled) {
          setUserCards(res.cards);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, setUserCards]);

  /**
   * addCard — validates client-side then calls API with optimistic update.
   * Returns { success: boolean, error?: string }
   */
  const addCard = useCallback(
    async (keyword) => {
      const trimmed = (keyword || '').trim();

      // ── Client-side validation ──────────────────────────
      if (!trimmed) return { success: false, error: 'Keyword cannot be empty' };

      const isDuplicate = userCards.some(
        (c) => c.toLowerCase() === trimmed.toLowerCase()
      );
      if (isDuplicate) {
        return { success: false, error: `"${trimmed}" is already in your cards` };
      }

      if (userCards.length >= MAX_CARDS) {
        return { success: false, error: `Maximum of ${MAX_CARDS} cards reached` };
      }

      // ── Optimistic update ───────────────────────────────
      addUserCard(trimmed);
      setAddLoading(true);

      try {
        const res = await cardsApi.addCard(trimmed);
        // Sync with server response to stay consistent
        setUserCards(res.cards);
        return { success: true };
      } catch (err) {
        // Rollback: remove the optimistically added card
        setUserCards(userCards); // restore previous state
        return { success: false, error: err.message };
      } finally {
        setAddLoading(false);
      }
    },
    [userCards, addUserCard, setUserCards]
  );

  return {
    cards: userCards,
    loading,
    addLoading,
    error,
    addCard,
    isLoggedIn: !!user,
  };
}
