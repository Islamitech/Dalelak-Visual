import React, { useState } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  Type, 
  Shapes, 
  Palette, 
  Sliders, 
  Image as ImageIcon,
  Check,
  ChevronDown
} from 'lucide-react';
import { 
  VectorLogoConfig, 
  LogoShapeContainer, 
  LogoLayout, 
  LogoFontFamily, 
  DalilakBusiness 
} from '../types';
import { 
  VECTOR_ICONS, 
  LOGO_COLOR_PALETTES, 
  generateVectorLogoSvg 
} from '../utils/vectorLogoPresets';
import { analyzeSignboardWithGemini } from '../services/visualAiService';

interface LogoStudioPanelProps {
  business: DalilakBusiness | null;
  config: VectorLogoConfig;
  onChange: (newConfig: VectorLogoConfig) => void;
  onApplyAiAnalysis?: (analysis: any) => void;
}

export const LogoStudioPanel: React.FC<LogoStudioPanelProps> = ({
  business,
  config,
  onChange,
  onApplyAiAnalysis
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const businessPhotos = Array.isArray(business?.photos) ? business.photos : [];
  const currentPhoto = businessPhotos.length > 0 ? businessPhotos[activePhotoIdx] : null;

  const handleRunAiAnalysis = async () => {
    if (!currentPhoto && !business?.name_ar) return;
    setAnalyzing(true);
    try {
      const photoSrc = typeof currentPhoto === 'string' ? currentPhoto : (currentPhoto as any)?.url || '';
      const result = await analyzeSignboardWithGemini(photoSrc, {
        name_ar: business?.name_ar,
        category: business?.category
      });

      // Update logo config
      onChange({
        ...config,
        businessName: result.businessNameAr || config.businessName,
        englishName: result.businessNameEn || config.englishName,
        slogan: result.slogan || config.slogan,
        primaryColor: result.primaryColor || config.primaryColor,
        secondaryColor: result.secondaryColor || config.secondaryColor,
        accentColor: result.accentColor || config.accentColor,
        iconName: result.recommendedIcon || config.iconName,
        shapeContainer: result.recommendedShape || config.shapeContainer,
        layout: result.recommendedLayout || config.layout,
        fontFamily: result.recommendedFont || config.fontFamily
      });

      if (onApplyAiAnalysis) {
        onApplyAiAnalysis(result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Signboard Photo & AI Extraction Header */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
            تحليل الرؤية الحاسوبية (Signboard AI)
          </span>
          <h3 className="font-bold text-sm text-slate-800 font-['Cairo']">
            لافتة المحل أو الواجهة الميدانية
          </h3>
        </div>

        {currentPhoto ? (
          <div className="space-y-2">
            <div className="h-44 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative group">
              <img
                src={typeof currentPhoto === 'string' ? currentPhoto : (currentPhoto as any).url}
                alt="لافتة النشاط"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-2 right-3 text-white text-xs font-bold">
                {business?.name_ar} • {business?.city || 'المقر الميداني'}
              </div>
            </div>

            {/* If multiple photos, thumb switcher */}
            {businessPhotos.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {businessPhotos.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                      activePhotoIdx === idx ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={typeof p === 'string' ? p : (p as any).url}
                      alt={`صورة ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-32 rounded-xl bg-slate-50 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 p-4">
            <ImageIcon className="w-8 h-8 mb-1 text-slate-300" />
            <p className="text-xs font-bold text-slate-600">لم يتم إرفاق صور لافتات مسجلة لهذا النشاط</p>
            <p className="text-[11px] text-slate-400 mt-0.5">يمكنك استخدام محرك الذكاء الاصطناعي لتوليد الشعار استناداً لاسم وتصنيف النشاط</p>
          </div>
        )}

        {/* AI Action Button */}
        <button
          onClick={handleRunAiAnalysis}
          disabled={analyzing}
          className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-100 transition cursor-pointer"
        >
          {analyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>جاري تحليل خطوط وألوان اللافتة وتوليد الشعار...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>تحليل اليافطة وتوليد الشعار الفيكتور بالذكاء الاصطناعي</span>
            </>
          )}
        </button>
      </div>

      {/* Typography & Identity Inputs */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <Type className="w-4 h-4 text-indigo-600" />
          <h4 className="font-bold text-xs text-slate-700">النصوص والتايبوجرافي العربي</h4>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              اسم النشاط التجاري (بالعربي)
            </label>
            <input
              type="text"
              value={config.businessName}
              onChange={(e) => onChange({ ...config, businessName: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden font-bold"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showEnglishName}
                  onChange={(e) => onChange({ ...config, showEnglishName: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <span>تضمين في الشعار</span>
              </label>
              <label className="text-xs font-bold text-slate-700">
                الاسم الإنجليزي (Subtitle)
              </label>
            </div>
            <input
              type="text"
              value={config.englishName}
              onChange={(e) => onChange({ ...config, englishName: e.target.value })}
              dir="ltr"
              placeholder="BUSINESS NAME"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden font-medium"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showSlogan}
                  onChange={(e) => onChange({ ...config, showSlogan: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <span>تضمين الشعار</span>
              </label>
              <label className="text-xs font-bold text-slate-700">
                الشعار اللفظي (Slogan)
              </label>
            </div>
            <input
              type="text"
              value={config.slogan}
              onChange={(e) => onChange({ ...config, slogan: e.target.value })}
              placeholder="طعم زمان وسر الصنعة"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              نوع الخط العربي (Arabic Calligraphy Font)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Cairo', 'Tajawal', 'Aref Ruqaa', 'Amiri'] as LogoFontFamily[]).map((font) => (
                <button
                  key={font}
                  type="button"
                  onClick={() => onChange({ ...config, fontFamily: font })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    config.fontFamily === font
                      ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-700'
                  }`}
                  style={{ fontFamily: font }}
                >
                  {config.fontFamily === font && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  <span>{font}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Vector Icon Picker */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-[11px] text-slate-400 font-mono">14+ فيكتور</span>
          <h4 className="font-bold text-xs text-slate-700">الرمز الدلالي للشعار (Vector Icon)</h4>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {VECTOR_ICONS.map((icon) => {
            const isSelected = config.iconName === icon.id;
            return (
              <button
                key={icon.id}
                type="button"
                onClick={() => onChange({ ...config, iconName: icon.id })}
                className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 border transition cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
                title={icon.name}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={icon.svgPath} />
                </svg>
                <span className="text-[10px] font-bold truncate max-w-full">{icon.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Shape Container & Layout */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <Shapes className="w-4 h-4 text-indigo-600" />
          <h4 className="font-bold text-xs text-slate-700">إطار وهيكل الشعار (Emblem Container)</h4>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {[
            { id: 'circle', label: 'دائري كلاسيك' },
            { id: 'shield', label: 'درع ملكي' },
            { id: 'hexagon', label: 'سداسي هندسي' },
            { id: 'luxury_crest', label: 'تاج وغصن زيتون' },
            { id: 'modern_badge', label: 'شارة عصرية' },
            { id: 'minimal_ring', label: 'حلقة بسيطة' },
            { id: 'none', label: 'بدون إطار' }
          ].map((shape) => (
            <button
              key={shape.id}
              type="button"
              onClick={() => onChange({ ...config, shapeContainer: shape.id as LogoShapeContainer })}
              className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition text-center cursor-pointer ${
                config.shapeContainer === shape.id
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-500'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
            >
              {shape.label}
            </button>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            توزيع وتخطيط العناصر (Layout)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'vertical', label: 'رأسي متوازن' },
              { id: 'horizontal', label: 'أفقي ممتد' },
              { id: 'icon_center', label: 'رمز عملاق' }
            ].map((lay) => (
              <button
                key={lay.id}
                type="button"
                onClick={() => onChange({ ...config, layout: lay.id as LogoLayout })}
                className={`py-1.5 px-2 rounded-xl border text-xs font-medium transition text-center cursor-pointer ${
                  config.layout === lay.id
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
              >
                {lay.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Colors & Palette Presets */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <Palette className="w-4 h-4 text-indigo-600" />
          <h4 className="font-bold text-xs text-slate-700">لوحات الألوان والهوية (Brand Colors)</h4>
        </div>

        {/* Preset Palettes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {LOGO_COLOR_PALETTES.map((pal) => (
            <button
              key={pal.id}
              type="button"
              onClick={() => onChange({
                ...config,
                primaryColor: pal.primary,
                secondaryColor: pal.secondary,
                accentColor: pal.accent,
                textColor: pal.text
              })}
              className="p-2 rounded-xl border border-slate-200 hover:border-indigo-300 bg-slate-50/60 hover:bg-white flex items-center justify-between gap-2 transition cursor-pointer text-right"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: pal.primary }} />
                <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: pal.secondary }} />
                <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: pal.accent }} />
              </div>
              <span className="text-[11px] font-bold text-slate-700 truncate">{pal.name}</span>
            </button>
          ))}
        </div>

        {/* Custom Color Pickers */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">الرئيسي</label>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1">
              <input
                type="color"
                value={config.primaryColor}
                onChange={(e) => onChange({ ...config, primaryColor: e.target.value })}
                className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
              />
              <span className="text-[10px] font-mono text-slate-500 uppercase">{config.primaryColor}</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">الثانوي</label>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1">
              <input
                type="color"
                value={config.secondaryColor}
                onChange={(e) => onChange({ ...config, secondaryColor: e.target.value })}
                className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
              />
              <span className="text-[10px] font-mono text-slate-500 uppercase">{config.secondaryColor}</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">التباين / التمييز</label>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1">
              <input
                type="color"
                value={config.accentColor}
                onChange={(e) => onChange({ ...config, accentColor: e.target.value })}
                className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
              />
              <span className="text-[10px] font-mono text-slate-500 uppercase">{config.accentColor}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
