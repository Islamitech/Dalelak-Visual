import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Phone, 
  Tag, 
  Building2, 
  CheckCircle, 
  Image as ImageIcon,
  RefreshCw,
  X,
  AlertCircle
} from 'lucide-react';
import { DalilakBusiness } from '../types';
import { fetchDalilakBusinesses } from '../services/dalilakService';

interface DalilakActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBusiness: (business: DalilakBusiness) => void;
}

const CATEGORIES = [
  'all',
  'مطاعم',
  'كافيهات',
  'مجوهرات وإكسسوارات',
  'صيدليات وطبية',
  'حلويات ومخبوزات',
  'ملابس وأزياء',
  'صالونات وتجميل',
  'صيانة وخدمات'
];

const GOVERNORATES = [
  'all',
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الدقهلية',
  'الغربية',
  'الشرقية',
  'القليوبية'
];

export const DalilakActivitiesModal: React.FC<DalilakActivitiesModalProps> = ({
  isOpen,
  onClose,
  onSelectBusiness
}) => {
  const [businesses, setBusinesses] = useState<DalilakBusiness[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGov, setSelectedGov] = useState('all');
  const [isLiveServer, setIsLiveServer] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setServerError(null);
    try {
      const res = await fetchDalilakBusinesses({
        search,
        category: selectedCategory,
        governorate: selectedGov,
        limit: 50
      });
      setBusinesses(res.data);
      setIsLiveServer(res.isLive);
      if (res.error) setServerError(res.error);
    } catch (err) {
      setServerError('خطأ أثناء جلب الأنشطة');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, selectedCategory, selectedGov]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                isLiveServer 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {isLiveServer ? '● اتصال مباشر بسيرفر دليلك' : '● عينات ميدانية توضيحية'}
              </span>
              <h2 className="font-bold text-lg text-slate-900 font-['Cairo']">
                سحب الأنشطة واللافتات الميدانية
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              اختر أي نشاط مسجل لاستيراد بياناته وصور لافتته وواجهته لبدء تصميم هويته البصرية
            </p>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-white space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>بحث</span>
            </button>
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث بالاسم العربي، الإنجليزي، رقم الهاتف، أو الحي..."
                className="w-full pl-4 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden text-right"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            </div>
          </form>

          {/* Quick Filter Tags */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <div className="flex items-center gap-1 shrink-0 text-slate-400">
              <Tag className="w-3.5 h-3.5" />
              <span className="font-bold">التصنيف:</span>
            </div>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'الكل' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback / Alert */}
        {serverError && (
          <div className="mx-4 mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-800 text-xs text-right justify-end">
            <span>{serverError}</span>
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          </div>
        )}

        {/* Business Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-7 h-7 animate-spin text-indigo-600" />
              <p className="text-sm font-medium">جاري استدعاء الأنشطة واللافتات...</p>
            </div>
          ) : businesses.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-slate-600">لم يتم العثور على أنشطة مطابقة</p>
              <p className="text-xs text-slate-400 mt-1">جرّب تغيير كلمات البحث أو اختيار تصنيف مختلف</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {businesses.map((biz) => {
                const photosCount = Array.isArray(biz.photos) ? biz.photos.length : 0;
                const firstPhoto = photosCount > 0 ? biz.photos![0] : null;

                return (
                  <div
                    key={biz.id}
                    className="p-3.5 bg-slate-50/70 hover:bg-indigo-50/40 border border-slate-200/80 hover:border-indigo-300 rounded-2xl transition flex gap-3 text-right group"
                  >
                    {/* Thumbnail / Signboard image */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200 relative">
                      {firstPhoto ? (
                        <img
                          src={typeof firstPhoto === 'string' ? firstPhoto : (firstPhoto as any).url}
                          alt={biz.name_ar}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                          <ImageIcon className="w-6 h-6 mb-1" />
                          <span className="text-[9px]">بدون صورة</span>
                        </div>
                      )}
                      {photosCount > 1 && (
                        <span className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          +{photosCount}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                            {biz.category || 'عام'}
                          </span>
                          <h3 className="font-bold text-slate-900 text-sm truncate font-['Cairo']">
                            {biz.name_ar}
                          </h3>
                        </div>

                        {biz.name_en && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5" dir="ltr">
                            {biz.name_en}
                          </p>
                        )}

                        <div className="flex items-center justify-end gap-1 text-[11px] text-slate-500 mt-1.5 truncate">
                          <span>{biz.street || biz.city || biz.governorate || 'مصر'}</span>
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        </div>
                      </div>

                      {/* Select Action Button */}
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 font-mono">
                          {biz.phone || biz.secondary_phone || ''}
                        </span>
                        <button
                          onClick={() => {
                            onSelectBusiness(biz);
                            onClose();
                          }}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>استيراد وتصميم</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
