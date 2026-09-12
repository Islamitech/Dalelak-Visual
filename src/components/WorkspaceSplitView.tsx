import React, { useState, useEffect, useRef } from 'react';
import { 
  Palette, 
  Square, 
  FileText, 
  Flame, 
  Download, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Sparkles,
  CheckCircle,
  Share2,
  Eye
} from 'lucide-react';
import { 
  DalilakBusiness, 
  VectorLogoConfig, 
  SocialFrameConfig, 
  MenuCatalogConfig, 
  PromoBannerConfig 
} from '../types';
import { LogoStudioPanel } from './LogoStudioPanel';
import { SocialFramePanel } from './SocialFramePanel';
import { MenuCatalogPanel } from './MenuCatalogPanel';
import { PromoBannerPanel } from './PromoBannerPanel';
import { ExportAssetsModal } from './ExportAssetsModal';
import { 
  renderSocialFrameToCanvas, 
  renderMenuCatalogToCanvas, 
  exportCanvasAsPng 
} from '../utils/canvasRenderer';
import { generateVectorLogoSvg } from '../utils/vectorLogoPresets';

type StudioTab = 'logo' | 'frame' | 'menu' | 'promo';

interface WorkspaceSplitViewProps {
  business: DalilakBusiness | null;
  logoConfig: VectorLogoConfig;
  onChangeLogoConfig: (cfg: VectorLogoConfig) => void;
  frameConfig: SocialFrameConfig;
  onChangeFrameConfig: (cfg: SocialFrameConfig) => void;
  catalogConfig: MenuCatalogConfig;
  onChangeCatalogConfig: (cfg: MenuCatalogConfig) => void;
  promoConfig: PromoBannerConfig;
  onChangePromoConfig: (cfg: PromoBannerConfig) => void;
}

export const WorkspaceSplitView: React.FC<WorkspaceSplitViewProps> = ({
  business,
  logoConfig,
  onChangeLogoConfig,
  frameConfig,
  onChangeFrameConfig,
  catalogConfig,
  onChangeCatalogConfig,
  promoConfig,
  onChangePromoConfig
}) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('logo');
  const [showExportModal, setShowExportModal] = useState(false);
  const [logoBgPreview, setLogoBgPreview] = useState<'white' | 'dark' | 'card'>('white');
  const [previewScale, setPreviewScale] = useState(1);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Redraw canvas whenever relevant configurations change
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const bizName = business?.name_ar || 'نشاط دليلك';

    if (activeTab === 'frame') {
      renderSocialFrameToCanvas(canvas, frameConfig, logoConfig, bizName);
    } else if (activeTab === 'menu') {
      renderMenuCatalogToCanvas(canvas, catalogConfig, logoConfig, bizName);
    } else if (activeTab === 'promo') {
      // Use social frame engine with promo config parameters
      const promoAsFrame: SocialFrameConfig = {
        ...frameConfig,
        headline: promoConfig.headline,
        subheadline: `${promoConfig.discountValue} • ${promoConfig.subtext}`,
        badgeText: promoConfig.badge || 'عرض خاص',
        frameStyle: promoConfig.themeStyle === 'fire_sale' ? 'baladi_fresh' : 'luxury_gold'
      };
      renderSocialFrameToCanvas(canvas, promoAsFrame, logoConfig, bizName);
    }
  }, [activeTab, frameConfig, logoConfig, catalogConfig, promoConfig, business]);

  const handleApplyAiSignboardAnalysis = (result: any) => {
    if (result.suggestedMenuItems && result.suggestedMenuItems.length > 0) {
      onChangeCatalogConfig({
        ...catalogConfig,
        items: result.suggestedMenuItems
      });
    }
    if (result.suggestedOffers && result.suggestedOffers.length > 0) {
      const firstOffer = result.suggestedOffers[0];
      onChangePromoConfig({
        ...promoConfig,
        headline: firstOffer.headline,
        discountValue: firstOffer.discountValue,
        subtext: firstOffer.subtext,
        callToAction: firstOffer.callToAction
      });
    }
  };

  const handleQuickDownload = () => {
    if (activeTab === 'logo') {
      const svgStr = generateVectorLogoSvg(logoConfig, 1000);
      const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `شعار_${(business?.name_ar || 'دليلك').replace(/\s+/g, '_')}.svg`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (canvasRef.current) {
      exportCanvasAsPng(canvasRef.current, `تصميم_${(business?.name_ar || 'دليلك').replace(/\s+/g, '_')}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Tab Navigation */}
      <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-200 gap-2 flex-wrap">
        
        {/* Export All Trigger Button */}
        <button
          onClick={() => setShowExportModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 flex items-center gap-1.5 transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>تصدير حزمة الأصول كاملة (Export All)</span>
        </button>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
          {[
            { id: 'logo', label: '1. الشعار والهوية الفيكتور', icon: Palette },
            { id: 'frame', label: '2. براويز السوشيال ميديا', icon: Square },
            { id: 'menu', label: '3. قوائم الأسعار والمنيو', icon: FileText },
            { id: 'promo', label: '4. عروض وتخفيضات', icon: Flame }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as StudioTab)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Main Grid: Tools (Right in RTL) & Live Preview (Left in RTL) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Right Column: Studio Controls Panel (5 cols on lg) */}
        <div className="lg:col-span-6 xl:col-span-5 order-2 lg:order-1">
          {activeTab === 'logo' && (
            <LogoStudioPanel
              business={business}
              config={logoConfig}
              onChange={onChangeLogoConfig}
              onApplyAiAnalysis={handleApplyAiSignboardAnalysis}
            />
          )}

          {activeTab === 'frame' && (
            <SocialFramePanel
              business={business}
              config={frameConfig}
              onChange={onChangeFrameConfig}
            />
          )}

          {activeTab === 'menu' && (
            <MenuCatalogPanel
              business={business}
              config={catalogConfig}
              onChange={onChangeCatalogConfig}
            />
          )}

          {activeTab === 'promo' && (
            <PromoBannerPanel
              business={business}
              config={promoConfig}
              onChange={onChangePromoConfig}
            />
          )}
        </div>

        {/* Left Column: Live Interactive High-Resolution Canvas Preview (7 cols on lg) */}
        <div className="lg:col-span-6 xl:col-span-7 order-1 lg:order-2 sticky top-22">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg shadow-slate-100/60 overflow-hidden flex flex-col">
            
            {/* Canvas Toolbar */}
            <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between gap-3 text-right">
              
              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleQuickDownload}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                  title="تنزيل مباشر للتصميم المعروض"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">تحميل سريع</span>
                </button>

                {activeTab === 'logo' && (
                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                    <button
                      onClick={() => setLogoBgPreview('white')}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${logoBgPreview === 'white' ? 'bg-indigo-100 text-indigo-800' : 'text-slate-500'}`}
                    >
                      أبيض
                    </button>
                    <button
                      onClick={() => setLogoBgPreview('dark')}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${logoBgPreview === 'dark' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}
                    >
                      داكن
                    </button>
                    <button
                      onClick={() => setLogoBgPreview('card')}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${logoBgPreview === 'card' ? 'bg-amber-100 text-amber-800' : 'text-slate-500'}`}
                    >
                      كارت
                    </button>
                  </div>
                )}
              </div>

              {/* Title / Format Pill */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">
                  {activeTab === 'logo' && 'معاينة الشعار الفيكتور المباشر'}
                  {activeTab === 'frame' && `برواز ${frameConfig.format === 'square' ? 'مربع (1080x1080)' : frameConfig.format === 'story' ? 'ستوري (1080x1920)' : 'أفقي (1200x675)'}`}
                  {activeTab === 'menu' && 'قائمة الأسعار المعتمدة (A4 Print)'}
                  {activeTab === 'promo' && 'بوست العرض الترويجي'}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  معاينة حية
                </span>
              </div>

            </div>

            {/* Canvas Viewport */}
            <div className="p-4 sm:p-8 bg-slate-100/70 flex items-center justify-center min-h-[460px] overflow-auto">
              
              {/* TAB 1: SVG VECTOR LOGO PREVIEW */}
              {activeTab === 'logo' ? (
                <div
                  className={`w-full max-w-[420px] aspect-square rounded-2xl p-6 flex flex-col items-center justify-center shadow-md transition-all duration-200 border ${
                    logoBgPreview === 'white'
                      ? 'bg-white border-slate-200'
                      : logoBgPreview === 'dark'
                      ? 'bg-slate-900 border-slate-800'
                      : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
                  }`}
                >
                  <div
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{
                      __html: generateVectorLogoSvg(logoConfig, 380)
                    }}
                  />
                </div>
              ) : (
                /* TAB 2, 3, 4: HTML5 CANVAS PREVIEW */
                <div className="relative max-w-full flex items-center justify-center shadow-xl rounded-2xl overflow-hidden border border-slate-200 bg-white">
                  <canvas
                    ref={canvasRef}
                    className="max-h-[620px] w-auto object-contain block"
                  />
                </div>
              )}

            </div>

            {/* Bottom Info Bar */}
            <div className="px-4 py-2.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono text-[11px]">300 DPI High-Resolution Ready</span>
              <span>دقة طباعية ورقمية معتمدة لمنظومة دليلك</span>
            </div>

          </div>
        </div>

      </div>

      {/* Export All Assets Modal */}
      <ExportAssetsModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        business={business}
        logoConfig={logoConfig}
        frameConfig={frameConfig}
        catalogConfig={catalogConfig}
        promoConfig={promoConfig}
        activeCanvas={canvasRef.current}
      />

    </div>
  );
};
