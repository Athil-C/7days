import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../../services/productService';
import { getUpdates, addUpdate, updateUpdate, deleteUpdate } from '../../services/updateService';
import { getProductInquiryUrl, createWhatsAppUrl } from '../../data/config';
import HeroShowcaseManager from '../../components/admin/HeroShowcaseManager';
import DailySalesRegister from '../../components/admin/DailySalesRegister';
import StaffAttendanceRegister from '../../components/admin/StaffAttendanceRegister';
import AdminLoginDetailsModal from '../../components/admin/AdminLoginDetailsModal';
import AdminLoginDetailsView from '../../components/admin/AdminLoginDetailsView';
import { getCurrentAdminSession, recordAdminAction } from '../../services/adminLogService';
import { updateHeroSlot } from '../../services/heroShowcaseService';
import {
  Plus,
  Search,
  Send,
  Filter,
  Edit2,
  Trash2,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  LogOut,
  Check,
  X,
  AlertTriangle,
  MessageCircle,
  Database,
  Store,
  Layers,
  Star,
  RefreshCw,
  FolderOpen,
  Bell,
  Calendar,
  CheckCircle2,
  FileText,
  LayoutDashboard,
  LayoutGrid,
  Package,
  History,
  Users,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Menu,
  ShieldCheck,
  Clock
} from 'lucide-react';

const CATEGORIES = [
  'Toys',
  'Outdoors',
  'Baby',
  'Education',
  'Bicycles',
  'Sports',
  'Games',
  'Accessories'
];

export default function AdminDashboard() {
  const { user, signOut, isConfigured } = useAuth();

  // Tab navigation: 'dashboard' | 'products' | 'salesHistory' | 'attendance' | 'settings'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const adminSession = useMemo(() => getCurrentAdminSession(user), [user, isLoginModalOpen]);

  // Notification state
  const [notification, setNotification] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ==========================================
  // PRODUCTS STATE
  // ==========================================
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterType, setFilterType] = useState('all'); // 'all', 'featured', 'database'

  // Product Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteProductCandidate, setDeleteProductCandidate] = useState(null);

  // Product Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Toys');
  const [formPrice, setFormPrice] = useState('');
  const [formMrp, setFormMrp] = useState('');
  const [formAgeGroup, setFormAgeGroup] = useState('');
  const [formColors, setFormColors] = useState('');
  const [formFeatures, setFormFeatures] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formBadge, setFormBadge] = useState('');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formImageFile, setFormImageFile] = useState(null);
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formAdditionalImages, setFormAdditionalImages] = useState('');
  const [productImagePreview, setProductImagePreview] = useState('');
  const [formHeroSlot, setFormHeroSlot] = useState('none');

  // Amazon-style rich specification fields
  const [formBrand, setFormBrand] = useState('Baybee');
  const [formMaterial, setFormMaterial] = useState('');
  const [formItemForm, setFormItemForm] = useState('');
  const [formSpecs, setFormSpecs] = useState('');
  const [formAboutItem, setFormAboutItem] = useState('');

  const productFileInputRef = useRef(null);

  // ==========================================
  // STORE UPDATES STATE
  // ==========================================
  const [updatesList, setUpdatesList] = useState([]);
  const [updatesLoading, setUpdatesLoading] = useState(true);

  // Update Modal states
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState(null);
  const [deleteUpdateCandidate, setDeleteUpdateCandidate] = useState(null);

  // Update Form states
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateTitleMalayalam, setUpdateTitleMalayalam] = useState('');
  const [updateCategory, setUpdateCategory] = useState('New Service');
  const [updateBadge, setUpdateBadge] = useState('Specialized Service');
  const [updateDate, setUpdateDate] = useState('Available Now');
  const [updateDescription, setUpdateDescription] = useState('');
  const [updateHighlights, setUpdateHighlights] = useState('');
  const [updateWhatsappMessage, setUpdateWhatsappMessage] = useState('');
  const [updateIsFeatured, setUpdateIsFeatured] = useState(true);
  const [updateBannerFile, setUpdateBannerFile] = useState(null);
  const [updateBannerUrl, setUpdateBannerUrl] = useState('');
  const [updateBannerPreview, setUpdateBannerPreview] = useState('');

  const updateFileInputRef = useRef(null);

  // Notice notification helper
  const showNotice = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Load all data
  const loadData = async () => {
    setProductsLoading(true);
    setUpdatesLoading(true);
    try {
      const [prods, upds] = await Promise.all([getProducts(), getUpdates()]);
      setProducts(prods);
      setUpdatesList(upds);
    } catch (err) {
      showNotice('error', 'Failed to load data: ' + err.message);
    } finally {
      setProductsLoading(false);
      setUpdatesLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdatesUpdated = async () => {
      try {
        const fresh = await getUpdates();
        setUpdatesList(fresh);
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('7days_updates_updated', handleUpdatesUpdated);
    return () => {
      window.removeEventListener('7days_updates_updated', handleUpdatesUpdated);
    };
  }, []);

  // ==========================================
  // PRODUCT HANDLERS
  // ==========================================
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('Toys');
    setFormPrice('');
    setFormMrp('');
    setFormAgeGroup('');
    setFormColors('');
    setFormFeatures('');
    setFormDescription('');
    setFormBadge('');
    setFormIsFeatured(false);
    setFormHeroSlot('none');
    setFormBrand('Baybee');
    setFormMaterial('');
    setFormItemForm('');
    setFormSpecs('');
    setFormAboutItem('');
    setFormImageFile(null);
    setFormImageUrl('');
    setFormAdditionalImages('');
    setProductImagePreview('');
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setFormName(prod.name || '');
    setFormCategory(prod.category || 'Toys');
    setFormPrice(prod.price !== null && prod.price !== undefined ? String(prod.price) : '');
    setFormMrp(prod.mrp !== null && prod.mrp !== undefined ? String(prod.mrp) : '');
    setFormAgeGroup(prod.ageGroup || '');
    setFormColors(Array.isArray(prod.colors) ? prod.colors.join(', ') : (prod.colors || ''));
    setFormFeatures(Array.isArray(prod.features) ? prod.features.join('\n') : (prod.features || ''));
    setFormDescription(prod.description || '');
    setFormBadge(prod.badge || '');
    setFormIsFeatured(Boolean(prod.isFeatured));
    setFormHeroSlot('none');
    setFormBrand(prod.brand || (prod.name.toLowerCase().includes('baybee') ? 'Baybee' : '7Days Collection'));
    setFormMaterial(prod.material || '');
    setFormItemForm(prod.itemForm || '');
    setFormSpecs(
      typeof prod.specs === 'object' && prod.specs
        ? Object.entries(prod.specs).map(([k, v]) => `${k}: ${v}`).join('\n')
        : (prod.specs || '')
    );
    setFormAboutItem(
      Array.isArray(prod.aboutItem) && prod.aboutItem.length > 0
        ? prod.aboutItem.join('\n')
        : (Array.isArray(prod.features) ? prod.features.join('\n') : '')
    );
    setFormImageFile(null);
    setFormImageUrl(prod.image || '');
    setFormAdditionalImages(Array.isArray(prod.additionalImages) ? prod.additionalImages.join(', ') : '');
    setProductImagePreview(prod.image || '');
    setIsProductModalOpen(true);
  };

  const handleProductFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showNotice('error', 'Please select a valid image file (JPG, PNG, WebP)');
        return;
      }
      setFormImageFile(file);
      setProductImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitProductForm = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      showNotice('error', 'Product title is required');
      return;
    }
    if (!productImagePreview && !formImageFile && !formImageUrl) {
      showNotice('error', 'Please upload or provide a photo for the product');
      return;
    }

    setSubmitting(true);
    try {
      const additionalImgsArray = formAdditionalImages
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const aboutItemArray = formAboutItem
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      if (editingProduct) {
        const updated = await updateProduct(
          editingProduct.id,
          {
            name: formName.trim(),
            category: formCategory,
            price: formPrice,
            mrp: formMrp,
            ageGroup: formAgeGroup.trim() || null,
            brand: formBrand.trim() || null,
            material: formMaterial.trim() || null,
            itemForm: formItemForm.trim() || null,
            specs: formSpecs.trim() || null,
            aboutItem: aboutItemArray,
            colors: formColors,
            features: formFeatures,
            description: formDescription.trim(),
            badge: formBadge.trim() || null,
            isFeatured: formIsFeatured,
            additionalImages: additionalImgsArray,
            image: formImageUrl || editingProduct.image,
          },
          formImageFile
        );
        showNotice('success', `Product "${updated.name}" updated successfully!`);
        recordAdminAction({
          action: 'UPDATE',
          category: 'Products',
          title: `Updated Product: "${updated.name}"`,
          details: `Category: ${updated.category} | Price: ₹${updated.price || 0}`
        });
      } else {
        const created = await addProduct({
          name: formName.trim(),
          category: formCategory,
          price: formPrice,
          mrp: formMrp,
          ageGroup: formAgeGroup.trim() || null,
          brand: formBrand.trim() || null,
          material: formMaterial.trim() || null,
          itemForm: formItemForm.trim() || null,
          specs: formSpecs.trim() || null,
          aboutItem: aboutItemArray,
          colors: formColors,
          features: formFeatures,
          description: formDescription.trim(),
          badge: formBadge.trim() || null,
          isFeatured: formIsFeatured,
          additionalImages: additionalImgsArray,
          imageFile: formImageFile,
          imageUrl: formImageUrl,
        });
        showNotice('success', `Product "${created.name}" created successfully!`);
        recordAdminAction({
          action: 'CREATE',
          category: 'Products',
          title: `Added Product: "${created.name}"`,
          details: `Category: ${created.category} | Price: ₹${created.price || 0}`
        });
      }

      // Sync to Homepage Hero Showcase if a slot was designated
      if (formHeroSlot !== 'none') {
        const targetImage = productImagePreview || formImageUrl || (editingProduct ? editingProduct.image : '');
        await updateHeroSlot(Number(formHeroSlot), {
          title: formName.trim(),
          image: targetImage,
          tag: formBadge.trim() || formCategory,
          productId: editingProduct ? String(editingProduct.id) : null,
        });
        showNotice('success', `Product placed in Homepage Hero Slot ${formHeroSlot}!`);
        recordAdminAction({
          action: 'UPDATE',
          category: 'Showcase',
          title: `Assigned Product to Hero Slot ${formHeroSlot}`,
          details: `Product: "${formName.trim()}"`
        });
      }

      setIsProductModalOpen(false);
      await loadData();
    } catch (err) {
      showNotice('error', 'Failed to save product: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDeleteProduct = async () => {
    if (!deleteProductCandidate) return;
    setSubmitting(true);
    try {
      await deleteProduct(deleteProductCandidate.id, deleteProductCandidate.image);
      showNotice('success', `Product "${deleteProductCandidate.name}" deleted.`);
      recordAdminAction({
        action: 'DELETE',
        category: 'Products',
        title: `Deleted Product: "${deleteProductCandidate.name}"`,
        details: `ID: ${deleteProductCandidate.id} | Category: ${deleteProductCandidate.category || 'Toys'}`
      });
      setDeleteProductCandidate(null);
      await loadData();
    } catch (err) {
      showNotice('error', 'Failed to delete product: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // UPDATE HANDLERS
  // ==========================================
  const handleOpenAddUpdate = () => {
    setEditingUpdate(null);
    setUpdateTitle('');
    setUpdateTitleMalayalam('');
    setUpdateCategory('New Service');
    setUpdateBadge('Specialized Service');
    setUpdateDate('Available Now');
    setUpdateDescription('');
    setUpdateHighlights('');
    setUpdateWhatsappMessage('');
    setUpdateIsFeatured(true);
    setUpdateBannerFile(null);
    setUpdateBannerUrl('');
    setUpdateBannerPreview('');
    setIsUpdateModalOpen(true);
  };

  const handleOpenEditUpdate = (upd) => {
    setEditingUpdate(upd);
    setUpdateTitle(upd.title || '');
    setUpdateTitleMalayalam(upd.titleMalayalam || '');
    setUpdateCategory(upd.category || 'New Service');
    setUpdateBadge(upd.badge || 'Specialized Service');
    setUpdateDate(upd.date || 'Available Now');
    setUpdateDescription(upd.description || '');
    setUpdateHighlights(Array.isArray(upd.highlights) ? upd.highlights.join('\n') : (upd.highlights || ''));
    setUpdateWhatsappMessage(upd.whatsappMessage || '');
    setUpdateIsFeatured(Boolean(upd.isFeatured));
    setUpdateBannerFile(null);
    setUpdateBannerUrl(upd.bannerImage || '');
    setUpdateBannerPreview(upd.bannerImage || '');
    setIsUpdateModalOpen(true);
  };

  const handleUpdateFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showNotice('error', 'Please select a valid image banner file (JPG, PNG, WebP)');
        return;
      }
      setUpdateBannerFile(file);
      setUpdateBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitUpdateForm = async (e) => {
    e.preventDefault();
    if (!updateTitle.trim()) {
      showNotice('error', 'Update title is required');
      return;
    }
    if (!updateBannerPreview && !updateBannerFile && !updateBannerUrl) {
      showNotice('error', 'Please upload or provide a banner image poster');
      return;
    }

    setSubmitting(true);
    try {
      if (editingUpdate) {
        const updated = await updateUpdate(
          editingUpdate.id,
          {
            title: updateTitle.trim(),
            titleMalayalam: updateTitleMalayalam.trim(),
            category: updateCategory,
            badge: updateBadge.trim() || 'Store Notice',
            date: updateDate.trim() || 'Available Now',
            description: updateDescription.trim(),
            highlights: updateHighlights,
            whatsappMessage: updateWhatsappMessage.trim(),
            isFeatured: updateIsFeatured,
            bannerImage: updateBannerUrl || editingUpdate.bannerImage,
          },
          updateBannerFile
        );
        showNotice('success', `Update "${updated.title}" updated successfully!`);
        recordAdminAction({
          action: 'UPDATE',
          category: 'Store Updates',
          title: `Updated Store Announcement: "${updated.title}"`,
          details: `Badge: ${updated.badge} | Category: ${updated.category}`
        });
      } else {
        const created = await addUpdate({
          title: updateTitle.trim(),
          titleMalayalam: updateTitleMalayalam.trim(),
          category: updateCategory,
          badge: updateBadge.trim() || 'Store Notice',
          date: updateDate.trim() || 'Available Now',
          description: updateDescription.trim(),
          highlights: updateHighlights,
          whatsappMessage: updateWhatsappMessage.trim(),
          isFeatured: updateIsFeatured,
          bannerFile: updateBannerFile,
          bannerImageUrl: updateBannerUrl,
        });
        showNotice('success', `Update "${created.title}" published successfully!`);
        recordAdminAction({
          action: 'CREATE',
          category: 'Store Updates',
          title: `Published Store Announcement: "${created.title}"`,
          details: `Badge: ${created.badge} | Category: ${created.category}`
        });
      }
      setIsUpdateModalOpen(false);
      await loadData();
    } catch (err) {
      showNotice('error', 'Failed to save store update: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDeleteUpdate = async () => {
    if (!deleteUpdateCandidate) return;
    setSubmitting(true);
    try {
      await deleteUpdate(deleteUpdateCandidate.id, deleteUpdateCandidate.bannerImage);
      showNotice('success', `Update "${deleteUpdateCandidate.title}" deleted.`);
      recordAdminAction({
        action: 'DELETE',
        category: 'Store Updates',
        title: `Deleted Store Announcement: "${deleteUpdateCandidate.title}"`,
        details: `ID: ${deleteUpdateCandidate.id}`
      });
      setDeleteUpdateCandidate(null);
      await loadData();
    } catch (err) {
      showNotice('error', 'Failed to delete update: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'All' && p.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      if (filterType === 'featured' && !p.isFeatured) return false;
      if (filterType === 'database' && p.source !== 'database' && p.source !== 'local') return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = p.name?.toLowerCase().includes(query);
        const matchDesc = p.description?.toLowerCase().includes(query);
        const matchBadge = p.badge?.toLowerCase().includes(query);
        const matchCat = p.category?.toLowerCase().includes(query);
        return matchName || matchDesc || matchBadge || matchCat;
      }

      return true;
    });
  }, [products, selectedCategory, filterType, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = products.length;
    const featured = products.filter((p) => p.isFeatured).length;
    const dbCount = products.filter((p) => p.source === 'database' || p.source === 'local').length;
    const updatesCount = updatesList.length;
    return { total, featured, dbCount, updatesCount };
  }, [products, updatesList]);

  // RetailOS Sidebar Navigation Items
  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'products', label: 'Products', icon: Package, badge: products.length },
    { id: 'updates', label: 'Updates', icon: Bell, badge: updatesList.length },
    { id: 'attendance', label: 'Attendance', icon: Users },
    { id: 'loginDetails', label: 'Logged Details', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#263238] flex font-body">
      {/* ========================================================= */}
      {/* RETAILOS DARK SIDEBAR NAVIGATION                          */}
      {/* ========================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-[#0e1626] border-r border-[#1a273e] flex flex-col justify-between transition-all duration-300 md:sticky md:top-0 md:h-screen md:max-h-screen shrink-0 select-none ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          } ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Top: Logo & Nav items */}
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto no-scrollbar">
          {/* Logo Bar */}
          <div className="h-20 flex items-center justify-between px-5">
            <Link to="/" className="flex items-center gap-3 min-w-0 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0284c7] via-[#059669] to-[#10b981] flex items-center justify-center font-black text-white text-lg shadow-md shadow-emerald-500/10 shrink-0">
                7
              </div>
              {!isSidebarCollapsed && (
                <div className="flex items-center font-heading font-bold text-xl tracking-tight truncate">
                  <span className="text-white">7Days</span>
                  <span className="text-[#10b981] drop-shadow-[0_0_8px_rgba(16,185,129,0.35)]"></span>
                </div>
              )}
            </Link>
            {/* Mobile close button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white md:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav List */}
          <nav className="px-3 py-2 space-y-1.5 flex-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeTab === item.id ||
                (item.id === 'dashboard' && (activeTab === 'dailySales' || activeTab === 'dashboard')) ||
                (item.id === 'settings' && activeTab === 'hero');
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition cursor-pointer ${isActive
                    ? 'bg-[#1c293d] text-white shadow-xs font-semibold'
                    : 'text-[#8896ab] hover:text-slate-100 hover:bg-[#152033]'
                    } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
                  title={item.label}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-[#8896ab]'}`} />
                  {!isSidebarCollapsed && (
                    <span className="truncate flex-1 text-left text-sm tracking-wide">{item.label}</span>
                  )}
                  {!isSidebarCollapsed && item.badge !== undefined && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#162235] text-slate-300 border border-slate-700/50">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM: ADMIN LOGIN DETAILS & SIDEBAR COLLAPSE            */}
        {/* ========================================================= */}
        <div className="p-3 border-t border-[#1a273e] space-y-2 bg-[#09101d] shrink-0">
          {/* Dedicated Admin Login Details Button & Card */}
          <div
            onClick={() => setIsLoginModalOpen(true)}
            className="w-full text-left p-2.5 rounded-xl bg-[#131d2e] hover:bg-[#18263e] border border-[#1e2e48] hover:border-emerald-500/50 transition cursor-pointer group shadow-xs"
            title="Click to view full login details and session history"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-sm flex items-center justify-center shadow-xs">
                  {user?.email ? user.email.charAt(0).toUpperCase() : 'A'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0e1626]" />
              </div>

              {!isSidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition">
                      {user?.email?.split('@')[0] || 'Store Owner'}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded border border-emerald-500/30">
                      Active
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 truncate font-medium">
                    <Clock className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Logged in: {adminSession?.formattedTime || 'Active'}</span>
                  </div>
                </div>
              )}
            </div>

            {!isSidebarCollapsed && (
              <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px] font-bold text-emerald-400 group-hover:text-emerald-300">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  View Login Details
                </span>
                <span className="text-xs transition-transform group-hover:translate-x-0.5">&rarr;</span>
              </div>
            )}
          </div>

          {/* Sidebar Collapse Button */}
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-[#152033] rounded-xl transition cursor-pointer w-full justify-center"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isSidebarCollapsed ? (
              <ChevronsRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronsLeft className="w-4 h-4" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-2xs h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 md:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb / Title */}
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
              <span className="text-gray-400 hidden sm:inline">7Days</span>
              <span className="text-gray-300 hidden sm:inline">/</span>
              <span className="text-gray-900 font-black text-sm capitalize">
                {activeTab === 'dailySales' || activeTab === 'dashboard'
                  ? 'Dashboard'
                  : activeTab === 'salesHistory'
                    ? 'Sales History'
                    : activeTab === 'attendance'
                      ? 'Attendance'
                      : activeTab === 'loginDetails'
                        ? 'Logged Details'
                        : activeTab === 'hero' || activeTab === 'settings'
                          ? 'Settings & Showcase'
                          : activeTab}
              </span>
            </div>

            {/* Environment Badge */}
            <div className="hidden lg:flex items-center gap-1.5 ml-3 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-gray-200 bg-gray-50">
              <Database className={`w-3 h-3 ${isConfigured ? 'text-emerald-500' : 'text-amber-500'}`} />
              <span className="text-gray-600">
                {isConfigured ? 'Supabase Live' : 'Local Preview'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Logged In Details Pill Trigger */}
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition cursor-pointer shadow-2xs group"
              title="Click to view active session, login time, device, and audit logs"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="hidden sm:inline text-gray-500 font-medium">Logged in:</span>
              <span className="font-bold text-emerald-950 truncate max-w-[130px]">
                {user?.email?.split('@')[0] || 'Admin'}
              </span>
              <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded-md">
                Active
              </span>
            </button>

            <Link
              to="/products"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
              title="Open customer storefront in new tab"
            >
              <Store className="w-3.5 h-3.5 text-gray-500" />
              <span className="hidden sm:inline">View Store</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </Link>

            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl text-red-600 hover:bg-red-50 border border-red-200 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-[1650px] mx-auto">
          {/* Floating Notification */}
          {notification && (
            <div
              className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl border flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-bottom-3 ${notification.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : 'bg-red-900 text-white border-red-700'
                }`}
            >
              {notification.type === 'success' ? (
                <Check className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <span>{notification.message}</span>
              <button
                onClick={() => setNotification(null)}
                className="ml-2 hover:opacity-75 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: DASHBOARD (DAILY SALES REGISTER & ATTENDANCE POS)     */}
          {/* ========================================================= */}
          {(activeTab === 'dashboard' || activeTab === 'dailySales' || activeTab === 'salesHistory') && (
            <DailySalesRegister products={products} showNotice={showNotice} />
          )}

          {/* ========================================================= */}
          {/* TAB: PRODUCTS CATALOG & PHOTO MANAGEMENT                  */}
          {/* ========================================================= */}
          {activeTab === 'products' && (
            <div>
              {/* Header Hero & Stats */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263238] tracking-tight">
                    Catalog & Photo Management
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Add new toy photos, update descriptions, pricing, and specs. Direct WhatsApp inquiry enabled on all items.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={loadData}
                    disabled={productsLoading}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-xs transition cursor-pointer"
                    title="Refresh Products"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${productsLoading ? 'animate-spin text-[#FF6B6B]' : 'text-gray-500'}`} />
                    <span>Refresh</span>
                  </button>

                  <button
                    onClick={handleOpenAddProduct}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#FF6B6B] hover:bg-[#ff5252] shadow-md shadow-[#FF6B6B]/25 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Product</span>
                  </button>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Total Products
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-gray-900 mt-2">{stats.total}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Active in store catalog</p>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Featured Items
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Star className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-gray-900 mt-2">{stats.featured}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Highlighted on homepage</p>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Custom/Uploaded
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Database className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-gray-900 mt-2">{stats.dbCount}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Added via Admin Portal</p>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Checkout Flow
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-gray-900 mt-2">WhatsApp</p>
                  <p className="text-xs text-emerald-600 font-medium mt-0.5">No gateway required</p>
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products by title, description, or badge..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent transition"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] transition cursor-pointer"
                    >
                      <option value="All">All Categories</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quick Filter Tabs */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${filterType === 'all'
                      ? 'bg-[#263238] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    All Items ({products.length})
                  </button>
                  <button
                    onClick={() => setFilterType('featured')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${filterType === 'featured'
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    Featured Only ({stats.featured})
                  </button>
                  <button
                    onClick={() => setFilterType('database')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${filterType === 'database'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    Admin Uploaded ({stats.dbCount})
                  </button>
                  <span className="text-xs text-gray-400 ml-auto hidden sm:inline">
                    Showing {filteredProducts.length} matching products
                  </span>
                </div>
              </div>

              {/* Products Table */}
              {productsLoading ? (
                <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
                  <div className="w-10 h-10 border-4 border-[#FF6B6B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-600">Loading catalog items...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
                  <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-gray-800">No products match your filter</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    Try adjusting your search terms or category filter, or click &quot;Add New Product&quot; to upload your first item.
                  </p>
                  <button
                    onClick={handleOpenAddProduct}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF6B6B] text-white rounded-xl text-xs font-bold hover:bg-[#ff5252] transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add Product Now
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                      <thead className="bg-gray-50/80 text-xs uppercase font-bold text-gray-500 border-b border-gray-200">
                        <tr>
                          <th className="py-3.5 px-4 w-16">Photo</th>
                          <th className="py-3.5 px-4">Product Details</th>
                          <th className="py-3.5 px-4">Category</th>
                          <th className="py-3.5 px-4">Price / Discount</th>
                          <th className="py-3.5 px-4">Badge / Feature</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredProducts.slice(0, 100).map((prod) => {
                          const whatsAppUrl = getProductInquiryUrl(prod);
                          return (
                            <tr key={prod.id} className="hover:bg-gray-50/60 transition group">
                              {/* Image Thumbnail */}
                              <td className="py-3 px-4">
                                <div className="w-14 h-14 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                                  {prod.image ? (
                                    <img
                                      src={prod.image}
                                      alt={prod.name}
                                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=200&q=80';
                                      }}
                                    />
                                  ) : (
                                    <ImageIcon className="w-6 h-6 text-gray-300" />
                                  )}
                                </div>
                              </td>

                              {/* Product Title & Description */}
                              <td className="py-3 px-4 max-w-md">
                                <div className="font-bold text-gray-900 group-hover:text-[#FF6B6B] transition">
                                  {prod.name}
                                </div>
                                {prod.description && (
                                  <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
                                    {prod.description}
                                  </p>
                                )}
                                {prod.source === 'database' || prod.source === 'local' ? (
                                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    <Database className="w-2.5 h-2.5" />
                                    Custom Added
                                  </span>
                                ) : null}
                              </td>

                              {/* Category */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                  {prod.category || 'General'}
                                </span>
                              </td>

                              {/* Price / Discount */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                {prod.price ? (
                                  <div>
                                    <span className="font-bold text-gray-900">
                                      ₹ {prod.price.toLocaleString('en-IN')}
                                    </span>
                                    {prod.mrp && prod.mrp > prod.price && (
                                      <span className="block text-[11px] text-gray-400 line-through">
                                        ₹ {prod.mrp.toLocaleString('en-IN')}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400 italic">On Inquiry</span>
                                )}
                              </td>

                              {/* Badge / Featured Status */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <div className="flex flex-col items-start gap-1">
                                  {prod.badge && (
                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FFB300]/15 text-[#b37d00]">
                                      {prod.badge}
                                    </span>
                                  )}
                                  {prod.isFeatured && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                                      Featured
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Action Buttons */}
                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-1.5">
                                  {/* View Customer Product Page */}
                                  <Link
                                    to={`/product/${prod.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2 rounded-lg text-purple-600 hover:bg-purple-50 transition"
                                    title="View Customer Product Page (Left Photo, Right Details)"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </Link>


                                  {/* WhatsApp Direct Test */}
                                  <a
                                    href={whatsAppUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition"
                                    title="Test WhatsApp Order Link"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                  </a>

                                  {/* Edit Button */}
                                  <button
                                    onClick={() => handleOpenEditProduct(prod)}
                                    className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                                    title="Edit product & photo"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>

                                  {/* Delete Button */}
                                  <button
                                    onClick={() => setDeleteProductCandidate(prod)}
                                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition cursor-pointer"
                                    title="Delete product"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {filteredProducts.length > 100 && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-500">
                      Displaying first 100 of {filteredProducts.length} items. Use search to find specific items.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: STORE UPDATES & ANNOUNCEMENTS                      */}
          {/* ========================================================= */}
          {activeTab === 'updates' && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263238] tracking-tight">
                    Store Updates & News Management
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Publish notices, new service expansions (like battery/cycle service), and festival announcements displayed on the homepage.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={loadData}
                    disabled={updatesLoading}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-xs transition cursor-pointer"
                    title="Refresh Updates"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${updatesLoading ? 'animate-spin text-[#FF6B6B]' : 'text-gray-500'}`} />
                    <span>Refresh</span>
                  </button>

                  <button
                    onClick={handleOpenAddUpdate}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#FF6B6B] hover:bg-[#ff5252] shadow-md shadow-[#FF6B6B]/25 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Store Update</span>
                  </button>
                </div>
              </div>

              {/* Updates Cards List */}
              {updatesLoading ? (
                <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
                  <div className="w-10 h-10 border-4 border-[#FF6B6B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-600">Loading store updates...</p>
                </div>
              ) : updatesList.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-gray-800">No store updates published yet</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    Click below to publish your first announcement or service update.
                  </p>
                  <button
                    onClick={handleOpenAddUpdate}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF6B6B] text-white rounded-xl text-xs font-bold hover:bg-[#ff5252] transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add Update Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {updatesList.map((upd) => {
                    const whatsAppMsg = upd.whatsappMessage || `Hi 7Days Toys, inquiring about: ${upd.title}`;
                    return (
                      <div
                        key={upd.id}
                        className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-5 sm:p-7 shadow-xs hover:shadow-md transition flex flex-col md:flex-row gap-6 items-start"
                      >
                        {/* Banner Poster Thumbnail */}
                        <div className="w-full md:w-64 h-48 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 relative group">
                          <img
                            src={upd.bannerImage}
                            alt={upd.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&q=80';
                            }}
                          />
                          <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white shadow-xs">
                            {upd.badge || 'Update'}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col justify-between h-full">
                          <div>
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                {upd.category || 'Store Notice'}
                              </span>
                              {upd.date && (
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {upd.date}
                                </span>
                              )}
                              {upd.isFeatured && (
                                <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-amber-400" />
                                  Featured on Homepage
                                </span>
                              )}
                            </div>

                            <h3 className="text-lg sm:text-xl font-extrabold text-[#263238] leading-snug mb-2">
                              {upd.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4">
                              {upd.description}
                            </p>

                            {/* Highlights */}
                            {upd.highlights && upd.highlights.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                                {upd.highlights.slice(0, 4).map((h, i) => (
                                  <div key={i} className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>{h}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Card Actions */}
                          <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
                            <a
                              href={createWhatsAppUrl(whatsAppMsg)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 text-xs font-bold transition"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Test WhatsApp Link</span>
                            </a>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenEditUpdate(upd)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>

                              <button
                                onClick={() => setDeleteUpdateCandidate(upd)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}


          {/* ========================================================= */}
          {/* TAB: STAFF ATTENDANCE REGISTER                            */}
          {/* ========================================================= */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <StaffAttendanceRegister
                selectedDate={new Date().toISOString().split('T')[0]}
                showNotice={showNotice}
              />
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: ADMIN LOGGED DETAILS & SESSION AUDIT                 */}
          {/* ========================================================= */}
          {activeTab === 'loginDetails' && (
            <AdminLoginDetailsView
              user={user}
              onSignOut={signOut}
              showNotice={showNotice}
            />
          )}

          {/* ========================================================= */}
          {/* TAB: SETTINGS & HOMEPAGE SHOWCASE MANAGER                 */}
          {/* ========================================================= */}
          {(activeTab === 'hero' || activeTab === 'settings') && (
            <HeroShowcaseManager
              products={products}
              updatesList={updatesList}
              setActiveTab={setActiveTab}
              showNotice={showNotice}
            />
          )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* ADD / EDIT PRODUCT MODAL */}
      {/* ========================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-black text-[#263238] tracking-tight">
              {editingProduct ? 'Edit Product & Details' : 'Add New Product'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Add photos, specifications, pricing, and colors. Configures the exact 2-column detail page for customers.
            </p>

            <form onSubmit={handleSubmitProductForm} className="mt-5 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              {/* Photo Upload Box */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Main Product Photo <span className="text-red-500">*</span>
                </label>

                <div
                  onClick={() => productFileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 hover:border-[#FF6B6B] rounded-2xl p-4 text-center cursor-pointer transition bg-gray-50/50 hover:bg-red-50/30 group"
                >
                  <input
                    type="file"
                    ref={productFileInputRef}
                    onChange={handleProductFileChange}
                    accept="image/*"
                    className="hidden"
                  />

                  {productImagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={productImagePreview}
                        alt="Preview"
                        className="w-36 h-36 object-contain bg-white rounded-xl shadow-xs border border-gray-200 mx-auto"
                      />
                      <div className="mt-2 text-xs font-semibold text-[#FF6B6B] flex items-center justify-center gap-1">
                        <Upload className="w-3.5 h-3.5" />
                        Click to change photo
                      </div>
                    </div>
                  ) : (
                    <div className="py-4">
                      <div className="w-12 h-12 rounded-full bg-red-50 text-[#FF6B6B] flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-gray-700">
                        Click to upload photo from your phone or PC
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        JPG, PNG, WebP supported
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-2">
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => {
                      setFormImageUrl(e.target.value);
                      if (e.target.value) setProductImagePreview(e.target.value);
                    }}
                    placeholder="Or enter image URL (e.g. /products/... or https://...)"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#FF6B6B]"
                  />
                </div>
              </div>

              {/* Product Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Product Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Baybee Rampage Rechargeable Battery Operated Jeep for Kids"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
                />
              </div>

              {/* Category & Badge Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Badge / Tag (Optional)
                  </label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="e.g. Electric Jeep, Bestseller, Save 42%"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
                  />
                </div>
              </div>

              {/* Price & MRP (Original Price) Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="e.g. 25990"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Original MRP (₹) <span className="text-[10px] text-gray-400 font-normal">(for strikethrough)</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formMrp}
                    onChange={(e) => setFormMrp(e.target.value)}
                    placeholder="e.g. 44990"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
                  />
                </div>

                {formPrice && formMrp && Number(formMrp) > Number(formPrice) && (
                  <div className="sm:col-span-2 text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>
                      Automatic Discount Badge:{' '}
                      <span className="bg-emerald-100 px-2 py-0.5 rounded text-emerald-800">
                        Save {Math.round(((Number(formMrp) - Number(formPrice)) / Number(formMrp)) * 100)}% OFF
                      </span>
                    </span>
                  </div>
                )}
              </div>

              {/* Age Group & Colors Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Age Suitability
                  </label>
                  <input
                    type="text"
                    value={formAgeGroup}
                    onChange={(e) => setFormAgeGroup(e.target.value)}
                    placeholder="e.g. 2 to 8 Years"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Available Colors (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formColors}
                    onChange={(e) => setFormColors(e.target.value)}
                    placeholder="e.g. Red, Black, White, Yellow"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
                  />
                </div>
              </div>

              {/* Brand & Item Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="e.g. Baybee, Hero Cycles, 7Days"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Item Form / Type
                  </label>
                  <input
                    type="text"
                    value={formItemForm}
                    onChange={(e) => setFormItemForm(e.target.value)}
                    placeholder="e.g. 4x4 Battery Operated Jeep, Mountain Bike"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
                  />
                </div>
              </div>

              {/* Material & Safety Feature */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Material / Safety Feature
                </label>
                <input
                  type="text"
                  value={formMaterial}
                  onChange={(e) => setFormMaterial(e.target.value)}
                  placeholder="e.g. Non-Toxic Virgin BPA-Free Plastic & High Tensile Alloy Steel"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
                />
              </div>

              {/* Specifications Matrix Table (Amazon Style Key-Value pairs) */}
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                    Specifications Matrix (Key: Value per line)
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">Format: Key: Value</span>
                </div>
                <textarea
                  rows={4}
                  value={formSpecs}
                  onChange={(e) => setFormSpecs(e.target.value)}
                  placeholder={"Battery: 12V 7Ah Rechargeable\nMotor: Dual 390 High-Torque Motors\nWeight Capacity: Up to 35 kg\nRemote Control: 2.4G Bluetooth Parental Remote\nSpeed: 3 - 5 km/h\nCharging Time: 6 - 8 Hours"}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] resize-none"
                />
                <p className="text-[11px] text-gray-500">
                  Renders as an Amazon-style 2-column specifications table on the product page.
                </p>
              </div>

              {/* About this item (Amazon Style Bullet Highlights) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  About this item (Bullet Highlights — 1 per line)
                </label>
                <textarea
                  rows={4}
                  value={formAboutItem}
                  onChange={(e) => setFormAboutItem(e.target.value)}
                  placeholder={"DUAL DRIVING MODES: Can be operated manually by child via foot pedal and steering, or by parents via 2.4G remote control.\nENTERTAINMENT CONSOLE: Built-in music console, USB/AUX port, battery percentage indicator, and bright LED headlamps.\nSAFETY GUARANTEE: Equipped with slow-start technology, 5-point safety harness, and multi-wheel spring shock absorbers."}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] resize-none"
                />
                <p className="text-[11px] text-gray-500">
                  Tip: Start each line with a bold heading like <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">HEADING: description</code> for Amazon formatting.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Full Description
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detailed product information, safety instructions, store warranty, etc."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] resize-none"
                />
              </div>

              {/* Extra Gallery Photos */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Additional Photo URLs (comma separated for gallery)
                </label>
                <input
                  type="text"
                  value={formAdditionalImages}
                  onChange={(e) => setFormAdditionalImages(e.target.value)}
                  placeholder="https://...image2.jpg, https://...image3.jpg"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B6B]"
                />
              </div>

              {/* Featured toggle */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/60 border border-amber-200/60">
                <input
                  type="checkbox"
                  id="featuredToggle"
                  checked={formIsFeatured}
                  onChange={(e) => setFormIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-[#FF6B6B] rounded border-gray-300 focus:ring-[#FF6B6B] cursor-pointer"
                />
                <label htmlFor="featuredToggle" className="text-xs font-bold text-gray-800 cursor-pointer">
                  Feature this item on Homepage highlights
                </label>
              </div>

              {/* Homepage Hero Showcase Placement */}
              <div className="p-3.5 rounded-xl bg-[#FFF9F0] border border-[#FFB703]/40">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-[#FB8500]" />
                    <span>Homepage Hero Placement</span>
                  </label>
                  <span className="text-[10px] font-bold text-[#FB8500]">"Little things. Big smiles."</span>
                </div>
                <p className="text-[11px] text-gray-500 mb-2">
                  Choose if this product should occupy one of the 3 main photos on the homepage hero collage.
                </p>
                <select
                  value={formHeroSlot}
                  onChange={(e) => setFormHeroSlot(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs bg-white text-gray-800 font-medium focus:ring-1 focus:ring-[#FB8500]"
                >
                  <option value="none">Standard Catalog Only (Do not feature in Hero 3-photo collage)</option>
                  <option value="1">Slot 1: Main Feature (Large Left photo)</option>
                  <option value="2">Slot 2: Top Right Card</option>
                  <option value="3">Slot 3: Bottom Right Card</option>
                </select>
                {formHeroSlot !== 'none' && (
                  <p className="text-[11px] font-bold text-[#6A994E] mt-1.5 flex items-center gap-1">
                    ✓ Saving will immediately put this product's photo into Hero Slot {formHeroSlot}!
                  </p>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#FF6B6B] hover:bg-[#ff5252] shadow-md shadow-[#FF6B6B]/25 disabled:opacity-50 transition cursor-pointer"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingProduct ? 'Save Changes' : 'Upload & Publish'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD / EDIT STORE UPDATE MODAL                             */}
      {/* ========================================================= */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsUpdateModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-red-600 mb-1">
              <Bell className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Store Announcements</span>
            </div>
            <h2 className="text-xl font-black text-[#263238] tracking-tight">
              {editingUpdate ? 'Edit Store Update' : 'Publish New Store Update'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Create a new announcement with banner poster, Malayalam/English titles, and bullet highlights.
            </p>

            <form onSubmit={handleSubmitUpdateForm} className="mt-5 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              {/* Poster Upload Box */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Update Poster / Banner Image <span className="text-red-500">*</span>
                </label>

                <div
                  onClick={() => updateFileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 hover:border-red-500 rounded-2xl p-4 text-center cursor-pointer transition bg-gray-50/50 hover:bg-red-50/20 group"
                >
                  <input
                    type="file"
                    ref={updateFileInputRef}
                    onChange={handleUpdateFileChange}
                    accept="image/*"
                    className="hidden"
                  />

                  {updateBannerPreview ? (
                    <div className="relative inline-block w-full max-w-md">
                      <img
                        src={updateBannerPreview}
                        alt="Preview Banner"
                        className="w-full h-44 object-contain bg-white rounded-xl shadow-xs border border-gray-200 mx-auto"
                      />
                      <div className="mt-2 text-xs font-semibold text-red-600 flex items-center justify-center gap-1">
                        <Upload className="w-3.5 h-3.5" />
                        Click to change banner
                      </div>
                    </div>
                  ) : (
                    <div className="py-4">
                      <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-gray-700">
                        Click to upload poster banner from your phone or PC
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        JPG, PNG, WebP banner image
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-2">
                  <input
                    type="url"
                    value={updateBannerUrl}
                    onChange={(e) => {
                      setUpdateBannerUrl(e.target.value);
                      if (e.target.value) setUpdateBannerPreview(e.target.value);
                    }}
                    placeholder="Or enter banner image URL (e.g. /updates/... or https://...)"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Subtitle (Optional)
                </label>
                <input
                  type="text"
                  value={updateTitleMalayalam}
                  onChange={(e) => setUpdateTitleMalayalam(e.target.value)}
                  placeholder="e.g. Specialized Repair, Diagnostics & Parts"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={updateTitle}
                  onChange={(e) => setUpdateTitle(e.target.value)}
                  placeholder="e.g. Electric Car, Bike & Gear Cycle Spare Parts & Service Available"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Category, Badge, Date 3-Col Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={updateCategory}
                    onChange={(e) => setUpdateCategory(e.target.value)}
                    placeholder="e.g. New Service, Offer"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    value={updateBadge}
                    onChange={(e) => setUpdateBadge(e.target.value)}
                    placeholder="e.g. Specialized Service"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Status / Date
                  </label>
                  <input
                    type="text"
                    value={updateDate}
                    onChange={(e) => setUpdateDate(e.target.value)}
                    placeholder="e.g. Available Now"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Full Description
                </label>
                <textarea
                  rows={3}
                  value={updateDescription}
                  onChange={(e) => setUpdateDescription(e.target.value)}
                  placeholder="Complete repair, spare parts replacement, and professional maintenance service at our Payod showroom..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              {/* Highlights (Bullet Points) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Bullet Highlights (1 per line)
                </label>
                <textarea
                  rows={3}
                  value={updateHighlights}
                  onChange={(e) => setUpdateHighlights(e.target.value)}
                  placeholder={"Electric Ride-on Cars & Bikes Servicing\nAll Kinds of Gear Cycle Service & Tuning\nAuthentic Spare Parts & Battery Replacements\nExpert In-Store Diagnostic & Quick Repair"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none font-mono"
                />
              </div>

              {/* WhatsApp Message */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Custom WhatsApp Pre-filled Message (Optional)
                </label>
                <input
                  type="text"
                  value={updateWhatsappMessage}
                  onChange={(e) => setUpdateWhatsappMessage(e.target.value)}
                  placeholder="Hi 7Days Toys, I would like to inquire about..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Featured toggle */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50/60 border border-red-200/60">
                <input
                  type="checkbox"
                  id="featuredUpdateToggle"
                  checked={updateIsFeatured}
                  onChange={(e) => setUpdateIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer"
                />
                <label htmlFor="featuredUpdateToggle" className="text-xs font-bold text-gray-800 cursor-pointer">
                  Feature this announcement prominently on the Homepage
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/25 disabled:opacity-50 transition cursor-pointer"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingUpdate ? 'Save Changes' : 'Publish Update'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELETE PRODUCT CONFIRMATION DIALOG                        */}
      {/* ========================================================= */}
      {deleteProductCandidate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-gray-900">
              Delete Product?
            </h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-gray-700">&quot;{deleteProductCandidate.name}&quot;</span>? This will remove its photo and details from the catalog.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteProductCandidate(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmDeleteProduct}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/25 disabled:opacity-50 transition cursor-pointer"
              >
                {submitting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELETE STORE UPDATE CONFIRMATION DIALOG                   */}
      {/* ========================================================= */}
      {deleteUpdateCandidate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-gray-900">
              Delete Store Update?
            </h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-gray-700">&quot;{deleteUpdateCandidate.title}&quot;</span>? This will remove the announcement from the homepage.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteUpdateCandidate(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmDeleteUpdate}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/25 disabled:opacity-50 transition cursor-pointer"
              >
                {submitting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Login Details & Session Activity Modal */}
      <AdminLoginDetailsModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        user={user}
        onSignOut={signOut}
      />
    </div>
  );
}
