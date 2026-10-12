import React, { useState, useMemo, useEffect } from 'react';
import {
  MessageCircle,
  Send,
  Users,
  UserPlus,
  Search,
  Plus,
  Trash2,
  Copy,
  Check,
  Download,
  ExternalLink,
  Sparkles,
  Phone,
  Tag,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  FileDown,
  Layers,
  Image as ImageIcon,
  Share2,
  Play,
  Pause,
  Square,
  Zap,
  BookOpen
} from 'lucide-react';
import {
  getCustomers,
  addCustomer,
  deleteCustomer,
  importBulkCustomers,
  formatProductBroadcastMessage,
  createCustomerWhatsAppUrl,
  logCustomerBroadcast,
  formatPhoneNumberForWhatsApp,
  exportCustomersAsVcf
} from '../../services/customerService';
import { SHOP_FULL_NAME, SHOP_PHONE_DISPLAY } from '../../data/config';
import { getProductUrl } from '../../utils/productUrl';

export default function CustomerBroadcastManager({
  products = [],
  selectedProductId = null,
  showNotice
}) {
  // Navigation tabs: 'broadcast' (Dispatch Hub) | 'customers' (Manage Directory)
  const [activeSubTab, setActiveSubTab] = useState('broadcast');

  // Customer state
  const [customers, setCustomers] = useState(() => getCustomers());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  // New customer form states
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPlace, setNewPlace] = useState('');
  const [newTag, setNewTag] = useState('Regular Customer');
  const [newNotes, setNewNotes] = useState('');

  // Bulk import state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkResult, setBulkResult] = useState(null);

  // Broadcast Product selection
  const [activeProduct, setActiveProduct] = useState(() => {
    if (selectedProductId) {
      const found = products.find((p) => p.id === selectedProductId);
      if (found) return found;
    }
    return products[0] || null;
  });

  // When selectedProductId prop updates from outside (e.g. Products list "Broadcast" click)
  useEffect(() => {
    if (selectedProductId && products.length > 0) {
      const found = products.find((p) => p.id === selectedProductId);
      if (found) {
        setActiveProduct(found);
        setActiveSubTab('broadcast');
      }
    }
  }, [selectedProductId, products]);

  // Promotional custom header note
  const [customHeader, setCustomHeader] = useState(
    '🔥 *New Stock Arrived at 7Days Toys! Limited pieces available.*'
  );

  // Sent status tracking per customer for current session
  const [sentCustomerIds, setSentCustomerIds] = useState(new Set());
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedNumbers, setCopiedNumbers] = useState(false);

  // Queue runner pointer
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);

  // Auto-Pilot state: automatically sends to each customer one by one without manual clicking
  const [isAutoPilotActive, setIsAutoPilotActive] = useState(false);
  const [autoPilotCountdown, setAutoPilotCountdown] = useState(3);

  // Listen for external customer updates
  useEffect(() => {
    const handleUpdate = () => {
      setCustomers(getCustomers());
    };
    window.addEventListener('7days_customers_updated', handleUpdate);
    return () => window.removeEventListener('7days_customers_updated', handleUpdate);
  }, []);

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (selectedTag !== 'All' && c.tag !== selectedTag) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          (c.place && c.place.toLowerCase().includes(q)) ||
          (c.tag && c.tag.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [customers, selectedTag, searchQuery]);

  // Unique tags for filter dropdown
  const allTags = useMemo(() => {
    const set = new Set(customers.map((c) => c.tag).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [customers]);

  // Dynamic formatted WhatsApp message text
  const formattedBroadcastMessage = useMemo(() => {
    if (!activeProduct) return '';
    return formatProductBroadcastMessage(activeProduct, customHeader);
  }, [activeProduct, customHeader]);

  // Next recipient in queue
  const pendingCustomers = useMemo(() => {
    return filteredCustomers.filter((c) => !sentCustomerIds.has(c.id));
  }, [filteredCustomers, sentCustomerIds]);

  const currentTargetCustomer = pendingCustomers[0] || null;

  // Add customer handler
  const handleAddCustomer = (e) => {
    e.preventDefault();
    try {
      addCustomer({
        name: newName,
        phone: newPhone,
        place: newPlace,
        tag: newTag,
        notes: newNotes
      });
      setNewName('');
      setNewPhone('');
      setNewPlace('');
      setNewNotes('');
      showNotice?.('success', 'Customer contact saved successfully!');
    } catch (err) {
      showNotice?.('error', err.message || 'Failed to add customer');
    }
  };

  // Delete customer handler
  const handleDeleteCustomer = (id, name) => {
    if (window.confirm(`Are you sure you want to remove ${name} from customer list?`)) {
      deleteCustomer(id);
      showNotice?.('success', 'Customer removed');
    }
  };

  // Bulk import handler
  const handleBulkImport = () => {
    if (!bulkText.trim()) {
      showNotice?.('error', 'Please paste numbers to import');
      return;
    }
    const res = importBulkCustomers(bulkText);
    setBulkResult(res);
    setBulkText('');
    showNotice?.('success', `Imported ${res.added} new customer numbers!`);
  };

  // Copy full message
  const handleCopyMessage = () => {
    if (!formattedBroadcastMessage) return;
    navigator.clipboard.writeText(formattedBroadcastMessage);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2500);
    showNotice?.('success', 'WhatsApp message copied to clipboard!');
  };

  // Copy comma-separated phone numbers for WhatsApp Broadcast list
  const handleCopyAllNumbers = () => {
    const numbers = filteredCustomers.map((c) => formatPhoneNumberForWhatsApp(c.phone)).join(', ');
    navigator.clipboard.writeText(numbers);
    setCopiedNumbers(true);
    setTimeout(() => setCopiedNumbers(false), 2500);
    showNotice?.('success', `Copied ${filteredCustomers.length} numbers to clipboard!`);
  };

  // Direct send to a specific customer
  const handleSendToCustomer = (customer) => {
    if (!activeProduct) return;
    const url = createCustomerWhatsAppUrl(customer.phone, formattedBroadcastMessage);
    logCustomerBroadcast(customer.id, activeProduct.id);
    setSentCustomerIds((prev) => new Set([...prev, customer.id]));
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Queue: send to next pending customer
  const handleSendToNextCustomer = () => {
    if (!currentTargetCustomer) return;
    handleSendToCustomer(currentTargetCustomer);
  };

  // Auto-Pilot timer effect: continuously sends to customers automatically
  useEffect(() => {
    let timer;
    if (isAutoPilotActive) {
      if (pendingCustomers.length === 0) {
        setIsAutoPilotActive(false);
        showNotice?.('success', 'Auto-Pilot finished! Broadcast dispatched to all customers.');
        return;
      }

      timer = setInterval(() => {
        setAutoPilotCountdown((prev) => {
          if (prev <= 1) {
            // Trigger send for current customer
            const nextCustomer = pendingCustomers[0];
            if (nextCustomer) {
              handleSendToCustomer(nextCustomer);
            }
            return 3;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setAutoPilotCountdown(3);
    }

    return () => clearInterval(timer);
  }, [isAutoPilotActive, pendingCustomers, activeProduct, formattedBroadcastMessage]);

  // Native Multi-Share to WhatsApp (Send to WhatsApp Broadcast List / All contacts in 1 click)
  const handleNativeShare = async () => {
    if (!activeProduct) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${SHOP_FULL_NAME} - ${activeProduct.name}`,
          text: formattedBroadcastMessage,
          url: `${window.location.origin}${getProductUrl(activeProduct)}`
        });
        showNotice?.('success', 'WhatsApp opened! Select your broadcast list or contacts to send in 1 click.');
      } else {
        navigator.clipboard.writeText(formattedBroadcastMessage);
        window.open('https://web.whatsapp.com', '_blank');
        showNotice?.('success', 'Message copied! Paste in your WhatsApp Broadcast List.');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        navigator.clipboard.writeText(formattedBroadcastMessage);
        showNotice?.('info', 'Message copied to clipboard.');
      }
    }
  };

  // 1-Click VCF (Contacts) Download for WhatsApp Broadcast Lists
  const handleDownloadVcf = () => {
    exportCustomersAsVcf(filteredCustomers);
    showNotice?.('success', `Exported ${filteredCustomers.length} customer contacts as 7Days_Customers.vcf!`);
  };

  // Reset sent session
  const handleResetSession = () => {
    setIsAutoPilotActive(false);
    setSentCustomerIds(new Set());
    showNotice?.('success', 'Broadcast session reset. Ready to send again.');
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* TOP HEADER & METRICS                                      */}
      {/* ========================================================= */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight font-heading">
              WhatsApp Broadcast &amp; Customer Contacts
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
            Save customer phone numbers and send newly arrived toy photos, specs, pricing, and purchase links directly to customers on WhatsApp in 1-click.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1.5 bg-gray-100 rounded-xl self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('broadcast')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'broadcast'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-[#25D366]" />
            <span>📢 1-Click Broadcast</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('customers')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'customers'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#0284c7]" />
            <span>👥 Customer List ({customers.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: 1-CLICK PRODUCT BROADCAST DISPATCH HUB             */}
      {/* ========================================================= */}
      {activeSubTab === 'broadcast' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: PRODUCT SELECTION & LIVE MESSAGE PREVIEW */}
          <div className="xl:col-span-5 space-y-5">
            {/* Card 1: Select Product to Broadcast */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-gray-700">
                  Step 1: Choose Product
                </span>
                <span className="text-[10px] font-bold text-gray-400">
                  {products.length} catalog items
                </span>
              </div>

              {/* Product Selector Dropdown */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Select Product to Announce:
                </label>
                <select
                  value={activeProduct?.id || ''}
                  onChange={(e) => {
                    const found = products.find((p) => p.id === e.target.value);
                    if (found) setActiveProduct(found);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-800 focus:ring-2 focus:ring-[#25D366] outline-none bg-white cursor-pointer"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.price ? `— ₹${p.price}` : ''} ({p.category || 'Toys'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Product Miniature Card */}
              {activeProduct && (
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-start gap-3.5">
                  <div className="w-20 h-20 rounded-xl bg-white border border-gray-200 overflow-hidden shrink-0 relative group">
                    <img
                      src={activeProduct.image || '/logo.png'}
                      alt={activeProduct.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=200&q=80';
                      }}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FFB703]/20 text-[#b37d00]">
                        {activeProduct.category || 'General'}
                      </span>
                      {activeProduct.badge && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-red-100 text-red-700">
                          {activeProduct.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-xs text-gray-900 mt-1 truncate">
                      {activeProduct.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {activeProduct.price && (
                        <span className="text-sm font-black text-emerald-700">
                          ₹{Number(activeProduct.price).toLocaleString('en-IN')}
                        </span>
                      )}
                      {activeProduct.mrp && activeProduct.mrp > activeProduct.price && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{Number(activeProduct.mrp).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    {/* Quick photo download button */}
                    {activeProduct.image && (
                      <a
                        href={activeProduct.image}
                        download={`${activeProduct.name.replace(/\s+/g, '_')}.jpg`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-600 hover:text-emerald-700 mt-1.5 transition"
                        title="Click to view/save photo to send along with message"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download Product Photo</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Custom Announcement Header */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Custom Greeting / Promo Note (Optional):
                </label>
                <input
                  type="text"
                  value={customHeader}
                  onChange={(e) => setCustomHeader(e.target.value)}
                  placeholder="e.g. Special Weekend Offer! Only 3 units left."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-[#25D366] outline-none"
                />
              </div>
            </div>

            {/* Card 2: Live WhatsApp Message Bubble Preview */}
            <div className="bg-[#e5ddd5] dark:bg-[#0b141a] p-4 sm:p-5 rounded-2xl border border-gray-300 shadow-inner space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366] fill-[#25D366]" />
                  <span>WhatsApp Message Preview</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="inline-flex items-center gap-1 text-[11px] font-black text-[#00a884] hover:underline cursor-pointer"
                >
                  {copiedMessage ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedMessage ? 'Copied!' : 'Copy Formatted Text'}</span>
                </button>
              </div>

              {/* Chat bubble */}
              <div className="bg-[#d9fdd3] dark:bg-[#005c4b] text-gray-900 dark:text-white p-3.5 rounded-2xl rounded-tl-xs text-xs font-mono whitespace-pre-wrap leading-relaxed shadow-xs max-h-72 overflow-y-auto border border-emerald-200/50">
                {formattedBroadcastMessage}
              </div>

              <p className="text-[10px] text-gray-500 italic text-center">
                ✨ Includes emojis, product title, offer pricing, description, and direct storefront link.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: 1-CLICK BROADCAST DISPATCH RUNNER */}
          <div className="xl:col-span-7 space-y-5">
            {/* Card 1: 1-Click Broadcast Queue Runner */}
            <div className="bg-gradient-to-br from-[#128C7E] via-[#075E54] to-[#054c44] text-white p-5 sm:p-6 rounded-2xl shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-white/15 text-white">
                    <Send className="w-4 h-4" />
                  </span>
                  <div>
                    <h2 className="text-base font-black tracking-wide">
                      1-Click WhatsApp Broadcast Launcher
                    </h2>
                    <p className="text-xs text-emerald-100">
                      Dispatches direct WhatsApp message with full details to saved customers
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetSession}
                  className="text-[11px] text-emerald-200 hover:text-white underline cursor-pointer"
                  title="Reset session counter"
                >
                  Reset Counter
                </button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-100">
                  <span>Progress: {sentCustomerIds.size} of {filteredCustomers.length} sent</span>
                  <span>
                    {filteredCustomers.length > 0
                      ? Math.round((sentCustomerIds.size / filteredCustomers.length) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-black/20 overflow-hidden">
                  <div
                    className="h-full bg-emerald-300 transition-all duration-300 rounded-full"
                    style={{
                      width: `${
                        filteredCustomers.length > 0
                          ? (sentCustomerIds.size / filteredCustomers.length) * 100
                          : 0
                      }%`
                    }}
                  />
                </div>
              </div>

              {/* ========================================================= */}
              {/* PRIMARY OPTION 1: 1-CLICK MULTI-SEND VIA BROADCAST LIST   */}
              {/* ========================================================= */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/25 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-200 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Option 1: Send to All Customers at Once</span>
                  </span>
                  <span className="text-[10px] font-bold bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded-full border border-amber-400/30">
                    Recommended (1-Click)
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-slate-900 px-5 py-3.5 rounded-xl font-black text-sm shadow-md transition cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-slate-900" />
                    <span>📢 Share to WhatsApp Broadcast List (All at Once)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadVcf}
                    className="inline-flex items-center justify-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-4 py-3.5 rounded-xl font-bold text-xs border border-white/30 transition cursor-pointer"
                    title="Download all customer contacts as .vcf to import into phone contacts"
                  >
                    <Download className="w-4 h-4" />
                    <span>📥 Save Contacts (.vcf)</span>
                  </button>
                </div>

                <p className="text-[11px] text-emerald-100 leading-relaxed bg-black/15 p-2.5 rounded-xl border border-white/10">
                  💡 <strong>How it works:</strong> Click <strong>Share</strong> to open WhatsApp on your phone or PC. Select your <em>WhatsApp Broadcast List</em> (or multiple contacts) to deliver this product announcement to all customers at once in 1 click!
                </p>
              </div>

              {/* ========================================================= */}
              {/* PRIMARY OPTION 2: AUTO-PILOT CONTINUOUS SENDER            */}
              {/* ========================================================= */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-200 flex items-center gap-1.5">
                    <RefreshCw className={`w-3.5 h-3.5 ${isAutoPilotActive ? 'animate-spin text-amber-300' : ''}`} />
                    <span>Option 2: Auto-Pilot (Automatically Send One by One)</span>
                  </span>
                  {isAutoPilotActive && (
                    <span className="text-[10px] font-black bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-full animate-pulse">
                      Active: Sending in {autoPilotCountdown}s
                    </span>
                  )}
                </div>

                {currentTargetCustomer ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-black/20 p-3 rounded-xl">
                    <div className="min-w-0 text-center sm:text-left">
                      <span className="text-[10px] font-bold text-emerald-200">
                        Target Customer:
                      </span>
                      <p className="text-sm font-black text-white truncate">
                        {currentTargetCustomer.name} (+91 {currentTargetCustomer.phone})
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {!isAutoPilotActive ? (
                        <button
                          type="button"
                          onClick={() => setIsAutoPilotActive(true)}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2.5 rounded-xl font-black text-xs shadow-md transition cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-slate-950" />
                          <span>🚀 Start Auto-Pilot</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsAutoPilotActive(false)}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl font-black text-xs shadow-md transition cursor-pointer"
                        >
                          <Pause className="w-3.5 h-3.5" />
                          <span>Pause Auto-Pilot</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleSendToNextCustomer}
                        className="inline-flex items-center justify-center gap-1.5 bg-white text-slate-900 hover:bg-gray-100 px-3.5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
                        title="Send manually to this customer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-slate-900" />
                        <span>Send Now ↗</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2 space-y-1">
                    <CheckCircle2 className="w-7 h-7 text-emerald-300 mx-auto" />
                    <p className="text-xs font-black">All customers in this list have been messaged!</p>
                  </div>
                )}
              </div>

              {/* Fast Tools: Copy Numbers for Broadcast List */}
              <div className="pt-2 border-t border-white/15 flex items-center justify-between gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleCopyAllNumbers}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition cursor-pointer"
                  title="Copy all phone numbers separated by commas for WhatsApp broadcast lists"
                >
                  {copiedNumbers ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedNumbers ? 'Copied Numbers!' : 'Copy Numbers for Broadcast List'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Formatted Text</span>
                </button>
              </div>
            </div>

            {/* Card 2: Customers Target List & Direct Dispatch Table */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">
                    Recipient Customer Audience ({filteredCustomers.length})
                  </h3>
                  <span className="text-[11px] text-gray-400">
                    Click &quot;Send&quot; next to any customer to open their WhatsApp chat instantly
                  </span>
                </div>

                {/* Filter by Tag */}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 outline-none bg-gray-50 cursor-pointer"
                  >
                    {allTags.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag === 'All' ? 'All Customer Tags' : tag}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customers List Table */}
              <div className="overflow-x-auto rounded-xl border border-gray-200 max-h-[380px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-gray-50 z-10 border-b border-gray-200 text-gray-600 text-[10px] font-bold uppercase">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Phone</th>
                      <th className="py-2.5 px-3">Category Tag</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-400 italic text-xs">
                          No customers found matching this tag. Add customers in the &quot;Customer List&quot; tab!
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((cust, idx) => {
                        const isSent = sentCustomerIds.has(cust.id);
                        return (
                          <tr key={cust.id} className="hover:bg-emerald-50/30 transition">
                            <td className="py-2.5 px-3 text-gray-400 font-bold text-[11px]">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-gray-900 text-xs">
                              <div className="truncate max-w-[150px]">{cust.name}</div>
                              {cust.place && (
                                <span className="text-[10px] text-gray-400 block font-normal truncate">
                                  {cust.place}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-gray-700">
                              +91 {cust.phone}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">
                                {cust.tag || 'General'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {isSent ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  Sent
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-gray-400">
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleSendToCustomer(cust)}
                                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                  isSent
                                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    : 'bg-[#25D366] text-white hover:bg-[#20ba59] shadow-xs'
                                }`}
                                title={`Open WhatsApp chat with ${cust.name}`}
                              >
                                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                                <span>{isSent ? 'Send Again' : 'Send'}</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: MANAGE CUSTOMER DIRECTORY                          */}
      {/* ========================================================= */}
      {activeSubTab === 'customers' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: ADD CUSTOMER FORM & BULK IMPORT */}
          <div className="xl:col-span-5 space-y-5">
            {/* Form: Add Single Customer */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#0284c7]" />
                  <h3 className="text-sm font-black text-gray-900">
                    Add New Customer Contact
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBulkModal(true)}
                  className="text-xs font-bold text-[#0284c7] hover:underline cursor-pointer"
                >
                  ⚡ Bulk Import
                </button>
              </div>

              <form onSubmit={handleAddCustomer} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Muhammed Nihal, Dr. Rahul"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-[#0284c7] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Mobile / WhatsApp Number (10 digits) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="9526122471"
                      className="w-full pl-11 pr-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-[#0284c7] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Place / Town
                    </label>
                    <input
                      type="text"
                      value={newPlace}
                      onChange={(e) => setNewPlace(e.target.value)}
                      placeholder="e.g. Mananthavady, Payod"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-[#0284c7] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Customer Tag
                    </label>
                    <select
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-[#0284c7] outline-none bg-white cursor-pointer"
                    >
                      <option value="Regular Customer">Regular Customer</option>
                      <option value="Ride-on Toys">Ride-on Toys</option>
                      <option value="Baby Essentials">Baby Essentials</option>
                      <option value="Bicycles">Bicycles</option>
                      <option value="Remote Cars">Remote Cars</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Notes / Purchased Items (Optional)
                  </label>
                  <input
                    type="text"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="e.g. Inquired about Copster Jeep"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-[#0284c7] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl font-black text-xs text-white bg-[#0284c7] hover:bg-[#0369a1] shadow-xs transition cursor-pointer"
                >
                  Save Customer Contact
                </button>
              </form>
            </div>

            {/* Quick Bulk Import Card */}
            <div className="bg-sky-50 border border-sky-200/90 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-sky-900">
                  Bulk Paste Customer Numbers
                </h4>
              </div>
              <p className="text-xs text-sky-800 leading-relaxed">
                Have customer numbers in WhatsApp groups or bills? Paste them all at once (comma or line separated):
              </p>
              <textarea
                rows={3}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="e.g.&#10;9526122471&#10;Dr. Rahul - 9961736375&#10;9447123456, 9846012345"
                className="w-full p-2.5 rounded-xl border border-sky-200 bg-white text-xs font-mono outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="button"
                onClick={handleBulkImport}
                className="w-full py-2 px-4 rounded-xl font-black text-xs text-white bg-sky-700 hover:bg-sky-800 shadow-xs transition cursor-pointer"
              >
                Import Numbers Now
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: CUSTOMERS DIRECTORY TABLE */}
          <div className="xl:col-span-7 bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-gray-900">
                  Saved Customers ({filteredCustomers.length})
                </h3>
                <p className="text-[11px] text-gray-400">
                  Total saved customer contact phonebook
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, phone, place..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-[#0284c7] outline-none"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 max-h-[500px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-gray-50 z-10 border-b border-gray-200 text-gray-600 text-[10px] font-bold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Customer Name</th>
                    <th className="py-2.5 px-3">Mobile Number</th>
                    <th className="py-2.5 px-3">Place</th>
                    <th className="py-2.5 px-3">Tag</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400 italic text-xs">
                        No customers match your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((cust, idx) => (
                      <tr key={cust.id} className="hover:bg-gray-50 transition">
                        <td className="py-2.5 px-3 text-gray-400 font-bold text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-gray-900 text-xs">
                          {cust.name}
                          {cust.notes && (
                            <span className="text-[10px] text-gray-400 block font-normal truncate max-w-[140px]">
                              {cust.notes}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-gray-800">
                          +91 {cust.phone}
                        </td>
                        <td className="py-2.5 px-3 text-gray-600 text-[11px]">
                          {cust.place || '—'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-100">
                            {cust.tag || 'General'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <a
                              href={`https://api.whatsapp.com/send?phone=${formatPhoneNumberForWhatsApp(cust.phone)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4 fill-emerald-600" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomer(cust.id, cust.name)}
                              className="p-1 rounded-lg text-gray-400 hover:text-red-600 transition cursor-pointer"
                              title="Remove customer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Summary */}
            <div className="pt-2 flex items-center justify-between text-xs text-gray-500 font-semibold">
              <span>Total: {customers.length} saved customer contacts</span>
              <button
                type="button"
                onClick={handleCopyAllNumbers}
                className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Copy All Numbers (CSV)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
