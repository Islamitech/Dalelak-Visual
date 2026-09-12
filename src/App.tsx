import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  DalilakBusiness, 
  VectorLogoConfig, 
  SocialFrameConfig, 
  MenuCatalogConfig, 
  PromoBannerConfig,
  VisualEcosystemProgress 
} from './types';
import { Header } from './components/Header';
import { WorkspaceSplitView } from './components/WorkspaceSplitView';
import { DalilakActivitiesModal } from './components/DalilakActivitiesModal';
import { 
  getFallbackBusinesses, 
  saveVisualProgress, 
  loadVisualProgress, 
  promoteToCoreProduction 
} from './services/dalilakService';
import { getContextualFallbackAnalysis } from './services/visualAiService';

export function App() {
  const [currentBusiness, setCurrentBusiness] = useState<DalilakBusiness | null>(null);
  const [isActivitiesModalOpen, setIsActivitiesModalOpen] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);
  const [isPromoted, setIsPromoted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Studio Configurations
  const [logoConfig, setLogoConfig] = useState<VectorLogoConfig>({
    businessName: 'مشويات الحاتي الأصيل',
    englishName: 'EL HATY BBQ & RESTAURANT',
    slogan: 'طعم زمان وسر الصنعة على أصوله',
    iconCategory: 'مطاعم',
    iconName: 'Flame',
    shapeContainer: 'shield',
    primaryColor: '#881337',
    secondaryColor: '#e11d48',
    accentColor: '#f59e0b',
    textColor: '#881337',
    fontFamily: 'Cairo',
    layout: 'vertical',
    showEnglishName: true,
    showSlogan: true,
    showEstablishedYear: true,
    establishedYear: '1995'
  });

  const [frameConfig, setFrameConfig] = useState<SocialFrameConfig>({
    format: 'square',
    frameStyle: 'baladi_fresh',
    productImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
    productImageZoom: 1,
    productImageOffset: { x: 0, y: 0 },
    badgeText: 'عرض خاص ومميز',
    badgeType: 'offer',
    showContactBar: true,
    phoneNumber: '01012345678',
    whatsappNumber: '01012345678',
    showDalilakVerifiedBadge: true,
    showLogo: true,
    logoPlacement: 'top_right',
    headline: 'أقوى وجبة مشويات على الفحم',
    subheadline: 'لحوم بلدي طازجة 100% مع الطحينة والسلطات',
    primaryColor: '#881337',
    accentColor: '#f59e0b'
  });

  const [catalogConfig, setCatalogConfig] = useState<MenuCatalogConfig>({
    title: 'قائمة أسعار المشويات المعتمدة',
    subtitle: 'أسعار عام 2026 • شاملة الضريبة والخدمة',
    categories: ['المشويات', 'طواجن فرن', 'وجبات سريعة'],
    items: [
      { id: '1', category: 'المشويات', name: 'كيلو كباب وكفتة مشكل بلدي', description: 'مشوي على الفحم مع طحينة وسلطات وعيش طازة', price: 540, unit: 'كجم', badge: 'الأكثر طلباً' },
      { id: '2', category: 'المشويات', name: 'نصف فرخة مشوية على الفحم', description: 'بتتبيلة الحاتي الخاصة مع أرز بسمتي فاخر', price: 160, unit: 'وجبة', badge: 'توفير' },
      { id: '3', category: 'طواجن فرن', name: 'طاجن عكاوي بالبصل القاورما', description: 'في الفرن الفخار مع الصوص المكرمل', price: 280, unit: 'طاجن', badge: 'مميز' },
      { id: '4', category: 'وجبات سريعة', name: 'حواوشي بلدي مخصوص بالسمنة', description: 'لحم مفروم بلدي متبل مع جبنة موزاريلا اختيارية', price: 75, unit: 'رغيف', badge: 'شعبية' }
    ],
    layout: 'two_column',
    themeStyle: 'warm_restaurant',
    currency: 'ج.م',
    footerNote: 'الأسعار شاملة ومحدثة وفق معايير الجودة • منصة دليلك المعتمدة',
    showPrices: true,
    primaryColor: '#881337',
    accentColor: '#f59e0b'
  });

  const [promoConfig, setPromoConfig] = useState<PromoBannerConfig>({
    headline: '🔥 قنبلة مشويات الويك إند من الحاتي!',
    discountValue: '20% خصم',
    subtext: 'على جميع صواني التوفير العائلية طوال الجمعة والسبت',
    badge: 'عرض حصري',
    validUntil: 'حتى نهاية الشهر',
    terms: 'ساري في جميع الفروع والتوصيل',
    callToAction: 'اطلب على واتساب والتوصيل مجاناً: 01012345678',
    themeStyle: 'fire_sale',
    format: 'square',
    primaryColor: '#881337',
    accentColor: '#f59e0b',
    showQrBadge: true
  });

  // Initial business load
  useEffect(() => {
    const fallbacks = getFallbackBusinesses();
    if (fallbacks.length > 0) {
      applyBusinessToStudio(fallbacks[0]);
    }
  }, []);

  const applyBusinessToStudio = (biz: DalilakBusiness) => {
    setCurrentBusiness(biz);

    // Check if there is saved progress
    const saved = loadVisualProgress(biz.id);
    if (saved) {
      setLogoConfig(saved.logoConfig);
      setFrameConfig(saved.frameConfig);
      setCatalogConfig(saved.catalogConfig);
      setPromoConfig(saved.promoConfig);
      setIsPromoted(saved.isPromotedToCore || false);
      showToast(`تم استرجاع مسودات وتصاميم النشاط السابقة بنجاح`);
      return;
    }

    // Otherwise, generate contextual identity based on business name & category
    const analysis = getContextualFallbackAnalysis(biz.name_ar, biz.category || 'عام');
    
    const photo = (biz.photos && biz.photos.length > 0)
      ? (typeof biz.photos[0] === 'string' ? biz.photos[0] : (biz.photos[0] as any).url)
      : null;

    setLogoConfig({
      businessName: biz.name_ar,
      englishName: biz.name_en || analysis.businessNameEn,
      slogan: analysis.slogan,
      iconCategory: biz.category || 'عام',
      iconName: analysis.recommendedIcon,
      shapeContainer: analysis.recommendedShape,
      primaryColor: analysis.primaryColor,
      secondaryColor: analysis.secondaryColor,
      accentColor: analysis.accentColor,
      textColor: analysis.primaryColor,
      fontFamily: analysis.recommendedFont,
      layout: analysis.recommendedLayout,
      showEnglishName: Boolean(biz.name_en),
      showSlogan: true,
      showEstablishedYear: true,
      establishedYear: '2020'
    });

    setFrameConfig({
      format: 'square',
      frameStyle: biz.category?.includes('مطاعم') ? 'baladi_fresh' : 'luxury_gold',
      productImage: photo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
      productImageZoom: 1,
      productImageOffset: { x: 0, y: 0 },
      badgeText: 'عرض خاص ومميز',
      badgeType: 'offer',
      showContactBar: true,
      phoneNumber: biz.phone || '',
      whatsappNumber: biz.phone || '',
      showDalilakVerifiedBadge: true,
      showLogo: true,
      logoPlacement: 'top_right',
      headline: `أهلاً بكم في ${biz.name_ar}`,
      subheadline: analysis.slogan,
      primaryColor: analysis.primaryColor,
      accentColor: analysis.accentColor
    });

    setCatalogConfig({
      title: `قائمة خدمات وأسعار ${biz.name_ar}`,
      subtitle: `معتمدة وموثقة • منصة دليلك 2026`,
      categories: ['الأساسية', 'خدمات مميزة'],
      items: analysis.suggestedMenuItems,
      layout: 'two_column',
      themeStyle: 'warm_restaurant',
      currency: 'ج.م',
      footerNote: 'الأسعار شاملة ومحدثة وفق معايير الجودة • منصة دليلك المعتمدة',
      showPrices: true,
      primaryColor: analysis.primaryColor,
      accentColor: analysis.accentColor
    });

    if (analysis.suggestedOffers && analysis.suggestedOffers.length > 0) {
      const off = analysis.suggestedOffers[0];
      setPromoConfig({
        headline: off.headline,
        discountValue: off.discountValue,
        subtext: off.subtext,
        badge: 'عرض خاص',
        validUntil: 'لفترة محدودة',
        terms: 'ساري حتى نفاذ الكمية',
        callToAction: `${off.callToAction}: ${biz.phone || ''}`,
        themeStyle: 'fire_sale',
        format: 'square',
        primaryColor: analysis.primaryColor,
        accentColor: analysis.accentColor,
        showQrBadge: true
      });
    }

    setIsPromoted(false);
    showToast(`تم استيراد النشاط: ${biz.name_ar}`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePromoteToCore = async () => {
    if (!currentBusiness) return;
    setIsPromoting(true);

    const progress: VisualEcosystemProgress = {
      businessId: currentBusiness.id,
      businessName: currentBusiness.name_ar,
      lastUpdated: new Date().toISOString(),
      logoConfig,
      frameConfig,
      catalogConfig,
      promoConfig,
      isPromotedToCore: true
    };

    const res = await promoteToCoreProduction(currentBusiness, progress);
    setIsPromoting(false);
    setIsPromoted(true);
    showToast(res.message);

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  // Auto-save progress
  useEffect(() => {
    if (!currentBusiness) return;
    const progress: VisualEcosystemProgress = {
      businessId: currentBusiness.id,
      businessName: currentBusiness.name_ar,
      lastUpdated: new Date().toISOString(),
      logoConfig,
      frameConfig,
      catalogConfig,
      promoConfig,
      isPromotedToCore: isPromoted
    };
    saveVisualProgress(progress);
  }, [logoConfig, frameConfig, catalogConfig, promoConfig, isPromoted, currentBusiness]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Main Header */}
      <Header
        currentBusiness={currentBusiness}
        onOpenActivitiesModal={() => setIsActivitiesModalOpen(true)}
        onPromoteToCore={handlePromoteToCore}
        isPromoting={isPromoting}
        isPromoted={isPromoted}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        <WorkspaceSplitView
          business={currentBusiness}
          logoConfig={logoConfig}
          onChangeLogoConfig={setLogoConfig}
          frameConfig={frameConfig}
          onChangeFrameConfig={setFrameConfig}
          catalogConfig={catalogConfig}
          onChangeCatalogConfig={setCatalogConfig}
          promoConfig={promoConfig}
          onChangePromoConfig={setPromoConfig}
        />
      </main>

      {/* Activities Selection Modal */}
      <DalilakActivitiesModal
        isOpen={isActivitiesModalOpen}
        onClose={() => setIsActivitiesModalOpen(false)}
        onSelectBusiness={applyBusinessToStudio}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">دليلك • منظومة التطبيقات المستقلة</span>
          <span>(المرحلة 2: ستوديو الهوية البصرية)</span>
        </div>
        <div className="text-slate-400">
          مستودع: <code className="font-mono text-[11px] text-indigo-600">Islamitech/Dalelak-Visual</code> • Light Mode Only
        </div>
      </footer>

    </div>
  );
}
