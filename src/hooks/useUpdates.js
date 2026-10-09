import { useState, useEffect, useCallback } from 'react';
import { getUpdates } from '../services/updateService';

export function useUpdates() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshUpdates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUpdates();
      setUpdates(data);
    } catch (err) {
      console.error('Failed to load store updates:', err);
      setError(err.message || 'Failed to load updates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUpdates();

    const handleUpdatesUpdated = () => {
      refreshUpdates();
    };

    window.addEventListener('7days_updates_updated', handleUpdatesUpdated);
    return () => {
      window.removeEventListener('7days_updates_updated', handleUpdatesUpdated);
    };
  }, [refreshUpdates]);

  return {
    updates,
    loading,
    error,
    refreshUpdates,
  };
}
