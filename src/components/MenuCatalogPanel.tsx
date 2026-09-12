import React, { useState } from 'react';
import { 
  UtensilsCrossed, 
  Plus, 
  Trash2, 
  Sparkles, 
  RefreshCw, 
  Tag, 
  DollarSign,
  Layers,
  FileText
} from 'lucide-react';
import { MenuCatalogConfig, MenuCatalogItem, DalilakBusiness } from '../types';
import { getContextualFallbackAnalysis } from '../services/visualAiService';

interface MenuCatalogPanelProps {
  config: MenuCatalogConfig;
  onChange: (newConfig: MenuCatalogConfig) => void;
  business: DalilakBusiness | null;
}

export const MenuCatalogPanel: React.FC<MenuCatalogPanelProps> = ({
  config,
  onChange,
  business
}) => {
  const [loadingAi, setLoadingAi] = useState(false);

  const handleAddItem = () => {
    const newItem: MenuCatalogItem = {
      id: Date.now().toString(),
      category: 'عام',
      name: 'بند جديد',
      description: 'وصف تفصيلي للبند ومكوناته أو الخدمة',
      price: 50,
      unit: 'قطعة',
      badge: ''
    };
    onChange({
      ...config,
      items: [...config.items, newItem]
    });
  };

  const handleUpdateItem = (id: string, updates: Partial<MenuCatalogItem>) => {
    onChange({
      ...config,
      items: config.items.map((it) => (it.id === id ? { ...it, ...updates } : it))
    });
  };

  const handleRemoveItem = (id: string) => {
    onChange({
      ...config,
      items: config.items.filter((it) => it.id !== id)
    });
  };

  const handleSuggestAiItems = () => {
    setLoadingAi(true);
    setTimeout(() => {
      const analysis = getContextualFallbackAnalysis(
        business?.name_ar || '',
        business?.category || 'عام'
      );
      onChange({
        ...config,
        items: analysis.suggestedMenuItems || config.items
      });
      setLoadingAi(false);
    }, 400);
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Menu Header Details */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <FileText className="w-4 h-4 text-indigo-600" />
          <h4 className="font-bold text-xs text-slate-700">بيانات وترويسة القائمة (Header)</h4>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              عنوان القائمة الرئيسي
            </label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => onChange({ ...config, title: e.target.value })}
              placeholder="قائمة الأسعار والخدمات المعتمدة"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              العنوان الفرعي أو الترحيبي
            </label>
            <input
              type="text"
              value={config.subtitle}
              onChange={(e) => onChange({ ...config, subtitle: e.target.value })}
              placeholder="طازة يومياً - جميع الأسعار شاملة الضريبة"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">العملة</label>
              <input
                type="text"
                value={config.currency}
                onChange={(e) => onChange({ ...config, currency: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-center font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">لون الترويسة</label>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1">
                <input
                  type="color"
                  value={config.primaryColor}
                  onChange={(e) => onChange({ ...config, primaryColor: e.target.value })}
                  className="w-6 h-6 rounded border-none cursor-pointer bg-transparent"
                />
                <span className="text-[10px] font-mono text-slate-500 uppercase">{config.primaryColor}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Fill & Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSuggestAiItems}
          disabled={loadingAi}
          className="flex-1 py-2.5 px-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
        >
          {loadingAi ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          )}
          <span>اقتراح بنود ذكية حسب النشاط ({business?.category || 'عام'})</span>
        </button>

        <button
          type="button"
          onClick={handleAddItem}
          className="py-2.5 px-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة بند</span>
        </button>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {config.items.map((item, index) => (
          <div
            key={item.id}
            className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5 relative group"
          >
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleRemoveItem(item.id)}
                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="حذف البند"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 flex-1 justify-end">
                <input
                  type="text"
                  value={item.category}
                  onChange={(e) => handleUpdateItem(item.id, { category: e.target.value })}
                  placeholder="القسم"
                  className="w-24 px-2 py-1 text-xs bg-slate-100 border border-slate-200 rounded-md text-slate-700 text-center font-bold"
                />
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                  placeholder="اسم المنتج أو الوجبة"
                  className="flex-1 max-w-[240px] px-2.5 py-1 text-sm bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:bg-white focus:border-indigo-500 outline-hidden"
                />
                <span className="text-xs font-bold text-slate-400 w-5 text-center">#{index + 1}</span>
              </div>
            </div>

            <div>
              <input
                type="text"
                value={item.description}
                onChange={(e) => handleUpdateItem(item.id, { description: e.target.value })}
                placeholder="وصف مختصر للمكونات أو المزايا..."
                className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:bg-white focus:border-indigo-500 outline-hidden"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={item.badge || ''}
                  onChange={(e) => handleUpdateItem(item.id, { badge: e.target.value })}
                  placeholder="شارة (مثال: الأكثر طلباً)"
                  className="w-32 px-2 py-1 text-[11px] bg-amber-50/60 border border-amber-200 text-amber-900 rounded-md text-center font-bold"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-400">لكل</span>
                  <input
                    type="text"
                    value={item.unit || ''}
                    onChange={(e) => handleUpdateItem(item.id, { unit: e.target.value })}
                    placeholder="قطعة"
                    className="w-16 px-1.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-center"
                  />
                </div>
                <div className="flex items-center gap-1 bg-indigo-50/70 border border-indigo-200 px-2 py-0.5 rounded-lg">
                  <span className="text-xs font-bold text-indigo-700">{config.currency}</span>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => handleUpdateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                    className="w-16 px-1 py-0.5 text-sm font-bold text-indigo-900 bg-transparent text-left outline-hidden font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
