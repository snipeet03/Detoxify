import { useState, useEffect, useRef } from 'react';
import styles from './AddCardModal.module.css';

/**
 * AddCardModal — overlay modal for adding a new topic card.
 *
 * Props:
 *   isOpen       {boolean}
 *   onClose      {function}   called when modal should close
 *   onAdd        {function}   async (keyword) => { success, error }
 *   currentCount {number}     number of existing cards
 *   maxCards     {number}     default 15
 */
export default function AddCardModal({
  isOpen,
  onClose,
  onAdd,
  currentCount = 0,
  maxCards = 15,
}) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setInput('');
      setError('');
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) { setError('Please enter a keyword'); return; }

    setSubmitting(true);
    setError('');
    const result = await onAdd(trimmed);
    setSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Something went wrong');
    }
  }

  if (!isOpen) return null;

  const atLimit = currentCount >= maxCards;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Add new topic card"
      >
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Add Topic Card</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {atLimit ? (
          <p className={styles.limitMsg}>
            You've reached the maximum of {maxCards} cards. Remove one to add a new topic.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <p className={styles.hint}>
              Enter a topic keyword (e.g. "Docker", "SQL", "AI Agents")
            </p>

            <div className={styles.inputRow}>
              <input
                ref={inputRef}
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                type="text"
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(''); }}
                placeholder="e.g. Docker"
                maxLength={60}
                disabled={submitting}
              />
            </div>

            {error && <p className={styles.errorMsg}>{error}</p>}

            <div className={styles.footer}>
              <span className={styles.counter}>
                {currentCount} / {maxCards} cards
              </span>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={onClose}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={submitting || !input.trim()}
                >
                  {submitting ? 'Adding…' : '+ Add Card'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
