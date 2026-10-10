import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Search,
  Check,
  RotateCcw,
  ExternalLink,
  Image as ImageIcon,
  X,
  Sparkles,
  Layers,
  MapPin,
  Wrench,
  Heart,
  Phone,
  Plus,
  Trash2,
  Clock,
  ArrowRight,
  Cpu,
  Bike,
  BatteryCharging
} from 'lucide-react';
import { InstagramIcon } from '../Icons';
import { useHeroShowcase } from '../../hooks/useHeroShowcase';
import { uploadImage, updateProduct } from '../../services/productService';
import {
  getCustomAgeBrackets,
  saveCustomAgeBrackets,
  getCustomCareServices,
  saveCustomCareServices,
  getCustomInstagramFeed,
  saveCustomInstagramFeed,
  getCustomStoreLocation,
  saveCustomStoreLocation,
  DEFAULT_AGE_BRACKETS,
  DEFAULT_CARE_SERVICES,
  DEFAULT_INSTAGRAM_FEED,
  DEFAULT_STORE_LOCATION
} from '../../services/homepageSectionsService';
import { getUpdates, createUpdate, updateUpdate, deleteUpdate } from '../../services/updateService';
import { recordAdminAction } from '../../services/adminLogService';

const CARE_ICON_MAP = {
  Cpu,
  Bike,
  BatteryCharging,
  Wrench
};

export default function HeroShowcaseManager({
  products = [],
  updatesList = [],
  setActiveTab,
  showNotice
}) {
  // =========================================================
  // 1. SECTION 1 STATE: HERO SHOWCASE (3 SLOTS)
  // =========================================================
  const { slots, saveAll, resetAll } = useHeroShowcase();
  const [localSlots, setLocalSlots] = useState(slots);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0); // 0 = Slot 1, 1 = Slot 2, 2 = Slot 3
  const [savingHero, setSavingHero] = useState(false);

  useEffect(() => {
    if (slots && slots.length > 0) {
      setLocalSlots(slots);
    }
  }, [slots]);

  // Product Picker Modal state for Hero
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState('All');
  const heroFileInputRef = useRef(null);

  const activeSlot = localSlots[selectedSlotIndex] || localSlots[0];

  const filteredPickerProducts = products.filter((p) => {
    const matchesSearch = !pickerSearch ||
      p.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(pickerSearch.toLowerCase());
    const matchesCat = pickerCategory === 'All' || p.category === pickerCategory;
    return matchesSearch && matchesCat;
  });

  const categoriesList = ['All', ...new Set(products.map((p) => p.category).filter(Boolean))];

  const handleUpdateActiveSlot = (field, value) => {
    setLocalSlots((prev) =>
      prev.map((s, idx) => (idx === selectedSlotIndex ? { ...s, [field]: value } : s))
    );
  };

  const handleSelectProductForHero = (prod) => {
    setLocalSlots((prev) =>
      prev.map((s, idx) => {
        if (idx === selectedSlotIndex) {
          return {
            ...s,
            title: prod.name,
            tag: prod.badge || prod.category,
            subtitle: prod.description ? prod.description.slice(0, 50) + '...' : s.subtitle,
            image: prod.image,
            productId: String(prod.id),
          };
        }
        return s;
      })
    );
    setIsPickerOpen(false);
    if (showNotice) {
      showNotice('success', `Selected "${prod.name}" for Slot ${selectedSlotIndex + 1}!`);
    }
  };

  const handleHeroFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      if (showNotice) showNotice('error', 'Please select a valid image file');
      return;
    }
    try {
      if (showNotice) showNotice('success', 'Uploading photo...');
      const uploadedUrl = await uploadImage(file, 'hero');
      handleUpdateActiveSlot('image', uploadedUrl);
      if (showNotice) showNotice('success', 'Photo uploaded successfully!');
    } catch (err) {
      console.error(err);
      if (showNotice) showNotice('error', 'Failed to upload photo');
    }
  };

  const handleSaveHero = async () => {
    setSavingHero(true);
    try {
      await saveAll(localSlots);
      if (showNotice) showNotice('success', 'Hero showcase updated successfully!');
      recordAdminAction({
        action: 'UPDATE',
        category: 'Showcase',
        title: 'Saved Hero Showcase Carousel',
        details: `Updated ${localSlots.length} hero banner slides on homepage`
      });
    } catch (err) {
      console.error(err);
      if (showNotice) showNotice('error', 'Failed to save hero showcase');
    } finally {
      setSavingHero(false);
    }
  };

  const handleResetHero = async () => {
    if (!window.confirm('Reset Hero Showcase to default photos and text?')) return;
    setSavingHero(true);
    try {
      const reset = await resetAll();
      setLocalSlots(reset);
      if (showNotice) showNotice('success', 'Hero showcase reset to defaults');
      recordAdminAction({
        action: 'UPDATE',
        category: 'Showcase',
        title: 'Reset Hero Showcase Carousel',
        details: 'Reverted hero showcase to showroom defaults'
      });
    } catch (err) {
      console.error(err);
      if (showNotice) showNotice('error', 'Failed to reset hero showcase');
    } finally {
      setSavingHero(false);
    }
  };

  const slot1 = localSlots.find((s) => s.slot === 1) || localSlots[0];
  const slot2 = localSlots.find((s) => s.slot === 2) || localSlots[1];
  const slot3 = localSlots.find((s) => s.slot === 3) || localSlots[2];

  // =========================================================
  // 2. SECTION 2 STATE: SHOP BY AGE (AGE GROUPS)
  // =========================================================
  const [ageBrackets, setAgeBrackets] = useState(getCustomAgeBrackets());
  const [selectedAgeIndex, setSelectedAgeIndex] = useState(0);
  const [savingAge, setSavingAge] = useState(false);

  const activeAge = ageBrackets[selectedAgeIndex] || ageBrackets[0];

  const handleUpdateActiveAge = (field, value) => {
    setAgeBrackets((prev) => {
      const next = prev.map((item, idx) => (idx === selectedAgeIndex ? { ...item, [field]: value } : item));
      saveCustomAgeBrackets(next);
      return next;
    });
  };

  const handleSaveAge = () => {
    setSavingAge(true);
    try {
      saveCustomAgeBrackets(ageBrackets);
      if (showNotice) showNotice('success', 'Shop by Age collections saved successfully!');
      recordAdminAction({
        action: 'UPDATE',
        category: 'Showcase',
        title: 'Saved Shop by Age Collections',
        details: 'Updated age brackets & collections on homepage'
      });
    } catch {
      if (showNotice) showNotice('error', 'Failed to save age collections');
    } finally {
      setSavingAge(false);
    }
  };

  const handleResetAge = () => {
    setAgeBrackets(DEFAULT_AGE_BRACKETS);
    saveCustomAgeBrackets(DEFAULT_AGE_BRACKETS);
    if (showNotice) showNotice('success', 'Age collections reset to defaults');
    recordAdminAction({
      action: 'UPDATE',
      category: 'Showcase',
      title: 'Reset Shop by Age Collections',
      details: 'Reverted age brackets to defaults'
    });
  };

  // =========================================================
  // 3. SECTION 3 STATE: FEATURED PRODUCTS STRIP
  // =========================================================
  const [searchFeatured, setSearchFeatured] = useState('');
  const [togglingFeaturedId, setTogglingFeaturedId] = useState(null);

  const featuredProductsList = products.filter((p) => p.isFeatured);

  const filteredFeaturedSearch = (list) => {
    if (!searchFeatured) return list;
    const term = searchFeatured.toLowerCase();
    return list.filter((p) =>
      p.name.toLowerCase().includes(term) ||
      (p.category && p.category.toLowerCase().includes(term))
    );
  };

  const handleToggleFeatured = async (product) => {
    setTogglingFeaturedId(product.id);
    try {
      const nextStatus = !product.isFeatured;
      await updateProduct(product.id, { isFeatured: nextStatus });
      product.isFeatured = nextStatus;
      if (showNotice) {
        showNotice(
          'success',
          nextStatus
            ? `Added "${product.name}" to Featured Strip!`
            : `Removed "${product.name}" from Featured Strip.`
        );
      }
      recordAdminAction({
        action: 'UPDATE',
        category: 'Products',
        title: `${nextStatus ? 'Added' : 'Removed'} Featured: "${product.name}"`,
        details: `${nextStatus ? 'Displayed' : 'Hidden'} on homepage featured products strip`
      });
    } catch {
      if (showNotice) showNotice('error', 'Failed to update featured status');
    } finally {
      setTogglingFeaturedId(null);
    }
  };

  // =========================================================
  // 4. SECTION 4 STATE: STORE UPDATES & ANNOUNCEMENTS
  // =========================================================
  const [localUpdates, setLocalUpdates] = useState(updatesList);
  const [selectedUpdateIndex, setSelectedUpdateIndex] = useState(0);
  const [updateForm, setUpdateForm] = useState({
    id: '',
    title: '',
    category: 'Store Notice',
    badge: 'SPECIALIZED SERVICE',
    date: 'Available Now',
    bannerImage: '/updates/7days-care-service.jpg',
    description: '',
    whatsappMessage: ''
  });
  const [isEditingExistingUpdate, setIsEditingExistingUpdate] = useState(false);
  const [savingUpdate, setSavingUpdate] = useState(false);
  const updateBannerFileRef = useRef(null);

  // Live sync updates from master persistent storage
  useEffect(() => {
    const handleUpdatesSync = async () => {
      try {
        const fresh = await getUpdates();
        setLocalUpdates(fresh);
        if (fresh.length > 0 && !isEditingExistingUpdate) {
          const first = fresh[0];
          setUpdateForm({
            id: String(first.id),
            title: first.title || '',
            category: first.category || 'Store Notice',
            badge: first.badge || 'SPECIALIZED SERVICE',
            date: first.date || 'Available Now',
            bannerImage: first.bannerImage || '/updates/7days-care-service.jpg',
            description: first.description || '',
            whatsappMessage: first.whatsappMessage || ''
          });
          setIsEditingExistingUpdate(true);
        }
      } catch (e) {
        console.error('Failed to sync updates:', e);
      }
    };

    handleUpdatesSync();
    window.addEventListener('7days_updates_updated', handleUpdatesSync);
    return () => {
      window.removeEventListener('7days_updates_updated', handleUpdatesSync);
    };
  }, []);

  const handleSelectUpdateForEdit = (upd, idx) => {
    setSelectedUpdateIndex(idx);
    setIsEditingExistingUpdate(true);
    setUpdateForm({
      id: String(upd.id),
      title: upd.title || '',
      category: upd.category || 'Store Notice',
      badge: upd.badge || 'SPECIALIZED SERVICE',
      date: upd.date || 'Available Now',
      bannerImage: upd.bannerImage || '/updates/7days-care-service.jpg',
      description: upd.description || '',
      whatsappMessage: upd.whatsappMessage || ''
    });
  };

  const handleNewUpdate = () => {
    setIsEditingExistingUpdate(false);
    setSelectedUpdateIndex(-1);
    setUpdateForm({
      id: '',
      title: '',
      category: 'Store Notice',
      badge: 'NEW ARRIVAL',
      date: 'Available Now',
      bannerImage: '/products/baybee/baybee-copster-electric-jeep.jpg',
      description: '',
      whatsappMessage: ''
    });
  };

  const handleUpdateFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (showNotice) showNotice('success', 'Uploading banner...');
      const uploadedUrl = await uploadImage(file, 'updates');
      setUpdateForm((prev) => ({ ...prev, bannerImage: uploadedUrl }));
      if (showNotice) showNotice('success', 'Banner image uploaded!');
    } catch {
      if (showNotice) showNotice('error', 'Failed to upload banner');
    }
  };

  const handleSaveAnnouncement = async () => {
    if (!updateForm.title.trim()) {
      if (showNotice) showNotice('error', 'Please enter a title for the announcement');
      return;
    }
    setSavingUpdate(true);
    try {
      if (isEditingExistingUpdate && updateForm.id) {
        await updateUpdate(updateForm.id, updateForm);
        if (showNotice) showNotice('success', 'Store update updated successfully!');
        recordAdminAction({
          action: 'UPDATE',
          category: 'Store Updates',
          title: `Updated Store Announcement: "${updateForm.title.trim()}"`,
          details: `Badge: ${updateForm.badge} | Category: ${updateForm.category}`
        });
      } else {
        const created = await createUpdate(updateForm);
        if (showNotice) showNotice('success', 'New store update published!');
        recordAdminAction({
          action: 'CREATE',
          category: 'Store Updates',
          title: `Published Store Announcement: "${updateForm.title.trim()}"`,
          details: `Badge: ${updateForm.badge} | Category: ${updateForm.category}`
        });
      }
      const refreshed = await getUpdates();
      setLocalUpdates(refreshed);
      if (refreshed.length > 0) {
        handleSelectUpdateForEdit(refreshed[0], 0);
      }
    } catch (err) {
      console.error(err);
      if (showNotice) showNotice('error', 'Failed to save store update: ' + (err.message || ''));
    } finally {
      setSavingUpdate(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!id) return;
    if (!window.confirm('Delete this announcement?')) return;
    setSavingUpdate(true);
    try {
      await deleteUpdate(id);
      const refreshed = await getUpdates();
      setLocalUpdates(refreshed);
      if (refreshed.length > 0) {
        handleSelectUpdateForEdit(refreshed[0], 0);
      } else {
        handleNewUpdate();
      }
      if (showNotice) showNotice('success', 'Announcement deleted successfully!');
      recordAdminAction({
        action: 'DELETE',
        category: 'Store Updates',
        title: `Deleted Announcement`,
        details: `Removed announcement ID: ${id}`
      });
    } catch (err) {
      console.error(err);
      if (showNotice) showNotice('error', 'Failed to delete announcement');
    } finally {
      setSavingUpdate(false);
    }
  };

  // =========================================================
  // 5. SECTION 5 STATE: 7DAYS CARE & SERVICE HUB
  // =========================================================
  const [careServices, setCareServices] = useState(getCustomCareServices());
  const [selectedCareIndex, setSelectedCareIndex] = useState(0);
  const [savingCare, setSavingCare] = useState(false);

  const activeCareService = careServices[selectedCareIndex] || careServices[0];

  const handleUpdateCareField = (field, value) => {
    setCareServices((prev) => {
      const next = prev.map((item, idx) => (idx === selectedCareIndex ? { ...item, [field]: value } : item));
      saveCustomCareServices(next);
      return next;
    });
  };

  const handleSaveCareServices = () => {
    setSavingCare(true);
    try {
      saveCustomCareServices(careServices);
      if (showNotice) showNotice('success', 'Care & Service items saved successfully!');
      recordAdminAction({
        action: 'UPDATE',
        category: 'Showcase',
        title: 'Saved 7Days Care & Services Hub',
        details: 'Updated toy repair & battery support cards'
      });
    } catch {
      if (showNotice) showNotice('error', 'Failed to save care services');
    } finally {
      setSavingCare(false);
    }
  };

  const handleResetCareServices = () => {
    setCareServices(DEFAULT_CARE_SERVICES);
    saveCustomCareServices(DEFAULT_CARE_SERVICES);
    if (showNotice) showNotice('success', 'Care services reset to defaults');
    recordAdminAction({
      action: 'UPDATE',
      category: 'Showcase',
      title: 'Reset Care & Services Hub',
      details: 'Reverted care services to defaults'
    });
  };

  // =========================================================
  // 6. SECTION 6 STATE: INSTAGRAM COMMUNITY SHOWCASE
  // =========================================================
  const [instaFeed, setInstaFeed] = useState(getCustomInstagramFeed());
  const [selectedInstaSlot, setSelectedInstaSlot] = useState(0); // 0 to 5 for 6 photo slots
  const [savingInsta, setSavingInsta] = useState(false);
  const instaFileInputRef = useRef(null);

  const activeInstaPost = instaFeed?.posts?.[selectedInstaSlot] || instaFeed.posts[0];

  const handleUpdateInstaField = (field, value) => {
    setInstaFeed((prev) => {
      const next = { ...prev, [field]: value };
      saveCustomInstagramFeed(next);
      return next;
    });
  };

  const handleUpdateActiveInstaPost = (field, value) => {
    setInstaFeed((prev) => {
      const updatedPosts = prev.posts.map((p, idx) =>
        idx === selectedInstaSlot ? { ...p, [field]: value } : p
      );
      const next = { ...prev, posts: updatedPosts };
      saveCustomInstagramFeed(next);
      return next;
    });
  };

  const handleInstaFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (showNotice) showNotice('success', 'Uploading photo...');
      const uploadedUrl = await uploadImage(file, 'instagram');
      handleUpdateActiveInstaPost('image', uploadedUrl);
      if (showNotice) showNotice('success', 'Instagram photo updated!');
    } catch {
      if (showNotice) showNotice('error', 'Failed to upload image');
    }
  };

  const handleSaveInstaFeed = () => {
    setSavingInsta(true);
    try {
      saveCustomInstagramFeed(instaFeed);
      if (showNotice) showNotice('success', 'Instagram showcase saved successfully!');
      recordAdminAction({
        action: 'UPDATE',
        category: 'Showcase',
        title: 'Saved Instagram Feed Gallery',
        details: 'Updated showroom social media photo cards'
      });
    } catch {
      if (showNotice) showNotice('error', 'Failed to save Instagram showcase');
    } finally {
      setSavingInsta(false);
    }
  };

  const handleResetInstaFeed = () => {
    setInstaFeed(DEFAULT_INSTAGRAM_FEED);
    saveCustomInstagramFeed(DEFAULT_INSTAGRAM_FEED);
    if (showNotice) showNotice('success', 'Instagram feed reset to defaults');
    recordAdminAction({
      action: 'UPDATE',
      category: 'Showcase',
      title: 'Reset Instagram Feed Gallery',
      details: 'Reverted instagram gallery to defaults'
    });
  };

  // =========================================================
  // 7. SECTION 7 STATE: STORE LOCATION, TIMINGS & DIRECTIONS
  // =========================================================
  const [storeLocation, setStoreLocation] = useState(getCustomStoreLocation());
  const [savingLocation, setSavingLocation] = useState(false);

  const handleUpdateStoreField = (field, value) => {
    setStoreLocation((prev) => {
      const next = { ...prev, [field]: value };
      saveCustomStoreLocation(next);
      return next;
    });
  };

  const handleSaveStoreLocation = () => {
    setSavingLocation(true);
    try {
      saveCustomStoreLocation(storeLocation);
      if (showNotice) showNotice('success', 'Store location and timings saved successfully!');
      recordAdminAction({
        action: 'UPDATE',
        category: 'Settings',
        title: 'Saved Store Location & Timings',
        details: 'Updated store address, contact number, or showroom hours'
      });
    } catch {
      if (showNotice) showNotice('error', 'Failed to save store location');
    } finally {
      setSavingLocation(false);
    }
  };

  const handleResetStoreLocation = () => {
    setStoreLocation(DEFAULT_STORE_LOCATION);
    saveCustomStoreLocation(DEFAULT_STORE_LOCATION);
    if (showNotice) showNotice('success', 'Store location reset to defaults');
    recordAdminAction({
      action: 'UPDATE',
      category: 'Settings',
      title: 'Reset Store Location & Timings',
      details: 'Reverted showroom location details to defaults'
    });
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Top Banner Navigation */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FB8500] mb-1">
            <Layers className="w-4 h-4" />
            <span>Visual Homepage CMS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#263238] tracking-tight">
            Homepage Sections &amp; Live Visual Editors
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
            Edit all 7 sections of the customer homepage. Every section features a live preview on the left and interactive customization controls on the right.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-xs transition cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
            <span>View Public Site ↗</span>
          </a>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: HERO SHOWCASE (3 PHOTOS)                                       */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#FB8500] flex items-center justify-center font-bold text-xs">
              01
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Section 1</span>
              <h2 className="text-lg font-extrabold text-[#263238]">Hero Showcase (3 Photos)</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetHero}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
              <span>Reset Default</span>
            </button>
            <button
              onClick={handleSaveHero}
              disabled={savingHero}
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#FB8500] hover:bg-[#e07500] shadow-sm disabled:opacity-50 transition cursor-pointer"
            >
              {savingHero ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>Apply &amp; Save Hero</span>
            </button>
          </div>
        </div>

        {/* 2-Column: Left = Preview | Right = Configurator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Live Preview */}
          <div className="lg:col-span-6 bg-[#FAF8F5] p-5 rounded-2xl border border-black/5">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-black/5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#6A994E] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-800">
                  LIVE HOMEPAGE PREVIEW
                </span>
              </div>
              <span className="text-[11px] text-gray-400">Click any card to edit</span>
            </div>

            <div className="mb-4 bg-white p-3 rounded-xl border border-black/5">
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#FB8500]">
                7Days Toys &amp; Babyshop
              </span>
              <h3 className="text-base font-extrabold text-[#263238] leading-tight mt-0.5">
                Little things. <span className="text-[#FB8500]">Big smiles.</span>
              </h3>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-black/10">
              <div className="grid grid-cols-12 gap-3">
                {/* Slot 1: Main Feature (7 cols) */}
                <div
                  onClick={() => setSelectedSlotIndex(0)}
                  className={`col-span-7 relative rounded-xl overflow-hidden bg-[#FAF8F5] border aspect-[4/5] flex flex-col justify-between p-2.5 transition-all cursor-pointer ${selectedSlotIndex === 0
                      ? 'ring-3 ring-[#FB8500] border-[#FB8500] shadow-md'
                      : 'border-black/10 hover:border-black/30'
                    }`}
                >
                  <div className="flex items-center justify-between z-10">
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${selectedSlotIndex === 0 ? 'bg-[#FB8500] text-white' : 'bg-gray-100 text-gray-700'
                      }`}>
                      Slot 1: Main Feature
                    </span>
                    {slot1?.tag && (
                      <span className="text-[9px] font-bold text-[#FB8500] bg-amber-50 px-1 rounded">
                        {slot1.tag}
                      </span>
                    )}
                  </div>

                  <div className="relative w-full h-28 sm:h-36 flex items-center justify-center my-1 overflow-hidden rounded-lg">
                    {slot1?.image ? (
                      <img
                        src={slot1.image}
                        alt={slot1.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-xs text-gray-400 flex flex-col items-center">
                        <ImageIcon className="w-6 h-6 mb-1 text-gray-300" />
                        <span>No image</span>
                      </div>
                    )}
                  </div>

                  <div className="z-10">
                    <h4 className="text-xs font-extrabold text-[#263238] line-clamp-1">
                      {slot1?.title || 'Main Feature Title'}
                    </h4>
                    {slot1?.subtitle && (
                      <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                        {slot1.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Stack: Slot 2 & Slot 3 (5 cols) */}
                <div className="col-span-5 flex flex-col gap-3">
                  {/* Slot 2 */}
                  <div
                    onClick={() => setSelectedSlotIndex(1)}
                    className={`relative rounded-xl overflow-hidden bg-[#FAF8F5] border p-2 flex flex-col justify-between transition-all cursor-pointer ${selectedSlotIndex === 1
                        ? 'ring-3 ring-[#FB8500] border-[#FB8500] shadow-md'
                        : 'border-black/10 hover:border-black/30'
                      }`}
                  >
                    <div className="flex items-center justify-between text-[8px] font-bold uppercase mb-1">
                      <span className="text-gray-500">Slot 2</span>
                      {slot2?.tag && (
                        <span className="text-[#FB8500] truncate max-w-[80px]">{slot2.tag}</span>
                      )}
                    </div>
                    <div className="h-16 flex items-center justify-center overflow-hidden rounded bg-white my-1">
                      {slot2?.image ? (
                        <img src={slot2.image} alt={slot2.title} className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                    <h5 className="text-[11px] font-bold text-[#263238] line-clamp-1">
                      {slot2?.title || 'Slot 2 Title'}
                    </h5>
                  </div>

                  {/* Slot 3 */}
                  <div
                    onClick={() => setSelectedSlotIndex(2)}
                    className={`relative rounded-xl overflow-hidden bg-[#FAF8F5] border p-2 flex flex-col justify-between transition-all cursor-pointer ${selectedSlotIndex === 2
                        ? 'ring-3 ring-[#FB8500] border-[#FB8500] shadow-md'
                        : 'border-black/10 hover:border-black/30'
                      }`}
                  >
                    <div className="flex items-center justify-between text-[8px] font-bold uppercase mb-1">
                      <span className="text-gray-500">Slot 3</span>
                      {slot3?.tag && (
                        <span className="text-[#219EBC] truncate max-w-[80px]">{slot3.tag}</span>
                      )}
                    </div>
                    <div className="h-16 flex items-center justify-center overflow-hidden rounded bg-white my-1">
                      {slot3?.image ? (
                        <img src={slot3.image} alt={slot3.title} className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                    <h5 className="text-[11px] font-bold text-[#263238] line-clamp-1">
                      {slot3?.title || 'Slot 3 Title'}
                    </h5>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 text-center text-xs text-gray-500">
              Active Selection: <strong className="text-gray-900">Slot {selectedSlotIndex + 1} ({activeSlot?.slotLabel})</strong>
            </div>
          </div>

          {/* RIGHT: Configurator */}
          <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                SELECT SLOT TO CONFIGURE:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {localSlots.map((s, idx) => (
                  <button
                    key={s.slot}
                    type="button"
                    onClick={() => setSelectedSlotIndex(idx)}
                    className={`p-2.5 rounded-xl text-left border transition cursor-pointer ${selectedSlotIndex === idx
                        ? 'bg-[#FB8500] text-white border-[#FB8500] shadow-sm'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider block opacity-80">
                      Slot {s.slot}
                    </span>
                    <span className="text-xs font-bold truncate block">{s.slotLabel}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Choose from store */}
            <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/60 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-gray-900">Choose an Existing Store Product</h4>
                <p className="text-[11px] text-gray-500">Pulls image, title, and link automatically.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#FB8500] text-white text-xs font-bold shadow-xs hover:bg-[#e07500] transition cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Browse Products</span>
              </button>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Slot {selectedSlotIndex + 1} Photo *
              </label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                  {activeSlot.image ? (
                    <img src={activeSlot.image} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <input
                    type="file"
                    ref={heroFileInputRef}
                    onChange={handleHeroFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => heroFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-gray-500" />
                    <span>Upload Image File</span>
                  </button>
                  <input
                    type="text"
                    value={activeSlot.image || ''}
                    onChange={(e) => handleUpdateActiveSlot('image', e.target.value)}
                    placeholder="or enter image URL..."
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-[#FB8500]"
                  />
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Display Title
              </label>
              <input
                type="text"
                value={activeSlot.title || ''}
                onChange={(e) => handleUpdateActiveSlot('title', e.target.value)}
                placeholder="Product or banner title"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-[#FB8500]"
              />
            </div>

            {/* Tag & Subtitle */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Tag / Badge
                </label>
                <input
                  type="text"
                  value={activeSlot.tag || ''}
                  onChange={(e) => handleUpdateActiveSlot('tag', e.target.value)}
                  placeholder="e.g. EV Ride-on"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-[#FB8500]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Subtitle (Optional)
                </label>
                <input
                  type="text"
                  value={activeSlot.subtitle || ''}
                  onChange={(e) => handleUpdateActiveSlot('subtitle', e.target.value)}
                  placeholder="e.g. Test drive at Payod"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-[#FB8500]"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">Syncs immediately to homepage.</span>
              <button
                type="button"
                onClick={handleSaveHero}
                disabled={savingHero}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#FB8500] hover:bg-[#e07500] shadow-sm disabled:opacity-50 transition cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply &amp; Save Hero</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: SHOP BY AGE COLLECTIONS                                        */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold text-xs">
              02
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Section 2</span>
              <h2 className="text-lg font-extrabold text-[#263238]">Shop by Age Collections</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetAge}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
              <span>Reset Default</span>
            </button>
            <button
              onClick={handleSaveAge}
              disabled={savingAge}
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#219EBC] hover:bg-[#1a859e] shadow-sm disabled:opacity-50 transition cursor-pointer"
            >
              {savingAge ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>Apply &amp; Save Age Stages</span>
            </button>
          </div>
        </div>

        {/* 2-Column: Left = Preview | Right = Configurator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Live Preview */}
          <div className="lg:col-span-6 bg-[#FAF8F5] p-5 rounded-2xl border border-black/5">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-black/5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#6A994E] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-800">
                  LIVE HOMEPAGE PREVIEW
                </span>
              </div>
              <span className="text-[11px] text-gray-400">Click any stage to edit</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {ageBrackets.map((bracket, idx) => {
                const isSelected = selectedAgeIndex === idx;
                return (
                  <div
                    key={bracket.id || idx}
                    onClick={() => setSelectedAgeIndex(idx)}
                    className={`p-3.5 rounded-2xl bg-white border flex flex-col justify-between transition-all cursor-pointer ${isSelected
                        ? 'ring-3 ring-[#219EBC] border-[#219EBC] shadow-md'
                        : 'border-black/10 hover:border-black/30'
                      }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        {bracket.icon ? <span className="text-2xl">{bracket.icon}</span> : <div />}
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-sky-50 text-[#219EBC]">
                          {bracket.tag || 'Stage'}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        {bracket.tagline}
                      </span>
                      <h4 className="text-sm font-extrabold text-[#263238] mt-0.5">
                        {bracket.label}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-1 leading-snug line-clamp-2">
                        {bracket.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] font-bold text-[#219EBC]">
                      <span>{bracket.category || 'Toys'} Collection</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 text-center text-xs text-gray-500">
              Active Selection: <strong className="text-gray-900">{activeAge.label} ({activeAge.tagline})</strong>
            </div>
          </div>

          {/* RIGHT: Configurator */}
          <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                SELECT AGE STAGE TO CONFIGURE:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ageBrackets.map((bracket, idx) => (
                  <button
                    key={bracket.id || idx}
                    type="button"
                    onClick={() => setSelectedAgeIndex(idx)}
                    className={`p-2 rounded-xl text-center border transition cursor-pointer ${selectedAgeIndex === idx
                        ? 'bg-[#219EBC] text-white border-[#219EBC] shadow-sm'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                  >
                    {bracket.icon ? <span className="text-base block">{bracket.icon}</span> : null}
                    <span className="text-[10px] font-bold truncate block mt-0.5">{bracket.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Emoji / Icon
                  </label>
                  <button
                    type="button"
                    onClick={() => handleUpdateActiveAge('icon', '')}
                    className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
                  >
                    Clear / No Icon
                  </button>
                </div>
                <input
                  type="text"
                  value={activeAge.icon || ''}
                  onChange={(e) => handleUpdateActiveAge('icon', e.target.value)}
                  placeholder="Leave empty for no icon, or paste emoji"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-[#219EBC]"
                />
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] text-gray-400">Presets:</span>
                  {['🍼', '🧸', '🎨', '🚲', '🛴', '👶', '🧩'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => handleUpdateActiveAge('icon', em)}
                      className="w-6 h-6 rounded-lg bg-gray-50 hover:bg-[#219EBC]/15 border border-gray-200 text-xs flex items-center justify-center transition cursor-pointer"
                      title={`Use ${em}`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Stage Badge
                </label>
                <input
                  type="text"
                  value={activeAge.tag || ''}
                  onChange={(e) => handleUpdateActiveAge('tag', e.target.value)}
                  placeholder="e.g. Infants, Toddlers"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-[#219EBC]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Stage Label
                </label>
                <input
                  type="text"
                  value={activeAge.label || ''}
                  onChange={(e) => handleUpdateActiveAge('label', e.target.value)}
                  placeholder="e.g. 0 – 12 Months"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-[#219EBC]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Tagline / Focus
                </label>
                <input
                  type="text"
                  value={activeAge.tagline || ''}
                  onChange={(e) => handleUpdateActiveAge('tagline', e.target.value)}
                  placeholder="e.g. Infant & Sensory"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-[#219EBC]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={activeAge.description || ''}
                onChange={(e) => handleUpdateActiveAge('description', e.target.value)}
                placeholder="Brief summary of toys for this age group..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-[#219EBC]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Target Category Link
              </label>
              <select
                value={activeAge.category || 'Toys'}
                onChange={(e) => handleUpdateActiveAge('category', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-[#219EBC]"
              >
                <option value="Baby">Baby (Rattles, Cots, Walkers)</option>
                <option value="Toys">Toys (Ride-ons, Puzzles, Dolls)</option>
                <option value="Outdoors">Outdoors (Cycles, Skates, Sports)</option>
              </select>
            </div>

            {/* Save Button */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">Updates homepage tabs immediately.</span>
              <button
                type="button"
                onClick={handleSaveAge}
                disabled={savingAge}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#219EBC] hover:bg-[#1a859e] shadow-sm disabled:opacity-50 transition cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply &amp; Save Age Stages</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: FEATURED PRODUCTS COLLECTION                                   */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
              03
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Section 3</span>
              <h2 className="text-lg font-extrabold text-[#263238]">Featured Products Strip</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              {featuredProductsList.length} Items Live on Homepage
            </span>
          </div>
        </div>

        {/* 2-Column: Left = Preview | Right = Configurator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Live Preview */}
          <div className="lg:col-span-6 bg-[#FAF8F5] p-5 rounded-2xl border border-black/5">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-black/5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#6A994E] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-800">
                  LIVE HOMEPAGE PREVIEW
                </span>
              </div>
              <span className="text-[11px] text-gray-400">Featured carousel grid</span>
            </div>

            <div className="mb-3">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#FB8500] bg-amber-50 px-2 py-0.5 rounded-full">
                <Heart className="w-3 h-3 fill-[#FB8500]" />
                Handpicked For You
              </span>
              <h3 className="text-base font-extrabold text-[#263238] mt-1">Featured Products</h3>
            </div>

            {featuredProductsList.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400 bg-white rounded-xl border border-gray-200">
                No products are currently marked as Featured. Search and star products on the right to display them here!
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {featuredProductsList.slice(0, 6).map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3 bg-white rounded-xl border border-black/10 shadow-2xs flex flex-col justify-between group"
                  >
                    <div className="aspect-square bg-gray-50 rounded-lg p-2 flex items-center justify-center overflow-hidden mb-2 relative">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-contain"
                      />
                      <span className="absolute top-1 right-1 p-1 bg-amber-500 text-white rounded-full shadow-xs">
                        <Sparkles className="w-2.5 h-2.5" />
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block truncate">
                        {prod.category}
                      </span>
                      <h4 className="text-xs font-bold text-[#263238] line-clamp-1 mt-0.5">
                        {prod.name}
                      </h4>
                      {prod.price && (
                        <p className="text-xs font-extrabold text-[#FB8500] mt-1">
                          ₹{Number(prod.price).toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 text-center text-xs text-gray-500">
              Showing top items of <strong className="text-gray-900">{featuredProductsList.length} featured products</strong>
            </div>
          </div>

          {/* RIGHT: Manager & Selector */}
          <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                MANAGE FEATURED PRODUCTS IN CATALOG:
              </span>
              <p className="text-xs text-gray-500 mb-3">
                Click the star button on any product to toggle whether it appears on the homepage.
              </p>

              {/* Search Bar */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchFeatured}
                  onChange={(e) => setSearchFeatured(e.target.value)}
                  placeholder="Search products to feature..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#FB8500]"
                />
              </div>
            </div>

            {/* Product list with toggle */}
            <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1 divide-y divide-gray-100">
              {filteredFeaturedSearch(products).slice(0, 20).map((prod) => {
                const isFeatured = Boolean(prod.isFeatured);
                const isToggling = togglingFeaturedId === prod.id;
                return (
                  <div
                    key={prod.id}
                    className="pt-2 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-150 p-1 shrink-0 overflow-hidden">
                        <img src={prod.image} alt="" className="w-full h-full object-contain" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-[#263238] truncate">{prod.name}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                          <span>{prod.category}</span>
                          {prod.price && (
                            <span className="text-gray-700 font-semibold">₹{prod.price}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isToggling}
                      onClick={() => handleToggleFeatured(prod)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 flex items-center gap-1 ${isFeatured
                          ? 'bg-amber-50 text-amber-700 border border-amber-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-700'
                        }`}
                    >
                      {isToggling ? (
                        <div className="w-3 h-3 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                      ) : isFeatured ? (
                        <>
                          <Sparkles className="w-3 h-3 fill-amber-500" />
                          <span>Featured</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>Feature</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Instant sync to database &amp; homepage.</span>
              <button
                type="button"
                onClick={() => setActiveTab?.('products')}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Open Full Catalog Tab →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: STORE UPDATES & ANNOUNCEMENTS                                  */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs">
              04
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Section 4</span>
              <h2 className="text-lg font-extrabold text-[#263238]">Store Updates &amp; News</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewUpdate}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-gray-500" />
              <span>New Notice</span>
            </button>
            <button
              onClick={handleSaveAnnouncement}
              disabled={savingUpdate}
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm disabled:opacity-50 transition cursor-pointer"
            >
              {savingUpdate ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>Publish &amp; Save Update</span>
            </button>
          </div>
        </div>

        {/* 2-Column: Left = Preview | Right = Configurator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Live Preview */}
          <div className="lg:col-span-6 bg-[#FAF8F5] p-5 rounded-2xl border border-black/5">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-black/5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#6A994E] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-800">
                  LIVE HOMEPAGE PREVIEW
                </span>
              </div>
              <span className="text-[11px] text-gray-400">Click below to select update</span>
            </div>

            {/* Simulated Live Announcement Banner */}
            <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-xs">
              <div className="aspect-[16/9] w-full rounded-xl bg-gray-100 overflow-hidden mb-3 relative">
                {updateForm.bannerImage ? (
                  <img
                    src={updateForm.bannerImage}
                    alt={updateForm.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    No banner photo
                  </div>
                )}
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-red-600 text-white font-extrabold text-[10px] uppercase shadow-xs">
                  {updateForm.badge || 'Store Notice'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-gray-400 font-semibold">
                  📅 {updateForm.date || 'Available Now'}
                </span>
                <h3 className="text-sm font-extrabold text-[#263238] mt-0.5">
                  {updateForm.title || 'Announcement Title'}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-snug">
                  {updateForm.description || 'Details regarding new arrivals, festive promotions, or service.'}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] text-emerald-600 font-bold">💬 WhatsApp Connected</span>
                <span className="text-xs font-bold text-red-600">Inquire Now →</span>
              </div>
            </div>

            {/* List of active updates to click */}
            {localUpdates.length > 0 && (
              <div className="mt-4 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                  Other Active Announcements ({localUpdates.length}):
                </span>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {localUpdates.map((upd, idx) => (
                    <div
                      key={upd.id}
                      className={`p-2 rounded-xl border text-left shrink-0 max-w-[210px] transition flex items-center justify-between gap-1.5 ${selectedUpdateIndex === idx && isEditingExistingUpdate
                          ? 'bg-red-50 border-red-300 ring-2 ring-red-200'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectUpdateForEdit(upd, idx)}
                        className="min-w-0 flex-1 text-left cursor-pointer"
                      >
                        <span className="text-[9px] font-bold uppercase text-red-600 block truncate">
                          {upd.badge || 'Notice'}
                        </span>
                        <span className="text-xs font-bold text-gray-900 block truncate">
                          {upd.title}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAnnouncement(upd.id);
                        }}
                        className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer shrink-0"
                        title="Delete this notice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Configurator */}
          <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                {isEditingExistingUpdate ? 'EDIT SELECTED ANNOUNCEMENT' : 'CREATE NEW ANNOUNCEMENT'}
              </span>
              {isEditingExistingUpdate && updateForm.id && (
                <button
                  type="button"
                  onClick={() => handleDeleteAnnouncement(updateForm.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition cursor-pointer"
                  title="Permanently delete this announcement"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Announcement</span>
                </button>
              )}
            </div>

            {/* Banner Photo */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Banner Photo *
              </label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-12 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                  {updateForm.bannerImage ? (
                    <img src={updateForm.bannerImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <input
                    type="file"
                    ref={updateBannerFileRef}
                    onChange={handleUpdateFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => updateBannerFileRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-gray-500" />
                    <span>Upload Banner Image</span>
                  </button>
                  <input
                    type="text"
                    value={updateForm.bannerImage}
                    onChange={(e) => setUpdateForm((prev) => ({ ...prev, bannerImage: e.target.value }))}
                    placeholder="or enter image URL..."
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Notice Badge
                </label>
                <input
                  type="text"
                  value={updateForm.badge}
                  onChange={(e) => setUpdateForm((prev) => ({ ...prev, badge: e.target.value }))}
                  placeholder="e.g. SPECIALIZED SERVICE"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Date / Status
                </label>
                <input
                  type="text"
                  value={updateForm.date}
                  onChange={(e) => setUpdateForm((prev) => ({ ...prev, date: e.target.value }))}
                  placeholder="e.g. Available Now"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Announcement Title *
              </label>
              <input
                type="text"
                value={updateForm.title}
                onChange={(e) => setUpdateForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Electric Car, Bike &amp; Gear Cycle Service Available"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Description / Message
              </label>
              <textarea
                rows={2}
                value={updateForm.description}
                onChange={(e) => setUpdateForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Tell customers about the offer or store update..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                WhatsApp Inquiry Text (Optional)
              </label>
              <input
                type="text"
                value={updateForm.whatsappMessage}
                onChange={(e) => setUpdateForm((prev) => ({ ...prev, whatsappMessage: e.target.value }))}
                placeholder="Pre-filled greeting when customers click"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Save Button */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">Published to homepage immediately.</span>
              <button
                type="button"
                onClick={handleSaveAnnouncement}
                disabled={savingUpdate}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm disabled:opacity-50 transition cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Publish Announcement</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 5: 7DAYS CARE & SERVICE HUB                                       */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
              05
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Section 5</span>
              <h2 className="text-lg font-extrabold text-[#263238]">7Days Care &amp; Service Hub</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetCareServices}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
              <span>Reset Default</span>
            </button>
            <button
              onClick={handleSaveCareServices}
              disabled={savingCare}
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#6A994E] hover:bg-[#588040] shadow-sm disabled:opacity-50 transition cursor-pointer"
            >
              {savingCare ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>Apply &amp; Save Care Services</span>
            </button>
          </div>
        </div>

        {/* 2-Column: Left = Preview | Right = Configurator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Live Preview */}
          <div className="lg:col-span-6 bg-[#FAF8F5] p-5 rounded-2xl border border-black/5">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-black/5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#6A994E] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-800">
                  LIVE HOMEPAGE PREVIEW
                </span>
              </div>
              <span className="text-[11px] text-gray-400">Click any service to edit</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {careServices.map((svc, idx) => {
                const IconComponent = (svc.iconKey && CARE_ICON_MAP[svc.iconKey]) || Wrench;
                const isSelected = selectedCareIndex === idx;
                return (
                  <div
                    key={svc.id || idx}
                    onClick={() => setSelectedCareIndex(idx)}
                    className={`p-3.5 rounded-2xl bg-white border flex flex-col justify-between transition-all cursor-pointer ${isSelected
                        ? 'ring-3 ring-[#6A994E] border-[#6A994E] shadow-md'
                        : 'border-black/10 hover:border-black/30'
                      }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-8 h-8 rounded-xl ${svc.bg || 'bg-emerald-50'} ${svc.accent || 'text-[#6A994E]'} flex items-center justify-center`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                          {svc.tag}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[#263238] line-clamp-1">
                        {svc.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-1 leading-snug line-clamp-2">
                        {svc.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] font-semibold text-gray-400">
                      <span>In-Store at Payod</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 text-center text-xs text-gray-500">
              Active Selection: <strong className="text-gray-900">{activeCareService.title}</strong>
            </div>
          </div>

          {/* RIGHT: Configurator */}
          <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                SELECT SERVICE TO CONFIGURE:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {careServices.map((svc, idx) => (
                  <button
                    key={svc.id || idx}
                    type="button"
                    onClick={() => setSelectedCareIndex(idx)}
                    className={`p-2 rounded-xl text-left border transition cursor-pointer ${selectedCareIndex === idx
                        ? 'bg-[#6A994E] text-white border-[#6A994E] shadow-sm'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider block opacity-80">
                      Service {idx + 1}
                    </span>
                    <span className="text-xs font-bold truncate block">{svc.title}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Service Title
              </label>
              <input
                type="text"
                value={activeCareService.title}
                onChange={(e) => handleUpdateCareField('title', e.target.value)}
                placeholder="e.g. Kids EV &amp; Ride-on Servicing"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-[#6A994E]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Tag / Badge
                </label>
                <input
                  type="text"
                  value={activeCareService.tag}
                  onChange={(e) => handleUpdateCareField('tag', e.target.value)}
                  placeholder="e.g. Electric Vehicles"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-[#6A994E]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Icon Theme
                </label>
                <select
                  value={activeCareService.iconKey || 'Wrench'}
                  onChange={(e) => handleUpdateCareField('iconKey', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-[#6A994E]"
                >
                  <option value="Cpu">⚡ Cpu / Electronics (EV)</option>
                  <option value="Bike">🚲 Bike (Cycle tuning)</option>
                  <option value="BatteryCharging">🔋 Battery / Charger Spares</option>
                  <option value="Wrench">🔧 Wrench / Diagnostics</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={activeCareService.description}
                onChange={(e) => handleUpdateCareField('description', e.target.value)}
                placeholder="Describe this service offered at Payod..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-[#6A994E]"
              />
            </div>

            {/* Save Button */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">Updates homepage immediately.</span>
              <button
                type="button"
                onClick={handleSaveCareServices}
                disabled={savingCare}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#6A994E] hover:bg-[#588040] shadow-sm disabled:opacity-50 transition cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply &amp; Save Care Services</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 6: INSTAGRAM COMMUNITY SHOWCASE                                   */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
              06
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Section 6</span>
              <h2 className="text-lg font-extrabold text-[#263238]">Instagram Showcase ({instaFeed.handle})</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetInstaFeed}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
              <span>Reset Default</span>
            </button>
            <button
              onClick={handleSaveInstaFeed}
              disabled={savingInsta}
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 shadow-sm disabled:opacity-50 transition cursor-pointer"
            >
              {savingInsta ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>Apply &amp; Save Instagram Feed</span>
            </button>
          </div>
        </div>

        {/* 2-Column: Left = Preview | Right = Configurator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Live Preview */}
          <div className="lg:col-span-6 bg-[#FAF8F5] p-5 rounded-2xl border border-black/5">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-black/5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#6A994E] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-800">
                  LIVE HOMEPAGE PREVIEW
                </span>
              </div>
              <span className="text-[11px] text-gray-400">Click any photo tile to edit</span>
            </div>

            {/* Header Mockup */}
            <div className="text-center mb-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-600 font-bold text-[10px] uppercase">
                <InstagramIcon className="w-3 h-3" />
                <span>{instaFeed.handle}</span>
              </span>
              <h3 className="text-sm font-extrabold text-[#263238] mt-1">{instaFeed.heading}</h3>
              <p className="text-[11px] text-gray-500">{instaFeed.subtitle}</p>
            </div>

            {/* 6-Image Social Grid */}
            <div className="grid grid-cols-3 gap-2">
              {instaFeed.posts.map((post, idx) => {
                const isSelected = selectedInstaSlot === idx;
                return (
                  <div
                    key={post.id || idx}
                    onClick={() => setSelectedInstaSlot(idx)}
                    className={`aspect-square rounded-xl overflow-hidden bg-white border relative group transition-all cursor-pointer ${isSelected
                        ? 'ring-3 ring-pink-500 border-pink-500 shadow-md'
                        : 'border-black/10 hover:border-black/30'
                      }`}
                  >
                    <img
                      src={post.image}
                      alt={post.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-1 text-center text-white text-[9px] font-semibold">
                      Photo {idx + 1}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Button Mockup */}
            <div className="text-center mt-4">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs shadow-xs">
                <InstagramIcon className="w-3.5 h-3.5" />
                <span>Follow {instaFeed.handle}</span>
              </span>
            </div>

            <div className="mt-3 text-center text-xs text-gray-500">
              Active Selection: <strong className="text-gray-900">Photo Slot {selectedInstaSlot + 1}</strong>
            </div>
          </div>

          {/* RIGHT: Configurator */}
          <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Instagram Handle
                </label>
                <input
                  type="text"
                  value={instaFeed.handle}
                  onChange={(e) => handleUpdateInstaField('handle', e.target.value)}
                  placeholder="@7days_toys"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Instagram Profile URL
                </label>
                <input
                  type="text"
                  value={instaFeed.url}
                  onChange={(e) => handleUpdateInstaField('url', e.target.value)}
                  placeholder="https://www.instagram.com/7days_toys/"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Section Heading
              </label>
              <input
                type="text"
                value={instaFeed.heading}
                onChange={(e) => handleUpdateInstaField('heading', e.target.value)}
                placeholder="Follow 7Days Toys on Instagram"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                SELECT PHOTO SLOT TO CONFIGURE (1 - 6):
              </span>
              <div className="grid grid-cols-6 gap-1.5">
                {instaFeed.posts.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedInstaSlot(idx)}
                    className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${selectedInstaSlot === idx
                        ? 'bg-pink-500 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    #{idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Photo Slot {selectedInstaSlot + 1} Image *
              </label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                  {activeInstaPost?.image ? (
                    <img src={activeInstaPost.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <input
                    type="file"
                    ref={instaFileInputRef}
                    onChange={handleInstaFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => instaFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-gray-500" />
                    <span>Upload Image File</span>
                  </button>
                  <input
                    type="text"
                    value={activeInstaPost?.image || ''}
                    onChange={(e) => handleUpdateActiveInstaPost('image', e.target.value)}
                    placeholder="or enter image URL..."
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Post Caption / Hover Text
              </label>
              <input
                type="text"
                value={activeInstaPost?.caption || ''}
                onChange={(e) => handleUpdateActiveInstaPost('caption', e.target.value)}
                placeholder="Short caption for this Instagram post..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {/* Save Button */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">Updates homepage feed immediately.</span>
              <button
                type="button"
                onClick={handleSaveInstaFeed}
                disabled={savingInsta}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 shadow-sm disabled:opacity-50 transition cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply &amp; Save Instagram Feed</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 7: STORE LOCATION, TIMINGS & DIRECTIONS                           */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs">
              07
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Section 7</span>
              <h2 className="text-lg font-extrabold text-[#263238]">Physical Store Location &amp; Hours</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetStoreLocation}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
              <span>Reset Default</span>
            </button>
            <button
              onClick={handleSaveStoreLocation}
              disabled={savingLocation}
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0284C7] hover:bg-[#0369a1] shadow-sm disabled:opacity-50 transition cursor-pointer"
            >
              {savingLocation ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>Apply &amp; Save Store Info</span>
            </button>
          </div>
        </div>

        {/* 2-Column: Left = Preview | Right = Configurator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Live Preview */}
          <div className="lg:col-span-6 bg-[#FAF8F5] p-5 rounded-2xl border border-black/5">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-black/5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#6A994E] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-800">
                  LIVE HOMEPAGE PREVIEW
                </span>
              </div>
              <span className="text-[11px] text-gray-400">Location &amp; timings card</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-black/10 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6A994E] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#6A994E]">
                  {storeLocation.statusBadge}
                </span>
              </div>

              <h3 className="text-lg font-extrabold text-[#263238] font-heading">
                {storeLocation.storeName}
              </h3>

              <div className="p-3 rounded-xl bg-[#FFF9F0] border border-[#FFB703]/20 space-y-1">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#FB8500] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-gray-400 block">Address</span>
                    <p className="text-xs font-bold text-[#263238]">{storeLocation.addressFormatted}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1 text-xs text-[#FB8500] font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{storeLocation.hours}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-gray-700">
                  <Phone className="w-3.5 h-3.5 text-[#FB8500]" />
                  <span>{storeLocation.phoneDisplay}</span>
                </div>
                <a
                  href={storeLocation.mapsSearchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[#0284C7] hover:underline flex items-center gap-1"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="mt-3 text-center text-xs text-gray-500">
              Live Location: <strong className="text-gray-900">{storeLocation.addressFormatted}</strong>
            </div>
          </div>

          {/* RIGHT: Configurator */}
          <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Store Display Name
                </label>
                <input
                  type="text"
                  value={storeLocation.storeName}
                  onChange={(e) => handleUpdateStoreField('storeName', e.target.value)}
                  placeholder="7Days Toys & Babyshop"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-[#0284C7]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Status Badge
                </label>
                <input
                  type="text"
                  value={storeLocation.statusBadge}
                  onChange={(e) => handleUpdateStoreField('statusBadge', e.target.value)}
                  placeholder="Open for Walk-ins"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-[#0284C7]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Visiting &amp; Operating Hours
              </label>
              <input
                type="text"
                value={storeLocation.hours}
                onChange={(e) => handleUpdateStoreField('hours', e.target.value)}
                placeholder="e.g. 9:00 AM – 9:00 PM (All 7 Days)"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-[#0284C7]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Formatted Address
              </label>
              <input
                type="text"
                value={storeLocation.addressFormatted}
                onChange={(e) => handleUpdateStoreField('addressFormatted', e.target.value)}
                placeholder="Payod, Mananthavady, Wayanad, Kerala, India"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-[#0284C7]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Primary Phone Display
                </label>
                <input
                  type="text"
                  value={storeLocation.phoneDisplay}
                  onChange={(e) => handleUpdateStoreField('phoneDisplay', e.target.value)}
                  placeholder="+91 95261 22471"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-[#0284C7]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Google Maps URL
                </label>
                <input
                  type="text"
                  value={storeLocation.mapsSearchUrl}
                  onChange={(e) => handleUpdateStoreField('mapsSearchUrl', e.target.value)}
                  placeholder="https://www.google.com/maps/search/?api=1&query=Payod..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-[#0284C7]"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">Updates footer &amp; location card.</span>
              <button
                type="button"
                onClick={handleSaveStoreLocation}
                disabled={savingLocation}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0284C7] hover:bg-[#0369a1] shadow-sm disabled:opacity-50 transition cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply &amp; Save Store Info</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PRODUCT PICKER MODAL (FOR HERO SHOWCASE)                  */}
      {/* ========================================================= */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#263238]">
                  Select Product for Slot {selectedSlotIndex + 1}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Click any product below to instantly feature its image and name in this Hero slot.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 shrink-0 space-y-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Search toys, cycles, baby essentials by name..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FB8500]"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {categoriesList.slice(0, 10).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setPickerCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition cursor-pointer ${pickerCategory === cat
                        ? 'bg-[#263238] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pr-1">
              {filteredPickerProducts.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-400 text-xs">
                  No products found matching your search.
                </div>
              ) : (
                filteredPickerProducts.slice(0, 32).map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => handleSelectProductForHero(prod)}
                    className="group border border-gray-200 hover:border-[#FB8500] hover:ring-2 hover:ring-[#FB8500]/20 rounded-xl p-2.5 bg-white flex flex-col justify-between transition cursor-pointer"
                  >
                    <div className="aspect-square bg-gray-50 rounded-lg p-2 flex items-center justify-center overflow-hidden mb-2">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block truncate">
                        {prod.category}
                      </span>
                      <h4 className="text-xs font-bold text-[#263238] line-clamp-2 leading-tight mt-0.5">
                        {prod.name}
                      </h4>
                      {prod.price && (
                        <p className="text-xs font-bold text-[#FB8500] mt-1">
                          ₹{prod.price}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      className="mt-2 w-full py-1 text-[10px] font-bold rounded bg-amber-50 text-[#FB8500] group-hover:bg-[#FB8500] group-hover:text-white transition"
                    >
                      Use for Slot {selectedSlotIndex + 1}
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 shrink-0">
              <span>Showing {filteredPickerProducts.length} items</span>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="px-4 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
