import { useState, useEffect, useCallback, useRef } from 'react';
import { getHeroShowcase, getLocalHeroShowcase, saveHeroShowcase, updateHeroSlot, resetHeroShowcase } from '../services/heroShowcaseService';
import { initialHeroShowcase } from '../data/heroShowcase';

export function useHeroShowcase() {
  const [slots, setSlots] = useState(() => getLocalHeroShowcase() || initialHeroShowcase);
  const [loading, setLoading] = useState(false);
  const isFetchingRef = useRef(false);

  const loadSlots = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const data = await getHeroShowcase();
      setSlots(data);
    } catch (err) {
      console.error('Failed to load hero showcase:', err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadSlots();

    const handleUpdate = () => {
      const local = getLocalHeroShowcase();
      if (local) {
        setSlots(local);
      }
    };

    window.addEventListener('7days_hero_updated', handleUpdate);
    return () => {
      window.removeEventListener('7days_hero_updated', handleUpdate);
    };
  }, [loadSlots]);

  const updateSlot = useCallback(async (slotNumber, data) => {
    const updated = await updateHeroSlot(slotNumber, data);
    setSlots(updated);
    return updated;
  }, []);

  const saveAll = useCallback(async (newSlots) => {
    const updated = await saveHeroShowcase(newSlots);
    setSlots(updated);
    return updated;
  }, []);

  const resetAll = useCallback(async () => {
    const updated = await resetHeroShowcase();
    setSlots(updated);
    return updated;
  }, []);

  return {
    slots,
    loading,
    updateSlot,
    saveAll,
    resetAll,
    refresh: loadSlots
  };
}
