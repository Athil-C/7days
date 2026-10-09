import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById, getProducts } from '../services/productService';
import {
  SHOP_FULL_NAME,
  SHOP_PHONE_DISPLAY,
  SHOP_PHONE_CALL,
  createWhatsAppUrl
} from '../data/config';
import { usePageSEO } from '../hooks/usePageSEO';
import ProductCard from '../components/ProductCard';
import {
  MessageCircle,
  Truck,
  ChevronRight,
  Phone,
  Video,
  ShieldCheck,
  ArrowLeft,
  RotateCcw,
  CreditCard,
  Wrench,
  Star,
  Store
} from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gallery active image
  const [activeImage, setActiveImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  // Pincode check
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [prod, list] = await Promise.all([
          getProductById(id),
          getProducts(),
        ]);
        if (isMounted) {
          setProduct(prod);
          setAllProducts(list);
          if (prod) {
            setActiveImage(prod.image);
            if (prod.colors && prod.colors.length > 0) {
              setSelectedColor(prod.colors[0]);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load product detail:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Dynamic SEO
  usePageSEO({
    title: product ? `${product.name} | ${SHOP_FULL_NAME}` : `Product Details | ${SHOP_FULL_NAME}`,
    description: product?.description || `Explore ${product?.name} at 7Days Toys & Babyshop, Mananthavady.`,
    canonicalPath: `/product/${id}`,
  });

  // Calculate discount percentage if price and MRP are available
  const discountPercent = useMemo(() => {
    const price = product?.price;
    const mrp = product?.mrp;
    if (price && mrp && mrp > price) {
      return Math.round(((mrp - price) / mrp) * 100);
    }
    return null;
  }, [product]);

  // Gallery images list (main image + additional images)
  const galleryImages = useMemo(() => {
    if (!product) return [];
    const list = [product.image];
    if (Array.isArray(product.additionalImages)) {
      product.additionalImages.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list;
  }, [product]);

  // Related products from same category
  const relatedProducts = useMemo(() => {
    if (!product || !allProducts.length) return [];
    return allProducts
      .filter((p) => String(p.id) !== String(product.id) && p.category === product.category)
      .slice(0, 4);
  }, [product, allProducts]);

  // Parse structured specifications matrix
  const parsedSpecs = useMemo(() => {
    if (!product) return [];
    const list = [];

    if (product.brand) {
      list.push({ key: 'Brand', value: product.brand });
    }
    if (product.itemForm) {
      list.push({ key: 'Item Form', value: product.itemForm });
    }
    if (product.ageGroup) {
      list.push({ key: 'Age Range', value: product.ageGroup });
    }
    if (product.material) {
      list.push({ key: 'Material', value: product.material });
    }

    if (product.specs) {
      if (typeof product.specs === 'object' && !Array.isArray(product.specs)) {
        Object.entries(product.specs).forEach(([k, v]) => {
          if (v && !list.some((item) => item.key.toLowerCase() === k.toLowerCase())) {
            list.push({ key: k, value: String(v) });
          }
        });
      } else if (typeof product.specs === 'string') {
        const lines = product.specs.split('\n');
        lines.forEach((line) => {
          const colonIdx = line.indexOf(':');
          if (colonIdx > 0) {
            const k = line.slice(0, colonIdx).trim();
            const v = line.slice(colonIdx + 1).trim();
            if (k && v && !list.some((item) => item.key.toLowerCase() === k.toLowerCase())) {
              list.push({ key: k, value: v });
            }
          }
        });
      }
    }

    return list;
  }, [product]);

  // Parse "About this item" bullet points
  const parsedAboutItems = useMemo(() => {
    if (!product) return [];
    let items = [];

    if (Array.isArray(product.aboutItem) && product.aboutItem.length > 0) {
      items = product.aboutItem.filter(Boolean);
    } else if (typeof product.aboutItem === 'string' && product.aboutItem.trim()) {
      items = product.aboutItem
        .split('\n')
        .map((s) => s.trim().replace(/^[-•*]\s*/, ''))
        .filter(Boolean);
    } else if (Array.isArray(product.features) && product.features.length > 0) {
      items = product.features.filter(Boolean);
    }

    return items;
  }, [product]);

  // Helper to format Amazon-style bold prefixes on bullet items
  const renderBulletContent = (text) => {
    const colonIdx = text.indexOf(':');
    if (colonIdx > 0 && colonIdx < 45) {
      const prefix = text.slice(0, colonIdx).trim();
      const rest = text.slice(colonIdx + 1).trim();
      return (
        <span>
          <strong className="font-bold text-gray-900 tracking-tight uppercase text-[13px]">{prefix}:</strong>{' '}
          <span className="text-gray-700 leading-relaxed text-[13px] sm:text-sm">{rest}</span>
        </span>
      );
    }
    return <span className="text-gray-700 leading-relaxed text-[13px] sm:text-sm">{text}</span>;
  };

  // Handle Pincode Check (Exclusively Wayanad District)
  const handleCheckPincode = (e) => {
    e.preventDefault();
    const cleanPin = pincode.trim();
    if (!cleanPin || cleanPin.length !== 6 || isNaN(cleanPin)) {
      setPincodeStatus({
        success: false,
        message: 'Please enter a valid 6-digit postal PIN code.',
      });
      return;
    }

    // Postal PIN codes across Wayanad district (e.g. 670645 Mananthavady, 673121 Kalpetta, 673571 Sulthan Bathery, etc.)
    const isWayanad =
      cleanPin.startsWith('67064') ||
      cleanPin.startsWith('67072') ||
      cleanPin.startsWith('67073') ||
      cleanPin.startsWith('67074') ||
      cleanPin.startsWith('67312') ||
      cleanPin.startsWith('67357') ||
      cleanPin.startsWith('67359');

    if (isWayanad) {
      setPincodeStatus({
        success: true,
        message: '✓ Delivery Available in Wayanad! Same-day / next-day doorstep delivery or store pickup ready at Payod, Mananthavady.',
      });
    } else {
      setPincodeStatus({
        success: false,
        message: '✕ Delivery is NOT available for this location. Delivery is exclusively available within Wayanad district (Kerala). You can still choose in-store pickup at our Payod, Mananthavady showroom!',
      });
    }
  };

  // Generate WhatsApp Order URL
  const whatsAppOrderUrl = useMemo(() => {
    if (!product) return '';
    let msg = `Hi ${SHOP_FULL_NAME},\n\nI would like to order / inquire about this product:\n\n*${product.name}*`;
    if (product.brand) msg += `\nBrand: ${product.brand}`;
    if (product.category) msg += `\nCategory: ${product.category}`;
    if (selectedColor) msg += `\nSelected Color: ${selectedColor}`;
    if (product.price) msg += `\nPrice: ₹${product.price.toLocaleString('en-IN')}`;
    if (product.image) msg += `\nProduct Photo: ${window.location.origin}${product.image}`;
    msg += `\n\nCould you please confirm availability and provide details?\nThank you!`;
    return createWhatsAppUrl(msg);
  }, [product, selectedColor]);

  // Generate WhatsApp Video Request URL
  const whatsAppVideoUrl = useMemo(() => {
    if (!product) return '';
    const msg = `Hi ${SHOP_FULL_NAME},\nCould you please share a quick video demo of *${product.name}*? I'd like to see its size and live look.\nThank you!`;
    return createWhatsAppUrl(msg);
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9F0] flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-[#FF6B6B] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-600 font-medium text-sm">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FFF9F0] flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mb-4">
          <RotateCcw className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Product Not Found</h1>
        <p className="text-sm text-gray-500 mt-2 max-w-md">
          This product might have been updated or removed from the catalog.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF6B6B] text-white font-bold text-sm shadow-md hover:bg-[#ff5252] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse All Products</span>
        </Link>
      </div>
    );
  }

  const brandName = product.brand || '7Days';

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#263238] font-body py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-4 flex-wrap">
          <Link to="/" className="hover:text-[#FF6B6B] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <Link to="/products" className="hover:text-[#FF6B6B] transition-colors">
            All Collections
          </Link>
          {product.category && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <Link
                to={`/products?category=${encodeURIComponent(product.category)}`}
                className="hover:text-[#FF6B6B] transition-colors"
              >
                {product.category}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-900 font-semibold truncate max-w-xs sm:max-w-md">
            {product.name}
          </span>
        </nav>

        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#FF6B6B] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* MAIN PRODUCT DETAIL CARD (AMAZON-STYLE STRUCTURE)          */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 border border-gray-200/90 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* ------------------------------------------------------- */}
            {/* LEFT COLUMN: PRODUCT IMAGES / GALLERY                   */}
            {/* ------------------------------------------------------- */}
            <div className="lg:col-span-6 flex flex-col gap-4 lg:sticky lg:top-24">
              {/* Main Photo Stage */}
              <div className="relative aspect-square bg-[#F8F9FA] rounded-2xl border border-gray-200/80 overflow-hidden flex items-center justify-center p-6 sm:p-8 group">
                <img
                  src={activeImage || product.image}
                  alt={product.name}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80';
                  }}
                />

                {/* Badge Overlay (Top Left) */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  {discountPercent ? (
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#CC0C39] text-white shadow-sm tracking-wide uppercase">
                      -{discountPercent}% OFF
                    </span>
                  ) : product.badge ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FB8500] text-white shadow-sm tracking-wide uppercase">
                      {product.badge}
                    </span>
                  ) : null}

                  {product.isFeatured && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-xs">
                      Featured
                    </span>
                  )}
                </div>

                {/* In-Store Availability Badge (Bottom Right) */}
                <div className="absolute bottom-4 right-4 z-10">
                  <span className="text-[11px] font-semibold bg-[#263238]/90 backdrop-blur-xs text-white px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                    In-Store Stock • Payod
                  </span>
                </div>
              </div>

              {/* Multi-Image Thumbnails */}
              {galleryImages.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto py-1">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 p-1 bg-white shrink-0 transition cursor-pointer ${
                        activeImage === img
                          ? 'border-[#FF6B6B] shadow-sm'
                          : 'border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} thumb ${idx + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ------------------------------------------------------- */}
            {/* RIGHT COLUMN: AMAZON-STYLE STRUCTURED DETAILS           */}
            {/* ------------------------------------------------------- */}
            <div className="lg:col-span-6 flex flex-col gap-4 sm:gap-5">
              
              {/* Product Title & Brand Link */}
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#111827] font-heading leading-snug">
                  {product.name}
                </h1>
                
                <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                  <Link
                    to={`/products?category=${encodeURIComponent(product.category || '')}`}
                    className="text-xs sm:text-sm font-semibold text-[#007185] hover:text-[#C7511F] hover:underline transition"
                  >
                    Visit the {brandName} Store
                  </Link>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500 font-medium">
                    Payod, Mananthavady
                  </span>
                </div>
              </div>

              {/* Rating & In-Store Choice Strip */}
              <div className="flex items-center gap-3 flex-wrap text-xs pb-1 border-b border-gray-100">
                <div className="flex items-center gap-1 text-amber-500">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-gray-700 font-bold ml-1">4.8</span>
                </div>
                
                <span className="inline-flex items-center gap-1 bg-[#232F3E] text-white px-2 py-0.5 rounded text-[11px] font-bold">
                  <span className="text-amber-400">7Days</span> Choice
                </span>

                <span className="text-gray-500 font-medium">
                  Direct Store Guarantee • In-Store Spares
                </span>
              </div>

              {/* Special Deal Tag */}
              {discountPercent && (
                <div>
                  <span className="inline-block bg-[#CC0C39] text-white text-[11px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                    Store Special Deal
                  </span>
                </div>
              )}

              {/* Pricing Section (Amazon Style) */}
              <div className="space-y-1">
                {product.price ? (
                  <div className="flex items-baseline gap-2.5 flex-wrap">
                    {discountPercent && (
                      <span className="text-2xl sm:text-3xl font-normal text-[#CC0C39]">
                        -{discountPercent}%
                      </span>
                    )}
                    <div className="flex items-start">
                      <span className="text-sm font-medium text-gray-900 mt-1">₹</span>
                      <span className="text-2xl sm:text-3xl font-extrabold text-[#0F1111] leading-none">
                        {product.price.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {product.mrp && product.mrp > product.price && (
                      <span className="text-xs sm:text-sm text-gray-500">
                        M.R.P.: <span className="line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      Best Price On Inquiry
                    </span>
                    <span className="text-xs text-gray-500">
                      (Direct Store Wholesale/Retail Pricing)
                    </span>
                  </div>
                )}

                {/* Fulfilled / Taxes Row */}
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#FF9900]/15 text-[#8F5500] px-2 py-0.5 rounded border border-[#FF9900]/30">
                    ✓ Fulfilled by 7Days
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Inclusive of all taxes
                  </span>
                </div>
              </div>

              {/* Service & Trust Badges Strip (Amazon 5-Icon Strip) */}
              <div className="grid grid-cols-5 gap-2 pt-2 pb-3 border-y border-gray-150 text-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                    <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-[#007185] leading-tight">
                    Wayanad Delivery
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-[#007185] leading-tight">
                    Pay on Delivery
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-[#007185] leading-tight">
                    100% Inspected
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                    <Video className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-[#007185] leading-tight">
                    WhatsApp Demo
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                    <Wrench className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-[#007185] leading-tight">
                    Spares & Service
                  </span>
                </div>
              </div>

              {/* Color / Variant Selection */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-gray-700 mb-2">
                    Color: <span className="text-gray-900 font-semibold">{selectedColor}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {product.colors.map((colorName, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedColor(colorName)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                          selectedColor === colorName
                            ? 'bg-[#111827] text-white border-[#111827] shadow-xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {colorName}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Amazon-Style 2-Column Specifications Table */}
              {parsedSpecs.length > 0 && (
                <div className="border border-gray-200 rounded-xl overflow-hidden text-xs">
                  <div className="bg-gray-50 px-3.5 py-2 border-b border-gray-200 font-bold text-gray-800 uppercase tracking-wider text-[11px]">
                    Product Specifications
                  </div>
                  <div className="divide-y divide-gray-150">
                    {parsedSpecs.map((spec, idx) => (
                      <div key={idx} className="grid grid-cols-12 px-3.5 py-2 hover:bg-gray-50/60 transition">
                        <span className="col-span-5 sm:col-span-4 font-bold text-gray-600">
                          {spec.key}
                        </span>
                        <span className="col-span-7 sm:col-span-8 text-gray-900 font-medium">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Primary Call-To-Action Buttons (WhatsApp First) */}
              <div className="space-y-2 pt-1">
                <a
                  href={whatsAppOrderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-sm sm:text-base shadow-md flex items-center justify-center gap-2.5 transition active:scale-98"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>Order / Inquire on WhatsApp</span>
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={whatsAppVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-lg border border-sky-200 bg-sky-50/80 hover:bg-sky-100 text-sky-900 font-bold text-xs flex items-center justify-center gap-1.5 transition text-center"
                  >
                    <Video className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>Ask for Live Video</span>
                  </a>

                  <a
                    href={`tel:${SHOP_PHONE_CALL}`}
                    className="py-2.5 px-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs flex items-center justify-center gap-1.5 transition text-center"
                  >
                    <Phone className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>Call Store ({SHOP_PHONE_DISPLAY})</span>
                  </a>
                </div>
              </div>

              {/* Pincode Availability Checker */}
              <div className="border border-gray-200 rounded-xl p-3 bg-white space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#FF6B6B]" />
                    <span>Check Delivery Availability</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Wayanad Only
                  </span>
                </div>

                <form onSubmit={handleCheckPincode} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => {
                      setPincode(e.target.value);
                      setPincodeStatus(null);
                    }}
                    placeholder="Enter 6-digit PIN code (e.g. 670645)"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] transition"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition cursor-pointer"
                  >
                    Apply
                  </button>
                </form>

                <p className="text-[11px] text-gray-400">
                  Direct doorstep delivery is exclusively available across Wayanad district (Kerala).
                </p>

                {pincodeStatus && (
                  <p
                    className={`text-xs font-semibold ${
                      pincodeStatus.success ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {pincodeStatus.message}
                  </p>
                )}
              </div>

              {/* "About this item" (Amazon-Style Bullet Points) */}
              {parsedAboutItems.length > 0 && (
                <div className="pt-2 border-t border-gray-200 space-y-2.5">
                  <h3 className="text-base font-extrabold text-[#0F1111]">
                    About this item
                  </h3>
                  <ul className="space-y-2 list-disc pl-5">
                    {parsedAboutItems.map((item, idx) => (
                      <li key={idx} className="pl-1">
                        {renderBulletContent(item)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Extended Description */}
              {product.description && (
                <div className="pt-2 border-t border-gray-150">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Product Description
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Store Address & Direct Service Details */}
              <div className="pt-3 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-gray-500 bg-gray-50 p-3 rounded-xl">
                <div className="flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-[#FF6B6B]" />
                  <span>Physical Store: Payod, Mananthavady, Wayanad</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pre-tested battery & in-house warranty</span>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* RELATED PRODUCTS SECTION                                  */}
        {/* ========================================================= */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 sm:mt-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-bold text-[#FF6B6B] uppercase tracking-wider">
                  Similar Collection
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#263238] font-heading mt-0.5">
                  You May Also Like
                </h2>
              </div>
              <Link
                to={`/products?category=${encodeURIComponent(product.category || '')}`}
                className="text-xs font-bold text-[#FF6B6B] hover:underline"
              >
                View all in {product.category} →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((relProd) => (
                <ProductCard key={relProd.id} product={relProd} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

