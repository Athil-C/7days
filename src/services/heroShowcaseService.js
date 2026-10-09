import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { initialHeroShowcase } from '../data/heroShowcase';

const HERO_STORAGE_KEY = '7days_hero_showcase_v1';

/**
 * Get hero showcase items from LocalStorage
 */
function getLocalHeroShowcase() {
  try {
    const raw = localStorage.getItem(HERO_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === 3) {
      return parsed;
    }
    return null;
  } catch (err) {
    console.error('Failed to parse local hero showcase:', err);
    return null;
  }
}

/**
 * Save hero showcase items to LocalStorage
 */
function saveLocalHeroShowcase(slots) {
  try {
    localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(slots));
    // Broadcast change so open components update immediately
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('7days_hero_updated'));
    }
  } catch (err) {
    console.error('Failed to save local hero showcase:', err);
  }
}

/**
 * Fetch all 3 Hero Showcase slots
 */
export async function getHeroShowcase() {
  // 1. If Supabase is configured, attempt fetch from database
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('hero_showcase')
        .select('*')
        .order('slot', { ascending: true });

      if (!error && data && data.length === 3) {
        const mapped = data.map((item) => ({
          slot: item.slot,
          slotLabel: item.slot_label || `Slot ${item.slot}`,
          tag: item.tag || '',
          title: item.title,
          subtitle: item.subtitle || '',
          image: item.image,
          productId: item.product_id || null,
        }));
        // Sync local storage mirror
        saveLocalHeroShowcase(mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase hero_showcase fetch failed, falling back:', err);
    }
  }

  // 2. Fall back to LocalStorage
  const local = getLocalHeroShowcase();
  if (local) {
    return local;
  }

  // 3. Fall back to default static items
  saveLocalHeroShowcase(initialHeroShowcase);
  return initialHeroShowcase;
}

/**
 * Save all 3 Hero Showcase slots
 */
export async function saveHeroShowcase(slots) {
  if (!Array.isArray(slots) || slots.length !== 3) {
    throw new Error('Hero showcase must contain exactly 3 slots');
  }

  // Always save to LocalStorage for instant response
  saveLocalHeroShowcase(slots);

  // If Supabase is configured, upsert into database
  if (isSupabaseConfigured) {
    try {
      const dbPayload = slots.map((s) => ({
        slot: s.slot,
        slot_label: s.slotLabel || `Slot ${s.slot}`,
        tag: s.tag || '',
        title: s.title,
        subtitle: s.subtitle || '',
        image: s.image,
        product_id: s.productId ? String(s.productId) : null,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('hero_showcase')
        .upsert(dbPayload, { onConflict: 'slot' });

      if (error) {
        console.warn('Failed to upsert hero_showcase in Supabase:', error);
      }
    } catch (err) {
      console.warn('Supabase upsert error:', err);
    }
  }

  return slots;
}

/**
 * Update a single Hero slot (1, 2, or 3)
 */
export async function updateHeroSlot(slotNumber, partialData) {
  const current = await getHeroShowcase();
  const updated = current.map((item) => {
    if (item.slot === Number(slotNumber)) {
      return { ...item, ...partialData };
    }
    return item;
  });
  return await saveHeroShowcase(updated);
}

/**
 * Reset Hero Showcase to factory default
 */
export async function resetHeroShowcase() {
  return await saveHeroShowcase(initialHeroShowcase);
}
