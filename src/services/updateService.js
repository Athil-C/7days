import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { storeUpdates as staticUpdates } from '../data/updates';
import { uploadImage } from './productService';

const UPDATES_STORAGE_KEY = '7days_store_updates_master_v2';
const LEGACY_STORAGE_KEY = '7days_custom_updates_v1';

/**
 * Get the full persistent list of announcements from localStorage
 */
function getStoredUpdates() {
  try {
    const raw = localStorage.getItem(UPDATES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // Check legacy storage
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      const legacyParsed = JSON.parse(legacyRaw);
      if (Array.isArray(legacyParsed) && legacyParsed.length > 0) {
        // Merge legacy custom items with static items
        const merged = [...legacyParsed, ...staticUpdates];
        localStorage.setItem(UPDATES_STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
    }

    // Default initialization: Clone default showroom updates
    const initialList = staticUpdates.map((item, idx) => ({
      ...item,
      id: String(item.id || `upd_init_${idx + 1}`),
      source: 'showroom',
    }));
    localStorage.setItem(UPDATES_STORAGE_KEY, JSON.stringify(initialList));
    return initialList;
  } catch (err) {
    console.warn('Error reading stored updates, using static fallback:', err);
    return staticUpdates.map((item, idx) => ({
      ...item,
      id: String(item.id || `upd_init_${idx + 1}`),
    }));
  }
}

/**
 * Persist the full announcements list and broadcast live event
 */
function saveStoredUpdates(list) {
  try {
    localStorage.setItem(UPDATES_STORAGE_KEY, JSON.stringify(list));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('7days_updates_updated'));
    }
  } catch (err) {
    console.warn('Storage quota warning saving updates, trimming older items:', err);
    try {
      const trimmed = list.slice(0, 10);
      localStorage.setItem(UPDATES_STORAGE_KEY, JSON.stringify(trimmed));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('7days_updates_updated'));
      }
    } catch (e2) {
      console.error('Critical storage error saving updates:', e2);
    }
  }
}

function mapDbUpdate(item) {
  return {
    id: String(item.id),
    title: item.title || '',
    titleMalayalam: item.title_malayalam || '',
    category: item.category || 'Store Notice',
    badge: item.badge || 'Store Notice',
    badgeColor: item.badge_color || 'bg-red-600',
    date: item.date || 'Available Now',
    bannerImage: item.banner_image || '/updates/7days-care-service.jpg',
    description: item.description || '',
    highlights: Array.isArray(item.highlights)
      ? item.highlights
      : (item.highlights ? String(item.highlights).split('\n').map((s) => s.trim()).filter(Boolean) : []),
    whatsappMessage: item.whatsapp_message || '',
    isFeatured: Boolean(item.is_featured),
    createdAt: item.created_at,
    source: 'database',
  };
}

/**
 * Fetch all updates (Supabase or local persistent store)
 */
export async function getUpdates() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('updates')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(mapDbUpdate);
      }
      if (error) {
        console.warn('Supabase updates fetch notice:', error.message);
      }
    } catch (err) {
      console.warn('Error fetching updates from Supabase, using local fallback:', err);
    }
  }

  return getStoredUpdates();
}

/**
 * Add a new store announcement
 */
export async function addUpdate(params) {
  const {
    title,
    titleMalayalam = '',
    category = 'Store Notice',
    badge = 'Store Notice',
    badgeColor = 'bg-red-600',
    date = 'Available Now',
    bannerFile = null,
    bannerImageUrl = '',
    bannerImage = '',
    description = '',
    highlights = [],
    whatsappMessage = '',
    isFeatured = true,
  } = params || {};

  let finalBannerUrl = bannerImageUrl || bannerImage;
  if (bannerFile) {
    try {
      finalBannerUrl = await uploadImage(bannerFile, 'updates');
    } catch (err) {
      console.warn('Banner upload notice:', err);
    }
  }

  // Safe fallback banner so creation never fails
  if (!finalBannerUrl) {
    finalBannerUrl = '/updates/7days-care-service.jpg';
  }

  const cleanHighlights = Array.isArray(highlights)
    ? highlights
    : String(highlights || '').split('\n').map((h) => h.trim()).filter(Boolean);

  const newId = `upd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const newUpdate = {
    id: newId,
    title: (title || 'Store Announcement').trim(),
    titleMalayalam: titleMalayalam || '',
    category: category || 'Store Notice',
    badge: badge || 'Store Notice',
    badgeColor: badgeColor || 'bg-red-600',
    date: date || 'Available Now',
    bannerImage: finalBannerUrl,
    description: description || '',
    highlights: cleanHighlights,
    whatsappMessage: whatsappMessage || `Hi 7Days Toys, I would like to inquire about: ${title || 'Store Announcement'}`,
    isFeatured: Boolean(isFeatured),
    createdAt: new Date().toISOString(),
    source: 'local',
  };

  // Supabase sync if enabled
  if (isSupabaseConfigured) {
    try {
      const payload = {
        title: newUpdate.title,
        title_malayalam: newUpdate.titleMalayalam,
        category: newUpdate.category,
        badge: newUpdate.badge,
        badge_color: newUpdate.badgeColor,
        date: newUpdate.date,
        banner_image: newUpdate.bannerImage,
        description: newUpdate.description,
        highlights: newUpdate.highlights,
        whatsapp_message: newUpdate.whatsappMessage,
        is_featured: newUpdate.isFeatured,
      };

      const { data, error } = await supabase
        .from('updates')
        .insert([payload])
        .select()
        .single();

      if (!error && data) {
        const mapped = mapDbUpdate(data);
        const current = getStoredUpdates();
        saveStoredUpdates([mapped, ...current]);
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase insert notice, saving locally:', err);
    }
  }

  // Local persistence
  const current = getStoredUpdates();
  const updatedList = [newUpdate, ...current];
  saveStoredUpdates(updatedList);
  return newUpdate;
}

export const createUpdate = addUpdate;

/**
 * Update an existing store update
 */
export async function updateUpdate(id, updates, newBannerFile = null) {
  let finalBannerUrl = updates.bannerImage || updates.bannerImageUrl;
  if (newBannerFile) {
    try {
      finalBannerUrl = await uploadImage(newBannerFile, 'updates');
    } catch (err) {
      console.warn('Banner upload notice on edit:', err);
    }
  }

  const cleanHighlights = Array.isArray(updates.highlights)
    ? updates.highlights
    : (updates.highlights ? String(updates.highlights).split('\n').map((h) => h.trim()).filter(Boolean) : []);

  // Supabase sync if enabled
  if (isSupabaseConfigured && typeof id === 'string' && !id.startsWith('upd_') && !id.startsWith('local_')) {
    try {
      const payload = {
        title: updates.title,
        title_malayalam: updates.titleMalayalam || '',
        category: updates.category || 'Store Notice',
        badge: updates.badge || 'Store Notice',
        badge_color: updates.badgeColor || 'bg-red-600',
        date: updates.date || 'Available Now',
        banner_image: finalBannerUrl || updates.bannerImage,
        description: updates.description || '',
        highlights: cleanHighlights,
        whatsapp_message: updates.whatsappMessage || '',
        is_featured: Boolean(updates.isFeatured),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('updates')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        const mapped = mapDbUpdate(data);
        const current = getStoredUpdates();
        const updatedList = current.map((u) => String(u.id) === String(id) ? mapped : u);
        saveStoredUpdates(updatedList);
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase update notice, saving locally:', err);
    }
  }

  // Local storage update
  const current = getStoredUpdates();
  let found = false;
  const updatedList = current.map((u) => {
    if (String(u.id) === String(id)) {
      found = true;
      return {
        ...u,
        ...updates,
        bannerImage: finalBannerUrl || u.bannerImage,
        highlights: cleanHighlights,
        updatedAt: new Date().toISOString(),
      };
    }
    return u;
  });

  if (!found) {
    // If not found in current list, insert as new
    const fresh = {
      id: String(id),
      ...updates,
      bannerImage: finalBannerUrl || '/updates/7days-care-service.jpg',
      highlights: cleanHighlights,
      updatedAt: new Date().toISOString(),
    };
    updatedList.unshift(fresh);
  }

  saveStoredUpdates(updatedList);
  return { id: String(id), ...updates, bannerImage: finalBannerUrl || updates.bannerImage };
}

/**
 * Delete a store update by ID
 */
export async function deleteUpdate(id, bannerImageUrl = null) {
  // Supabase delete if applicable
  if (isSupabaseConfigured && typeof id === 'string' && !id.startsWith('upd_') && !id.startsWith('local_')) {
    try {
      await supabase.from('updates').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }
  }

  // Local storage delete
  const current = getStoredUpdates();
  const filtered = current.filter((u) => String(u.id) !== String(id));
  saveStoredUpdates(filtered);
  return true;
}
