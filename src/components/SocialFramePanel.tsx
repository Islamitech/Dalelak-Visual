import React, { useRef } from 'react';
import { 
  Square, 
  Smartphone, 
  Monitor, 
  Upload, 
  Image as ImageIcon, 
  Tag, 
  Phone, 
  ShieldCheck, 
  Sparkles,
  Layers,
  ZoomIn
} from 'lucide-react';
import { SocialFrameConfig, FrameFormat, FrameStyle, DalilakBusiness } from '../types';

interface SocialFramePanelProps {
  config: SocialFrameConfig;
  onChange: (newConfig: SocialFrameConfig) => void;
  business: DalilakBusiness | null;
}

const FRAME_PRESETS: { id: FrameStyle; name: string; desc: string; borderSample: string }[] = [
  { id: 'luxury_gold', name: 'الذهبي الملكي', desc: 'إطار ذهبي فاخر مع زخارف زوايا كلاسيكية', borderSample: 'border-amber-500 bg-amber-50/50' },
  { id: 'baladi_fresh', name: 'البلدي الأصيل', desc: 'إطار ناري أحمر وأصفر للمطاعم والمشويات', borderSample: 'border-red-600 bg-red-50/50' },
  { id: 'vibrant_neon', name: 'النيون المتوهج', desc: 'أزرق كهربائي ساطع وإضاءة عصرية', borderSample: 'border-sky-500 bg-sky-50/50' },
  { id: 'clean_minimal', name: 'المينيمال الأبيض', desc: 'إطار ناصع البياض أنيق للمنتجات الفاخرة', borderSample: 'border-slate-300 bg-white' },
  { id: 'corporate_blue', name: 'الأزرق المؤسسي', desc: 'طابع رسمي للشركات والمراكز الطبية', borderSample: 'border-indigo-600 bg-indigo-50/50' },
  { id: 'street_food', name: 'عربات وأكل الشارع', desc: 'حيوي ومرح للوجبات السريعة والسناكس', borderSample: 'border-orange-500 bg-orange-50/50' }
];

const BADGE_PRESETS = [
  'عرض خاص ومميز',
  'خصم 20% لفترة محدودة',
  'طازة يومياً بالسمن البلدي',
  'الأكثر طلباً هذا الأسبوع',
  'توصيل سريع حتى باب البيت',
  'أصلي 100% معتمد'
];

export const SocialFramePanel: React.FC<SocialFramePanelProps> = ({
  config,
  onChange,
  business
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onChange({
        ...config,
        productImage: reader.result as string,
        productImageZoom: 1,
        productImageOffset: { x: 0, y: 0 }
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSelectBusinessPhoto = (photoUrl: string) => {
    onChange({
      ...config,
      productImage: photoUrl,
      productImageZoom: 1,
      productImageOffset: { x: 0, y: 0 }
    });
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Format & Dimensions Selector */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <h4 className="font-bold text-xs text-slate-700">مقاس وحجم المنشور (Aspect Ratio)</h4>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'square', label: 'مربع بوست (1:1)', sub: 'انستجرام وفيسبوك', icon: Square },
            { id: 'story', label: 'ستوري وريلز (9:16)', sub: 'تيك توك وواتساب', icon: Smartphone },
            { id: 'landscape', label: 'أفقي بانر (16:9)', sub: 'فيسبوك وتويتر', icon: Monitor }
          ].map((fmt) => {
            const Icon = fmt.icon;
            const isSelected = config.format === fmt.id;
            return (
              <button
                key={fmt.id}
                type="button"
                onClick={() => onChange({ ...config, format: fmt.id as FrameFormat })}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/90 text-indigo-900 ring-2 ring-indigo-200 font-bold'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="text-xs">{fmt.label}</span>
                <span className="text-[10px] text-slate-400">{fmt.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Frame Style Presets */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-[11px] text-slate-400">8 قوالب حصرية</span>
          <h4 className="font-bold text-xs text-slate-700">نمط وشكل البرواز (Frame Template)</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {FRAME_PRESETS.map((frame) => {
            const isSelected = config.frameStyle === frame.id;
            return (
              <button
                key={frame.id}
                type="button"
                onClick={() => onChange({ ...config, frameStyle: frame.id })}
                className={`p-3 rounded-xl border text-right transition cursor-pointer flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-500'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                }`}
              >
                <div className={`w-6 h-6 rounded-md border-2 shrink-0 ${frame.borderSample}`} />
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-xs text-slate-800">{frame.name}</h5>
                  <p className="text-[10px] text-slate-500 truncate">{frame.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Image Dropzone & Zoom */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <ImageIcon className="w-4 h-4 text-indigo-600" />
          <h4 className="font-bold text-xs text-slate-700">صورة المنتج أو المحل (Product Photo)</h4>
        </div>

        {/* Upload Button & Preview */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-3 px-4 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50/40 hover:bg-indigo-50/80 text-indigo-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>رفع صورة من جهازك (موبايل / كمبيوتر)</span>
          </button>
        </div>

        {/* Use Business Photos if available */}
        {business?.photos && business.photos.length > 0 && (
          <div className="space-y-1.5 pt-2">
            <span className="text-[11px] text-slate-500 block">أو اختر من صور النشاط المسجلة:</span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {business.photos.map((p, idx) => {
                const src = typeof p === 'string' ? p : (p as any).url;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectBusinessPhoto(src)}
                    className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 hover:border-indigo-500 shrink-0 transition"
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Zoom Slider if photo present */}
        {config.productImage && (
          <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-indigo-600">
              {Math.round((config.productImageZoom || 1) * 100)}%
            </span>
            <input
              type="range"
              min="0.8"
              max="2.2"
              step="0.05"
              value={config.productImageZoom || 1}
              onChange={(e) => onChange({ ...config, productImageZoom: parseFloat(e.target.value) })}
              className="flex-1 accent-indigo-600 cursor-pointer"
            />
            <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
              <ZoomIn className="w-3.5 h-3.5" />
              <span>تكبير وتوسيط:</span>
            </div>
          </div>
        )}
      </div>

      {/* Badges & Headlines */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <Tag className="w-4 h-4 text-indigo-600" />
          <h4 className="font-bold text-xs text-slate-700">شارة العرض والنصوص الترويجية</h4>
        </div>

        {/* Badge Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            نص الشارة اللافتة (Promo Badge)
          </label>
          <input
            type="text"
            value={config.badgeText}
            onChange={(e) => onChange({ ...config, badgeText: e.target.value })}
            placeholder="عرض خاص ومميز"
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden font-bold"
          />

          <div className="flex flex-wrap gap-1.5 mt-2">
            {BADGE_PRESETS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => onChange({ ...config, badgeText: b })}
                className="text-[11px] px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Headline & Subheadline */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              العنوان الرئيسي للبوست
            </label>
            <input
              type="text"
              value={config.headline}
              onChange={(e) => onChange({ ...config, headline: e.target.value })}
              placeholder="مثال: أحلى طشة ملوخية وكباب بلدي"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              العنوان الفرعي أو التوضيحي
            </label>
            <input
              type="text"
              value={config.subheadline}
              onChange={(e) => onChange({ ...config, subheadline: e.target.value })}
              placeholder="مشوي على الفحم بالسمنة الفلاحي"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Contact Bar & Dalilak Verified Badge */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <Phone className="w-4 h-4 text-indigo-600" />
          <h4 className="font-bold text-xs text-slate-700">شريط التواصل وتوثيق دليلك</h4>
        </div>

        <div className="space-y-2.5">
          <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={config.showContactBar}
              onChange={(e) => onChange({ ...config, showContactBar: e.target.checked })}
              className="rounded text-indigo-600"
            />
            <span className="text-xs font-bold text-slate-700">إظهار شريط أرقام التواصل في الأسفل</span>
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={config.showDalilakVerifiedBadge}
              onChange={(e) => onChange({ ...config, showDalilakVerifiedBadge: e.target.checked })}
              className="rounded text-indigo-600"
            />
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-700">تضمين ختم (دليلك • نشاط موثق)</span>
            </div>
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={config.showLogo}
              onChange={(e) => onChange({ ...config, showLogo: e.target.checked })}
              className="rounded text-indigo-600"
            />
            <span className="text-xs font-bold text-slate-700">تضمين الشعار واسم النشاط أعلى البوست</span>
          </label>

          {config.showContactBar && (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">رقم الواتساب</label>
                <input
                  type="text"
                  value={config.whatsappNumber}
                  onChange={(e) => onChange({ ...config, whatsappNumber: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono text-left"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">رقم الهاتف الأرضي/المحمول</label>
                <input
                  type="text"
                  value={config.phoneNumber}
                  onChange={(e) => onChange({ ...config, phoneNumber: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono text-left"
                  dir="ltr"
                />
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
