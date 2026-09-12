import React, { useState } from 'react';
import { 
  Flame, 
  Percent, 
  Calendar, 
  Send, 
  Sparkles, 
  Layers, 
  Tag, 
  Clock,
  RefreshCw 
} from 'lucide-react';
import { PromoBannerConfig, DalilakBusiness } from '../types';
import { generateAiPromoOffersWithGemini } from '../services/visualAiService';

interface PromoBannerPanelProps {
  config: PromoBannerConfig;
  onChange: (newConfig: PromoBannerConfig) => void;
  business: DalilakBusiness | null;
}

const EGYPTIAN_OFFER_PRESETS = [
  {
    title: 'قنبلة مشويات الويك إند',
    discount: 'خصم 20%',
    subtext: 'على جميع الوجبات والصواني العائلية طوال الجمعة والسبت',
    cta: 'اطلب الآن عبر واتساب'
  },
  {
    title: 'عرض ما يتعوضش.. اشتري 1 وخد 1 هدية',
    discount: '1 + 1 مجاناً',
    subtext: 'ساري طوال الأسبوع في جميع الفروع حتى نفاذ الكمية',
    cta: 'شرفنا بزيارتك اليوم'
  },
  {
    title: 'تخفيضات العيد والمناسبات الكبرى',
    discount: 'وفر حتى 30%',
    subtext: 'أقوى تشكيلة بأفضل الأسعار مع ضمان الجودة',
    cta: 'احجز طلبك الآن'
  },
  {
    title: 'عرض خاص لعملاء دليلك المعتمدين',
    discount: 'توصيل مجاني + هدية',
    subtext: 'مع كل أوردر بقيمة 200 ج.م أو أكثر',
    cta: 'تواصل معنا فوراً'
  }
];

export const PromoBannerPanel: React.FC<PromoBannerPanelProps> = ({
  config,
  onChange,
  business
}) => {
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiOffers, setAiOffers] = useState<any[]>([]);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);
  const [aiErrorMessage, setAiErrorMessage] = useState<string | null>(null);

  const handleGenerateAiOffers = async () => {
    setLoadingAi(true);
    setAiErrorMessage(null);
    setAiSuccessMessage(null);
    try {
      const { offers, modelUsed } = await generateAiPromoOffersWithGemini(
        business?.name_ar || 'النشاط التجاري',
        business?.category || 'عام'
      );
      setAiOffers(offers);
      if (offers.length > 0) {
        onChange({
          ...config,
          headline: offers[0].headline,
          discountValue: offers[0].discountValue,
          subtext: offers[0].subtext,
          callToAction: offers[0].callToAction
        });
      }
      setAiSuccessMessage(`تم ابتكار ${offers.length} عروض بيعية مصرية بنجاح عبر (${modelUsed})`);
    } catch (e: any) {
      console.error('Failed to generate AI offers:', e);
      setAiErrorMessage(e.message || 'تعذر توليد العروض بالذكاء الاصطناعي');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* AI Offer Generator Button */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
            Gemini 3.6 Flash
          </span>
          <h4 className="font-bold text-xs text-slate-700">توليد عروض بيعية بالذكاء الاصطناعي</h4>
        </div>

        <button
          type="button"
          onClick={handleGenerateAiOffers}
          disabled={loadingAi}
          className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-100 transition cursor-pointer"
        >
          {loadingAi ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>جاري صياغة العروض الحماسية باللهجة المصرية...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-yellow-200" />
              <span>توليد 4 عروض مصرية مغرية لنشاط ({business?.name_ar || 'المحل'})</span>
            </>
          )}
        </button>

        {aiSuccessMessage && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center justify-between">
            <span className="text-[10px] bg-emerald-200/80 px-2 py-0.5 rounded">Gemini 3.6 Flash</span>
            <div className="flex items-center gap-1.5">
              <span>{aiSuccessMessage}</span>
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
        )}

        {aiErrorMessage && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-bold space-y-1">
            <div className="flex items-center justify-end gap-1 text-red-700">
              <span>تنبيه الاتصال</span>
              <span>⚠️</span>
            </div>
            <p className="text-[11px] text-red-600 font-normal">{aiErrorMessage}</p>
          </div>
        )}

        {/* AI Generated Offer Cards */}
        {aiOffers.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 block">اضغط على أي عرض لتطبيقه على التصميم فوراً:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {aiOffers.map((off, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onChange({
                    ...config,
                    headline: off.headline,
                    discountValue: off.discountValue,
                    subtext: off.subtext,
                    callToAction: off.callToAction
                  })}
                  className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-100/70 text-right transition cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-mono">
                      {off.discountValue}
                    </span>
                    <span className="text-xs font-bold text-slate-900 truncate">{off.headline}</span>
                  </div>
                  <p className="text-[10px] text-slate-600 line-clamp-2">{off.subtext}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Egyptian Presets */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h4 className="font-bold text-xs text-slate-700">قوالب العروض الكلاسيكية الجاهزة</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {EGYPTIAN_OFFER_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChange({
                ...config,
                headline: preset.title,
                discountValue: preset.discount,
                subtext: preset.subtext,
                callToAction: preset.cta
              })}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-indigo-50/50 hover:border-indigo-300 transition text-right cursor-pointer"
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                  {preset.discount}
                </span>
                <span className="text-xs font-bold text-slate-800 truncate">{preset.title}</span>
              </div>
              <p className="text-[10px] text-slate-500 truncate">{preset.subtext}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Offer Inputs */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <Flame className="w-4 h-4 text-red-600" />
          <h4 className="font-bold text-xs text-slate-700">تفاصيل العرض والتخفيض</h4>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              عنوان العرض الجذاب (Headline)
            </label>
            <input
              type="text"
              value={config.headline}
              onChange={(e) => onChange({ ...config, headline: e.target.value })}
              placeholder="مثال: قنبلة مشويات الويك إند!"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                قيمة الخصم البارزة
              </label>
              <input
                type="text"
                value={config.discountValue}
                onChange={(e) => onChange({ ...config, discountValue: e.target.value })}
                placeholder="25% خصم أو وفر 50 ج.م"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-red-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                صلاحية العرض
              </label>
              <input
                type="text"
                value={config.validUntil}
                onChange={(e) => onChange({ ...config, validUntil: e.target.value })}
                placeholder="حتى نفاذ الكمية"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-center"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              تفاصيل ومميزات العرض
            </label>
            <textarea
              rows={2}
              value={config.subtext}
              onChange={(e) => onChange({ ...config, subtext: e.target.value })}
              placeholder="على جميع الطلبات العائلية وتوصيل مجاني طوال الجمعة والسبت"
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 outline-hidden resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              دعوة الإجراء (Call to Action)
            </label>
            <input
              type="text"
              value={config.callToAction}
              onChange={(e) => onChange({ ...config, callToAction: e.target.value })}
              placeholder="اطلب الآن عبر واتساب: 01012345678"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden font-bold text-indigo-700"
            />
          </div>
        </div>
      </div>

      {/* Theme Style */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <h4 className="font-bold text-xs text-slate-700">طابع وهوية البانر البصري</h4>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'fire_sale', name: 'ناري وحماسي (Fire Sale)', colors: 'من الأحمر إلى البرتقالي' },
            { id: 'luxury_vip', name: 'ملكي فاخر (VIP Gold)', colors: 'من الأسود إلى الذهبي' },
            { id: 'weekend_deal', name: 'الويك إند المنعش', colors: 'أزرق سماوي وأبيض' },
            { id: 'ramadan_special', name: 'شرقي احتفالي', colors: 'أخضر زمردي وأصفر' }
          ].map((theme) => {
            const isSelected = config.themeStyle === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => onChange({ ...config, themeStyle: theme.id as any })}
                className={`p-2.5 rounded-xl border text-right transition cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/80 ring-1 ring-indigo-500'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold text-xs text-slate-800">{theme.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{theme.colors}</div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
