import React, { useState } from 'react';
import { 
  Building2, 
  Palette, 
  Sparkles, 
  UploadCloud, 
  Settings, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { DalilakBusiness, ServerConfig } from '../types';
import { getServerConfig, saveServerConfig } from '../services/dalilakService';

interface HeaderProps {
  currentBusiness: DalilakBusiness | null;
  onOpenActivitiesModal: () => void;
  onPromoteToCore: () => void;
  isPromoting: boolean;
  isPromoted: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentBusiness,
  onOpenActivitiesModal,
  onPromoteToCore,
  isPromoting,
  isPromoted
}) => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [configForm, setConfigForm] = useState<ServerConfig>(getServerConfig());
  const [saveToast, setSaveToast] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveServerConfig(configForm);
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      setShowSettingsModal(false);
    }, 1200);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Logo & Platform Identity */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-100 ring-2 ring-indigo-50">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-slate-900 font-['Cairo']">
                  دليلك
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  ستوديو الهوية البصرية • المرحلة 2
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                توليد الشعارات الفيكتور، براويز السوشيال ميديا، والكتالوجات المعتمدة
              </p>
            </div>
          </div>

          {/* Active Business Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentBusiness ? (
              <div className="flex items-center gap-2 bg-slate-100/90 border border-slate-200/80 rounded-xl px-3 py-1.5">
                <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                <div className="max-w-[140px] sm:max-w-[220px] truncate text-right">
                  <span className="font-bold text-sm text-slate-800 block truncate">
                    {currentBusiness.name_ar}
                  </span>
                  <span className="text-[11px] text-slate-500 block truncate">
                    {currentBusiness.category || 'عام'} • {currentBusiness.city || currentBusiness.governorate || 'مصر'}
                  </span>
                </div>
              </div>
            ) : null}

            {/* Select Business Button */}
            <button
              onClick={onOpenActivitiesModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-bold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100/90 border border-indigo-200 rounded-xl transition cursor-pointer shadow-2xs"
            >
              <Building2 className="w-4 h-4" />
              <span className="hidden md:inline">اختيار نشاط من دليلك</span>
              <span className="md:hidden">الأنشطة</span>
            </button>

            {/* Promote to Core Production Button */}
            {currentBusiness && (
              <button
                onClick={onPromoteToCore}
                disabled={isPromoting}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-sm font-bold rounded-xl transition cursor-pointer shadow-2xs ${
                  isPromoted
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700'
                }`}
                title="ترقية واعتماد النشاط وأصوله البصرية في السيرفر الأساسي لدليلك"
              >
                {isPromoted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="hidden sm:inline">معتمد بالسيرفر الأساسي</span>
                    <span className="sm:hidden">معتمد</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className={`w-4 h-4 ${isPromoting ? 'animate-bounce' : ''}`} />
                    <span className="hidden sm:inline">
                      {isPromoting ? 'جاري الاعتماد...' : 'ترقية للسيرفر الأساسي'}
                    </span>
                    <span className="sm:hidden">ترقية</span>
                  </>
                )}
              </button>
            )}

            {/* Settings Button */}
            <button
              onClick={() => {
                setConfigForm(getServerConfig());
                setShowSettingsModal(true);
              }}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition border border-transparent hover:border-slate-200"
              title="إعدادات السيرفر ومفاتيح الذكاء الاصطناعي"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

        </div>
      </header>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-6 text-right animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-slate-800">إعدادات السيرفر ومفاتيح AI</h3>
                <Settings className="w-5 h-5 text-indigo-600" />
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  مفتاح Google Gemini API (تحليل اللافتات والرؤية الحاسوبية)
                </label>
                <input
                  type="password"
                  value={configForm.geminiKey}
                  onChange={(e) => setConfigForm({ ...configForm, geminiKey: e.target.value })}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  يُستخدم لتحليل صور واجهات المحلات واستخراج النصوص والألوان بالذكاء الاصطناعي.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5 mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-700">السيرفر الأساسي لدليلك (Core Supabase)</span>
                </div>
                <input
                  type="text"
                  value={configForm.coreUrl}
                  onChange={(e) => setConfigForm({ ...configForm, coreUrl: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mb-2 font-mono text-left"
                  dir="ltr"
                />
                <input
                  type="password"
                  value={configForm.coreKey}
                  onChange={(e) => setConfigForm({ ...configForm, coreKey: e.target.value })}
                  placeholder="Core Anon Key"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono text-left"
                  dir="ltr"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  سيرفر المنظومة المستقل (Ecosystem Staging Supabase)
                </label>
                <input
                  type="text"
                  value={configForm.ecosystemUrl}
                  onChange={(e) => setConfigForm({ ...configForm, ecosystemUrl: e.target.value })}
                  placeholder="https://your-ecosystem.supabase.co (اختياري)"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mb-2 font-mono text-left"
                  dir="ltr"
                />
              </div>

              {saveToast && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center">
                  تم حفظ الإعدادات بنجاح!
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
