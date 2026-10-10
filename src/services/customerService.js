/**
 * 7Days Toys & Babyshop - Customer Directory & WhatsApp Broadcast Service
 * Stores customer contact numbers, names, tags, and broadcast history.
 * Supports LocalStorage caching with Supabase table sync fallback.
 */

import { SHOP_FULL_NAME, SHOP_PHONE_DISPLAY, SHOP_ADDRESS } from '../data/config';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY_CUSTOMERS = '7days_customers_directory_v1';
const STORAGE_KEY_BROADCAST_HISTORY = '7days_broadcast_history_v1';

// Empty starter customer directory (starts fresh)
const DEFAULT_CUSTOMERS = [];

/**
 * Format phone number for WhatsApp direct link (international 12-digit Indian format)
 */
export function formatPhoneNumberForWhatsApp(phone) {
  if (!phone) return '';
  let cleaned = String(phone).replace(/[^0-9]/g, '');
  // If starts with 0, remove leading 0
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  // If 10 digits (standard Indian mobile), prepend 91
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  return cleaned;
}

/**
 * Generate direct WhatsApp Web / App chat URL with pre-filled message
 */
export function createCustomerWhatsAppUrl(phone, message = '') {
  const cleanPhone = formatPhoneNumberForWhatsApp(phone);
  const encodedText = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
}

/**
 * Format dynamic promotional broadcast message for a product
 */
export function formatProductBroadcastMessage(product, customHeader = '') {
  if (!product) return '';

  const siteOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://7daystoys.in';
  const productUrl = `${siteOrigin}/product/${product.id}`;
  
  const title = product.name || 'New Arrival at 7Days Toys!';
  const price = product.price ? `₹${Number(product.price).toLocaleString('en-IN')}` : '';
  const mrp = product.mrp && product.mrp > product.price ? `₹${Number(product.mrp).toLocaleString('en-IN')}` : '';
  const category = product.category || 'Kids Product';

  let discountText = '';
  if (product.price && product.mrp && product.mrp > product.price) {
    const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);
    discountText = ` (${off}% OFF Special Offer)`;
  }

  let text = `🧸 *${SHOP_FULL_NAME} - NEW ARRIVAL ALERT!* ✨\n\n`;

  if (customHeader && customHeader.trim()) {
    text += `${customHeader.trim()}\n\n`;
  }

  text += `🛍️ *Product:* ${title}\n`;
  text += `🏷️ *Category:* ${category}\n`;
  
  if (price) {
    text += `💰 *Offer Price:* ${price}${discountText}\n`;
    if (mrp) {
      text += `🏷️ *MRP:* ~${mrp}~\n`;
    }
  }

  if (product.badge) {
    text += `⭐ *Highlight:* ${product.badge}\n`;
  }

  if (product.description) {
    const cleanDesc = product.description.length > 140 
      ? product.description.substring(0, 137) + '...'
      : product.description;
    text += `📝 *Details:* ${cleanDesc}\n`;
  }

  text += `\n🔗 *View Photos & Full Specs Here:*\n${productUrl}\n\n`;
  text += `📍 *Visit Our Store:* ${SHOP_ADDRESS.short}\n`;
  text += `📞 *Direct WhatsApp Order:* ${SHOP_PHONE_DISPLAY}\n`;
  text += `_Reply to this message to reserve or order for local delivery!_`;

  return text;
}

/**
 * Get all stored customers
 */
export function getCustomers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOMERS);
    if (!raw) {
      return DEFAULT_CUSTOMERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Purge any legacy starter demo customers (cust_1 to cust_5)
      const DEMO_IDS = new Set(['cust_1', 'cust_2', 'cust_3', 'cust_4', 'cust_5']);
      const cleaned = parsed.filter((c) => !DEMO_IDS.has(c.id));
      if (cleaned.length !== parsed.length) {
        saveCustomers(cleaned);
      }
      return cleaned;
    }
    return DEFAULT_CUSTOMERS;
  } catch {
    return DEFAULT_CUSTOMERS;
  }
}

/**
 * Save all customers to local storage and sync to Supabase database
 */
function saveCustomers(list) {
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOMERS, JSON.stringify(list));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('7days_customers_updated'));
    }
    // Sync to Supabase in background
    if (isSupabaseConfigured && Array.isArray(list)) {
      list.forEach(async (c) => {
        try {
          await supabase.from('customers').upsert({
            id: c.id,
            name: c.name,
            phone: c.phone,
            place: c.place || '',
            tag: c.tag || 'General',
            notes: c.notes || '',
            created_at: c.createdAt || new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
        } catch (e) {
          console.warn('Customer Supabase upsert error:', e);
        }
      });
    }
  } catch (err) {
    console.error('Failed to save customers locally:', err);
  }
}

// Initial sync from Supabase if configured
if (typeof window !== 'undefined' && isSupabaseConfigured) {
  supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })
    .then(({ data, error }) => {
      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped = data.map((item) => ({
          id: item.id,
          name: item.name,
          phone: item.phone,
          place: item.place || '',
          tag: item.tag || 'General',
          notes: item.notes || '',
          createdAt: item.created_at
        }));
        const raw = localStorage.getItem(STORAGE_KEY_CUSTOMERS);
        const local = raw ? JSON.parse(raw) : [];
        const merged = [...mapped, ...local.filter((l) => !mapped.some((m) => m.id === l.id))];
        localStorage.setItem(STORAGE_KEY_CUSTOMERS, JSON.stringify(merged));
        window.dispatchEvent(new Event('7days_customers_updated'));
      }
    });
}

/**
 * Add a new customer contact
 */
export function addCustomer({ name, phone, place = '', tag = 'General', notes = '' }) {
  if (!phone || !phone.trim()) {
    throw new Error('Phone number is required');
  }
  const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
  if (cleanPhone.length < 10) {
    throw new Error('Please enter a valid 10-digit mobile number');
  }

  const list = getCustomers();
  const newCustomer = {
    id: `cust_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    name: name?.trim() || `Customer ${cleanPhone.slice(-4)}`,
    phone: cleanPhone,
    place: place?.trim() || '',
    tag: tag?.trim() || 'General',
    notes: notes?.trim() || '',
    createdAt: new Date().toISOString()
  };

  const updated = [newCustomer, ...list];
  saveCustomers(updated);
  return newCustomer;
}

/**
 * Update an existing customer contact
 */
export function updateCustomer(id, partial) {
  const list = getCustomers();
  const updated = list.map((c) => (c.id === id ? { ...c, ...partial } : c));
  saveCustomers(updated);
  return updated.find((c) => c.id === id);
}

/**
 * Delete a customer contact
 */
export function deleteCustomer(id) {
  const list = getCustomers();
  const updated = list.filter((c) => c.id !== id);
  saveCustomers(updated);
  if (isSupabaseConfigured) {
    supabase.from('customers').delete().eq('id', id).then();
  }
  return updated;
}

/**
 * Bulk import customer contacts from text (comma separated, new line separated, or "Name: Number" format)
 */
export function importBulkCustomers(text) {
  if (!text || !text.trim()) return { added: 0, skipped: 0 };

  const lines = text.split(/[\r\n,;]+/);
  const currentList = getCustomers();
  const existingPhones = new Set(currentList.map((c) => c.phone.slice(-10)));

  const newCustomers = [];
  let skipped = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Check if line contains a name and phone e.g. "Muhammed - 9847111222" or "9847111222"
    let name = '';
    let phone = '';
    let place = '';

    if (line.includes(':') || line.includes('-')) {
      const parts = line.split(/[:-]/);
      name = parts[0]?.trim();
      phone = parts[1]?.trim().replace(/[^0-9]/g, '');
    } else {
      phone = line.replace(/[^0-9]/g, '');
      name = '';
    }

    if (phone.length >= 10) {
      const standard10 = phone.slice(-10);
      if (!existingPhones.has(standard10)) {
        existingPhones.add(standard10);
        newCustomers.push({
          id: `cust_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          name: name || `Customer ${standard10.slice(-4)}`,
          phone: standard10,
          place: place || 'Wayand / Kerala',
          tag: 'Imported',
          notes: 'Bulk imported',
          createdAt: new Date().toISOString()
        });
      } else {
        skipped++;
      }
    } else {
      skipped++;
    }
  }

  if (newCustomers.length > 0) {
    const updated = [...newCustomers, ...currentList];
    saveCustomers(updated);
  }

  return { added: newCustomers.length, skipped };
}

/**
 * Get Broadcast History logs
 */
export function getBroadcastHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BROADCAST_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Record a broadcast action for customer
 */
export function logCustomerBroadcast(customerId, productId) {
  try {
    const history = getBroadcastHistory();
    const logItem = {
      id: `bc_${Date.now()}`,
      customerId,
      productId,
      timestamp: new Date().toISOString()
    };
    const updated = [logItem, ...history.slice(0, 200)];
    localStorage.setItem(STORAGE_KEY_BROADCAST_HISTORY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

/**
 * Export all customers as a .vcf (vCard) file
 * Allows 1-click import into phone contacts to instantly create a 256-customer WhatsApp Broadcast list!
 */
export function exportCustomersAsVcf(customersList) {
  const list = customersList || getCustomers();
  if (!list || list.length === 0) return false;

  let vcf = '';
  list.forEach((c) => {
    const cleanPhone = formatPhoneNumberForWhatsApp(c.phone);
    vcf += `BEGIN:VCARD\r\nVERSION:3.0\r\nFN:7Days - ${c.name}\r\nN:${c.name};;;;\r\nTEL;TYPE=CELL,VOICE:+${cleanPhone}\r\nNOTE:${c.place || ''} - ${c.tag || ''}\r\nEND:VCARD\r\n`;
  });

  const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `7Days_Customer_Contacts_${new Date().toISOString().split('T')[0]}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}

