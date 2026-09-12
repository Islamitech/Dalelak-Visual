import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  Image as ImageIcon, 
  CheckCircle2, 
  X, 
  Sparkles, 
  Layers,
  Code,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  VectorLogoConfig, 
  SocialFrameConfig, 
  MenuCatalogConfig, 
  PromoBannerConfig,
  DalilakBusiness 
} from '../types';
import { generateVectorLogoSvg } from '../utils/vectorLogoPresets';
import { 
  exportCanvasAsPng, 
  exportCanvasAsPdf, 
  renderMenuCatalogToCanvas,
  renderSocialFrameToCanvas 
} from '../utils/canvasRenderer';

interface ExportAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: DalilakBusiness | null;
  logoConfig: VectorLogoConfig;
  frameConfig: SocialFrameConfig;
  catalogConfig: MenuCatalogConfig;
  promoConfig: PromoBannerConfig;
  activeCanvas: HTMLCanvasElement | null;
}

export const ExportAssetsModal: React.FC<ExportAssetsModalProps> = ({
  isOpen,
  onClose,
  business,
  logoConfig,
  frameConfig,
  catalogConfig,
  promoConfig,
  activeCanvas
}) => {
  const [downloading, setDownloading] = useState<string | null>(null);

  if (!isOpen) return null;

  const businessName = business?.name_ar || 'نشاط دليلك';
  const cleanFilename = (businessName).replace(/\s+/g, '_');

  // 1. Download SVG Logo
  const handleDownloadSvgLogo = () => {
    const svgStr = generateVectorLogoSvg(logoConfig, 800);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `شعار_فيكتور_${cleanFilename}.svg`;
    link.click();
    URL.revokeObjectURL(url);
    triggerCelebration();
  };

  // 2. Download Transparent PNG Logo
  const handleDownloadPngLogo = async () => {
    setDownloading('logo_png');
    const svgStr = generateVectorLogoSvg(logoConfig, 1000);
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = 1000;
      c.height = 1000;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        exportCanvasAsPng(c, `شعار_شفاف_${cleanFilename}`);
        triggerCelebration();
      }
      URL.revokeObjectURL(url);
      setDownloading(null);
    };
    img.src = url;
  };

  // 3. Download Current Active Canvas
  const handleDownloadCurrentView = () => {
    if (!activeCanvas) return;
    exportCanvasAsPng(activeCanvas, `تصميم_${cleanFilename}`);
    triggerCelebration();
  };

  // 4. Download Menu Catalog PDF
  const handleDownloadMenuPdf = async () => {
    setDownloading('menu_pdf');
    const c = document.createElement('canvas');
    await renderMenuCatalogToCanvas(c, catalogConfig, logoConfig, businessName);
    exportCanvasAsPdf(c, `قائمة_أسعار_${cleanFilename}`);
    triggerCelebration();
    setDownloading(null);
  };

  // 5. Download Menu Catalog PNG
  const handleDownloadMenuPng = async () => {
    setDownloading('menu_png');
    const c = document.createElement('canvas');
    await renderMenuCatalogToCanvas(c, catalogConfig, logoConfig, businessName);
    exportCanvasAsPng(c, `منيو_كتالوج_${cleanFilename}`);
    triggerCelebration();
    setDownloading(null);
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 text-right animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-slate-900 font-['Cairo']">
              مركز تصدير وتنزيل الأصول الرقمية
            </h3>
            <Download className="w-5 h-5 text-indigo-600" />
          </div>
        </div>

        {/* Business Badge */}
        <div className="my-4 p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center justify-between">
          <span className="text-xs font-bold text-indigo-700 font-mono">
            {business?.phone || ''}
          </span>
          <span className="text-xs font-bold text-slate-800">
            أصول النشاط: <strong className="text-indigo-900">{businessName}</strong>
          </span>
        </div>

        {/* Export Cards */}
        <div className="space-y-3">
          
          {/* Logo Section */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadSvgLogo}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-2xs transition flex items-center gap-1 cursor-pointer"
              >
                <Code className="w-3.5 h-3.5" />
                <span>SVG فيكتور نقي</span>
              </button>
              <button
                onClick={handleDownloadPngLogo}
                disabled={downloading === 'logo_png'}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold rounded-lg shadow-2xs transition flex items-center gap-1 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>PNG شفاف 300DPI</span>
              </button>
            </div>

            <div className="text-right">
              <h4 className="font-bold text-xs text-slate-900 font-['Cairo']">الشعار الرقمي (Vector Logo)</h4>
              <p className="text-[11px] text-slate-500">للطباعة على اللافتات والأكياس والكروت والأختام بدقة لا نهائية</p>
            </div>
          </div>

          {/* Social Frame Section */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3">
            <button
              onClick={handleDownloadCurrentView}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تنزيل البوست الحالي (PNG HD)</span>
            </button>

            <div className="text-right">
              <h4 className="font-bold text-xs text-slate-900 font-['Cairo']">بوست البرواز والسوشيال ميديا</h4>
              <p className="text-[11px] text-slate-500">جاهز للنشر الفوري على انستجرام وفيسبوك وواتساب</p>
            </div>
          </div>

          {/* Menu / Catalog Section */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadMenuPdf}
                disabled={downloading === 'menu_pdf'}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-2xs transition flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF طباعة A4</span>
              </button>
              <button
                onClick={handleDownloadMenuPng}
                disabled={downloading === 'menu_png'}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold rounded-lg shadow-2xs transition flex items-center gap-1 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>صورة كتالوج PNG</span>
              </button>
            </div>

            <div className="text-right">
              <h4 className="font-bold text-xs text-slate-900 font-['Cairo']">قائمة الأسعار والمنيو المعتمد</h4>
              <p className="text-[11px] text-slate-500">كتالوج أنيق ومنسق جاهز للطباعة الورقية أو الإرسال الرقمي</p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            منظومة تطبيقات دليلك المستقلة
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
};
