import { GoogleGenAI } from '@google/genai';
import { getServerConfig } from './dalilakService';
import { 
  VectorLogoConfig, 
  MenuCatalogItem, 
  PromoBannerConfig,
  LogoShapeContainer,
  LogoLayout,
  LogoFontFamily
} from '../types';

export const PRIMARY_GEMINI_MODEL = 'gemini-3.6-flash';
export const FALLBACK_GEMINI_MODELS = ['gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];

export interface SignboardAnalysisResult {
  businessNameAr: string;
  businessNameEn: string;
  category: string;
  slogan: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  recommendedIcon: string;
  recommendedShape: LogoShapeContainer;
  recommendedLayout: LogoLayout;
  recommendedFont: LogoFontFamily;
  suggestedMenuItems: MenuCatalogItem[];
  suggestedOffers: {
    headline: string;
    discountValue: string;
    subtext: string;
    callToAction: string;
  }[];
  isAiGenerated: boolean;
  modelUsed: string;
  rawAiFeedback?: string;
}

/**
 * Robust image to base64 converter handling data URLs, fetch, and canvas fallback
 */
async function getBase64FromUrl(imageUrl: string): Promise<{ data: string; mimeType: string } | null> {
  if (!imageUrl) return null;

  // 1. Direct Base64 Data URL
  if (imageUrl.startsWith('data:')) {
    const match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      return { mimeType: match[1], data: match[2] };
    }
  }

  // 2. Fetch approach
  try {
    const response = await fetch(imageUrl, { mode: 'cors' });
    if (response.ok) {
      const blob = await response.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          const m = res.match(/^data:([^;]+);base64,(.+)$/);
          if (m) resolve({ mimeType: m[1], data: m[2] });
          else resolve(null);
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    }
  } catch (e) {
    // Continue to canvas fallback
  }

  // 3. HTMLImageElement + Canvas fallback for cross-origin images
  try {
    return await new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = Math.min(img.naturalWidth || 800, 1024);
          canvas.height = Math.min(img.naturalHeight || 800, 1024);
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(null);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
          if (m) resolve({ mimeType: m[1], data: m[2] });
          else resolve(null);
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = imageUrl;
    });
  } catch {
    return null;
  }
}

/**
 * Executes a Gemini request with automatic cascade across active Gemini 3.6+ models
 */
async function executeGeminiPrompt(
  apiKey: string,
  promptText: string,
  imgData: { data: string; mimeType: string } | null
): Promise<{ text: string; modelUsed: string }> {
  // 1. Try GoogleGenAI SDK with PRIMARY_GEMINI_MODEL
  try {
    const ai = new GoogleGenAI({ apiKey });
    const parts: any[] = [{ text: promptText }];
    if (imgData) {
      parts.push({
        inlineData: {
          mimeType: imgData.mimeType,
          data: imgData.data
        }
      });
    }

    const response = await ai.models.generateContent({
      model: PRIMARY_GEMINI_MODEL,
      contents: parts,
      config: { responseMimeType: 'application/json' }
    });

    if (response.text) {
      return { text: response.text, modelUsed: PRIMARY_GEMINI_MODEL };
    }
  } catch (sdkError: any) {
    console.warn(`SDK call with ${PRIMARY_GEMINI_MODEL} failed, activating REST API cascade:`, sdkError?.message || sdkError);
  }

  // 2. High-speed REST API Cascade across candidate active models
  let lastError = 'No response received';
  for (const model of FALLBACK_GEMINI_MODELS) {
    try {
      const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload: any = {
        contents: [{
          parts: [
            { text: promptText },
            ...(imgData ? [{ inline_data: { mime_type: imgData.mimeType, data: imgData.data } }] : [])
          ]
        }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.75
        }
      };

      const res = await fetch(restUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const json = await res.json();
        const candText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candText) {
          return { text: candText, modelUsed: model };
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        lastError = errJson?.error?.message || `HTTP ${res.status}`;
      }
    } catch (restErr: any) {
      lastError = restErr?.message || 'Network fetch error';
    }
  }

  throw new Error(`تعذر الاتصال بنماذج Google Gemini (${PRIMARY_GEMINI_MODEL}): ${lastError}`);
}

/**
 * Analyzes a business signboard or storefront image using Gemini 3.6 Flash
 * Throws explicit error if AI generation fails, preventing silent generic fallbacks.
 */
export async function analyzeSignboardWithGemini(
  imageUrl: string,
  businessContext?: { name_ar?: string; category?: string }
): Promise<SignboardAnalysisResult> {
  const { geminiKey } = getServerConfig();

  if (!geminiKey) {
    throw new Error('يرجى ضبط مفتاح Google Gemini API في الإعدادات لتفعيل التحليل الذكي للواجهة.');
  }

  const imgData = await getBase64FromUrl(imageUrl);

  const promptText = `
أنت خبير محترف في تصميم الهويات البصرية والبراندينج للشركات والمحلات التجارية في السوق المصري (Creative Art Director & Brand Strategist).
المطلوب: تحليل صورة لافتة المحل أو واجهة النشاط التجاري المرفقة واستخراج هوية بصرية متميزة واحترافية وغير مكررة.

اسم النشاط المقترح: "${businessContext?.name_ar || ''}"
فئة النشاط الميداني: "${businessContext?.category || ''}"

تعليمات التحليل الصارمة:
1. استخرج الاسم التجاري الحقيقي بدقة مع صياغة اسم إنجليزي فخم وموزون مقابلاً له.
2. ابتكر شعاراً لفظياً (Slogan) مصرياً أصيلاً مبدعاً يلمس مشاعر العميل ويبتعد عن العبارات المبتذلة.
3. استخرج لوحة ألوان دقيقة ومتناسقة جداً (Primary, Secondary, Accent) بتنسيق Hex تناسب فئة هذا النشاط بالذات.
4. اختر أفضل أيقونة دلالية من هذه القائمة حصراً: (Store, Utensils, ChefHat, Flame, Coffee, Gem, Crown, Pill, Scissors, ShoppingBag, Sparkles, Car, Wrench, HeartHandshake).
5. اختر شكل الإطار المناسب من: (circle, shield, hexagon, luxury_crest, modern_badge, minimal_ring, none).
6. اختر الخط العربي المناسب: (Cairo, Tajawal, Aref Ruqaa, Amiri).
7. اقترح 4 أصناف منيو أو خدمات حقيقية لهذا المحل مع أسعار واقعية جداً بالجنيه المصري EGP.
8. صغ عرضين ترويجيين مغريين باللهجة المصرية الحماسية.

أجب بكائن JSON صالح فقط بدون أي تعليقات خارج الكائن:
{
  "businessNameAr": "الاسم العربي",
  "businessNameEn": "ENGLISH NAME",
  "category": "تصنيف النشاط",
  "slogan": "الشعار الإعلاني المبتكر",
  "primaryColor": "#hex",
  "secondaryColor": "#hex",
  "accentColor": "#hex",
  "recommendedIcon": "اسم الأيقونة من القائمة المحددة",
  "recommendedShape": "شكل الإطار",
  "recommendedLayout": "vertical",
  "recommendedFont": "Cairo",
  "suggestedMenuItems": [
    {
      "id": "1",
      "category": "القسم",
      "name": "اسم المنتج المميز",
      "description": "وصف شهي ومحدد",
      "price": 85,
      "unit": "وجبة",
      "badge": "الأكثر طلباً"
    }
  ],
  "suggestedOffers": [
    {
      "headline": "عنوان العرض المصري",
      "discountValue": "خصم 20%",
      "subtext": "تفاصيل العرض",
      "callToAction": "اطلب الآن عبر واتساب"
    }
  ]
}
`;

  const { text: responseText, modelUsed } = await executeGeminiPrompt(geminiKey, promptText, imgData);
  const cleanJson = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
  const parsed = JSON.parse(cleanJson);

  return {
    businessNameAr: parsed.businessNameAr || businessContext?.name_ar || 'نشاط دليلك',
    businessNameEn: parsed.businessNameEn || 'DALILAK BUSINESS',
    category: parsed.category || businessContext?.category || 'عام',
    slogan: parsed.slogan || 'الجودة والأصالة في خدمتكم',
    primaryColor: parsed.primaryColor || '#0f172a',
    secondaryColor: parsed.secondaryColor || '#0284c7',
    accentColor: parsed.accentColor || '#f59e0b',
    recommendedIcon: parsed.recommendedIcon || 'Store',
    recommendedShape: parsed.recommendedShape || 'modern_badge',
    recommendedLayout: parsed.recommendedLayout || 'vertical',
    recommendedFont: parsed.recommendedFont || 'Cairo',
    suggestedMenuItems: Array.isArray(parsed.suggestedMenuItems) && parsed.suggestedMenuItems.length > 0 
      ? parsed.suggestedMenuItems 
      : getFallbackMenuForCategory(businessContext?.category || 'عام'),
    suggestedOffers: Array.isArray(parsed.suggestedOffers) && parsed.suggestedOffers.length > 0
      ? parsed.suggestedOffers
      : getFallbackOffers(businessContext?.name_ar || 'المحل'),
    isAiGenerated: true,
    modelUsed
  };
}

/**
 * Generates an authentic luxury AI Logo Image using Google Generative AI Image Models
 */
export async function generateAiLogoImageWithImagen(params: {
  businessName: string;
  category: string;
  englishName?: string;
  slogan?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  customPrompt?: string;
}): Promise<{ imageUrl: string; promptUsed: string }> {
  const { geminiKey } = getServerConfig();

  if (!geminiKey) {
    throw new Error('يرجى التأكد من ضبط مفتاح Google Gemini API في الإعدادات.');
  }

  const prompt = params.customPrompt || `A premium minimalist luxury vector emblem logo design for an Egyptian business named '${params.businessName}' (${params.englishName || ''}), specializing in ${params.category}. The emblem features an elegant stylized iconic symbol with modern luxury aesthetic, in rich harmonious colors (${params.primaryColor || '#0f172a'}, ${params.secondaryColor || '#0284c7'}, and ${params.accentColor || '#f59e0b'}). Clean vector art style, pristine symmetry, centered composition on a pure solid neutral white background, flat design, sharp edges, professional corporate identity mark, award-winning branding, no blur, high quality.`;

  // Models supported by Google for image generation via generateContent / predict
  const candidateModels = [
    'gemini-2.5-flash-image',
    'gemini-3.1-flash-image',
    'gemini-3-pro-image',
    'imagen-3.0-generate-002',
    'imagen-3.0-fast-generate-001'
  ];

  let quotaOrBillingIssue = false;
  let lastErrorDetail = '';

  for (const model of candidateModels) {
    try {
      // 1. Try modern generateContent endpoint
      const genContentEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
      const payload = {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      };

      const res = await fetch(genContentEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        const parts = json?.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || 'image/jpeg';
            return {
              imageUrl: `data:${mime};base64,${part.inlineData.data}`,
              promptUsed: prompt
            };
          }
        }
      } else {
        const errMsg = json?.error?.message || `HTTP ${res.status}`;
        if (errMsg.includes('limit: 0') || errMsg.includes('Quota exceeded') || res.status === 429) {
          quotaOrBillingIssue = true;
          lastErrorDetail = errMsg;
          break;
        }
      }
    } catch (e: any) {
      lastErrorDetail = e?.message || '';
    }
  }

  if (quotaOrBillingIssue) {
    throw new Error(
      'تنبيه الحساب المجاني: مفتاح Google API الحالي على الخطة المجانية (Free Tier)، وتضع Google حداً أقصى = 0 لنماذج توليد الصور. لتوليد الصور ونماذج Imagen، تتطلب Google تفعيل الفوترة (Pay-as-you-go) في حساب Google AI Studio (تكلفة الصورة حوالي 0.03$). يمكنك حالياً الاعتماد على الشعار الفيكتور المطور أو رفع شعار مخصص من جهازك بنقرة واحدة.'
    );
  }

  throw new Error(
    `تعذر توليد الصورة عبر محركات Google (${lastErrorDetail || 'النموذج غير متاح لهذا المفتاح'}). يمكنك استخدام الشعار الفيكتور عالي الدقة أو رفع لوجو مصمم مسبقاً.`
  );
}

/**
 * Generates custom, innovative menu & price catalog items using Gemini 3.6 Flash
 */
export async function generateAiMenuItemsWithGemini(
  businessName: string,
  category: string
): Promise<{ items: MenuCatalogItem[]; modelUsed: string }> {
  const { geminiKey } = getServerConfig();

  if (!geminiKey) {
    throw new Error('يرجى التأكد من ضبط مفتاح Gemini API في الإعدادات.');
  }

  const promptText = `
أنت مستشار تسويق وتطوير قوائم أسعار ومنيو للأنشطة التجارية في مصر.
اسم النشاط: "${businessName}"
فئة النشاط: "${category}"

المطلوب: توليد 6 إلى 8 أصناف/خدمات تسعيرية مميزة وحقيقية جداً ومتنوعة لهذا النشاط في مصر مع أسعار دقيقة ومتناسبة بالجنيه المصري (EGP).
قسّم العناصر إلى قسمين أو ثلاثة أقسام واضحة (مثال: الأكثر طلباً، باقات مميزة، إضافات).

أجب حصراً بمصفوفة JSON من الكائنات بالصيغة التالية:
[
  {
    "id": "1",
    "category": "اسم القسم",
    "name": "اسم الصنف أو الخدمة",
    "description": "وصف دقيق وجذاب للمكونات أو المزايا",
    "price": 150,
    "unit": "وجبة أو قطعة أو خدمة",
    "badge": "الأكثر طلباً أو توفير"
  }
]
`;

  const { text: responseText, modelUsed } = await executeGeminiPrompt(geminiKey, promptText, null);
  const cleanJson = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
  const parsed = JSON.parse(cleanJson);

  if (Array.isArray(parsed) && parsed.length > 0) {
    return {
      items: parsed.map((it: any, idx: number) => ({
        id: String(idx + 1),
        category: it.category || 'عام',
        name: it.name || `صنف ${idx + 1}`,
        description: it.description || '',
        price: it.price || 50,
        unit: it.unit || 'قطعة',
        badge: it.badge || ''
      })),
      modelUsed
    };
  }

  throw new Error('فشل تفسير قائمة المنيو المولدة من الذكاء الاصطناعي.');
}

/**
 * Generates high-converting Egyptian marketing promo offers using Gemini 3.6 Flash
 */
export async function generateAiPromoOffersWithGemini(
  businessName: string,
  category: string
): Promise<{ offers: any[]; modelUsed: string }> {
  const { geminiKey } = getServerConfig();

  if (!geminiKey) {
    throw new Error('يرجى التأكد من ضبط مفتاح Gemini API في الإعدادات.');
  }

  const promptText = `
أنت كاتب إعلانات خبير (Senior Egyptian Copywriter) متخصص في عروض التوفير والخصومات التي تحقق مبيعات فورية.
اسم النشاط: "${businessName}"
فئة النشاط: "${category}"

المطلوب: ابتكار 4 عروض ترويجية نارية ومبتكرة باللهجة المصرية الذكية التي تلفت الانتباه وتدفع العميل للتواصل الفوري.

أجب حصراً بمصفوفة JSON:
[
  {
    "headline": "عنوان العرض الرئيسي باللهجة المصرية الحماسية",
    "discountValue": "قيمة الخصم البارزة (مثال: خصم 25% أو وفر 100 ج.م أو 1+1 مجاناً)",
    "subtext": "شرح مميزات العرض وشروطه باختصار",
    "callToAction": "الدعوة للإجراء مثل: اطلب عبر واتساب والتوصيل مجاناً"
  }
]
`;

  const { text: responseText, modelUsed } = await executeGeminiPrompt(geminiKey, promptText, null);
  const cleanJson = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
  const parsed = JSON.parse(cleanJson);

  if (Array.isArray(parsed) && parsed.length > 0) {
    return { offers: parsed, modelUsed };
  }

  throw new Error('فشل توليد العروض الترويجية من الذكاء الاصطناعي.');
}

/**
 * Built-in contextual fallback only used when offline or explicitly requested
 */
export function getContextualFallbackAnalysis(name: string, category: string): SignboardAnalysisResult {
  const cat = (category || '').toLowerCase();
  
  if (cat.includes('مطاعم') || cat.includes('أكل') || cat.includes('مشويات') || cat.includes('طعام')) {
    return {
      businessNameAr: name || 'مشويات ومطعم الأصيل',
      businessNameEn: 'AL ASEEL RESTAURANT',
      category: 'مطاعم ومشويات',
      slogan: 'طعم زمان وسر الصنعة على أصوله',
      primaryColor: '#991b1b',
      secondaryColor: '#f97316',
      accentColor: '#fbbf24',
      recommendedIcon: 'Flame',
      recommendedShape: 'shield',
      recommendedLayout: 'vertical',
      recommendedFont: 'Cairo',
      suggestedMenuItems: [
        { id: '1', category: 'المشويات', name: 'كيلو كباب وكفتة مشكل بلدي', description: 'مشوي على الفحم مع طحينة وسلطات وعيش طازة', price: 540, unit: 'كجم', badge: 'الأكثر طلباً' },
        { id: '2', category: 'المشويات', name: 'نصف فرخة مشوية على الفحم', description: 'بتتبيلة الحاتي الخاصة مع أرز بسمتي فاخر', price: 160, unit: 'وجبة', badge: 'توفير' },
        { id: '3', category: 'طواجن فرن', name: 'طاجن عكاوي بالبصل القاورما', description: 'في الفرن الفخار مع الصوص المكرمل', price: 280, unit: 'طاجن', badge: 'مميز' },
        { id: '4', category: 'وجبات سريعة', name: 'حواوشي بلدي مخصوص بالسمنة', description: 'لحم مفروم بلدي متبل مع جبنة موزاريلا اختيارية', price: 75, unit: 'رغيف', badge: 'شعبية' }
      ],
      suggestedOffers: [
        { headline: '🔥 قنبلة مشويات الويك إند من الأصيل!', discountValue: '20% خصم', subtext: 'على جميع صواني التوفير العائلية طوال الجمعة والسبت', callToAction: 'اطلب على واتساب والتوصيل مجاناً' },
        { headline: '🍗 وجبة الغدا الصح.. كباب وكفتة بريحة الفحم', discountValue: 'وفر 50 ج.م', subtext: 'مع كل وجبة مشويات احصل على طبق أرز وطحينة إضافي مجاناً', callToAction: 'اطلب الآن ويوصلك سخن مولع' }
      ],
      isAiGenerated: false,
      modelUsed: 'offline-contextual-fallback'
    };
  }

  return {
    businessNameAr: name || 'مؤسسة دليلك التجارية',
    businessNameEn: 'DALILAK BUSINESS',
    category: category || 'عام',
    slogan: 'ثقة وأمانة وجودة نعتز بتقديمها',
    primaryColor: '#0f172a',
    secondaryColor: '#0284c7',
    accentColor: '#f59e0b',
    recommendedIcon: 'Store',
    recommendedShape: 'modern_badge',
    recommendedLayout: 'vertical',
    recommendedFont: 'Cairo',
    suggestedMenuItems: getFallbackMenuForCategory(category),
    suggestedOffers: getFallbackOffers(name || 'النشاط'),
    isAiGenerated: false,
    modelUsed: 'offline-contextual-fallback'
  };
}

function getFallbackMenuForCategory(category: string): MenuCatalogItem[] {
  return [
    { id: '1', category: 'الباقات الأساسية', name: 'باقة الخدمة المميزة (VIP)', description: 'أعلى مستوى من الدقة والتنفيذ السريع مع ضمان شامل', price: 350, unit: 'خدمة', badge: 'الأكثر طلباً' },
    { id: '2', category: 'الباقات الأساسية', name: 'الباقة الاقتصادية الشاملة', description: 'توفير حقيقي مع الحفاظ على معايير الجودة الأساسية', price: 180, unit: 'باقة', badge: 'توفير' },
    { id: '3', category: 'خدمات إضافية', name: 'خدمة الفحص والمعاينة الفورية', description: 'معاينة ميدانية وتحديد الاحتياجات بتقرير فني كامل', price: 100, unit: 'زيارة' }
  ];
}

function getFallbackOffers(name: string) {
  return [
    { headline: `🎉 عرض خاص وحصري من ${name}!`, discountValue: 'خصم 25%', subtext: 'لفترة محدودة على جميع الخدمات والمنتجات المختارة', callToAction: 'تواصل معنا فوراً عبر واتساب للاستفادة' },
    { headline: `⚡ فرصة لا تعوض.. أسعار لا تقبل المنافسة!`, discountValue: 'وفر الآن', subtext: 'ضمان معتمد على جميع المنتجات مع خدمة ما بعد البيع المميزة', callToAction: 'اطلب الآن ولا تفوت الفرصة' }
  ];
}
