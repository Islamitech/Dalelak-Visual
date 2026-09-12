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
}

/**
 * Converts an image URL to Base64 if needed, or handles data URLs
 */
async function getBase64FromUrl(imageUrl: string): Promise<{ data: string; mimeType: string } | null> {
  try {
    if (imageUrl.startsWith('data:')) {
      const match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        return { mimeType: match[1], data: match[2] };
      }
    }

    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const match = result.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          resolve({ mimeType: match[1], data: match[2] });
        } else {
          resolve(null);
        }
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn('Failed to convert image to base64:', e);
    return null;
  }
}

/**
 * Analyzes a business signboard or storefront image using Gemini Vision
 */
export async function analyzeSignboardWithGemini(
  imageUrl: string,
  businessContext?: { name_ar?: string; category?: string }
): Promise<SignboardAnalysisResult> {
  const { geminiKey } = getServerConfig();

  // If no Gemini key is provided or offline, use smart contextual fallback
  if (!geminiKey) {
    return getContextualFallbackAnalysis(businessContext?.name_ar || '', businessContext?.category || 'عام');
  }

  try {
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const imgData = await getBase64FromUrl(imageUrl);

    const promptText = `
أنت خبير معتمد في تصميم الهويات البصرية والبراندينج للأنشطة والمحلات التجارية في السوق المصري.
المطلوب: تحليل صورة لافتة المحل أو واجهة النشاط التجاري المرفقة واستخراج وتحليل كل التفاصيل بدقة فائقة.

اسم النشاط المقترح: "${businessContext?.name_ar || ''}"
فئة النشاط: "${businessContext?.category || ''}"

قم بإرجاع كائن JSON حصراً، بدون أي نصوص تمهيدية، بالصيغة التالية تماماً:
{
  "businessNameAr": "الاسم التجاري العربي المكتوب على اللافتة",
  "businessNameEn": "الاسم الإنجليزي المقابل أو المفرغ صوتياً بشكل جذاب",
  "category": "تصنيف النشاط الدقيق",
  "slogan": "شعار إعلاني مصري جذاب لا يتجاوز 6 كلمات",
  "primaryColor": "#hex لون رئيسي مناسب من اللافتة",
  "secondaryColor": "#hex لون ثانوي متناسق",
  "accentColor": "#hex لون تبايني مشرق للإبراز",
  "recommendedIcon": "اسم أيقونة دلالية من التالي: (Utensils, Coffee, Gem, Pill, Scissors, ShoppingBag, Flame, Sparkles, ChefHat, Crown, HeartHandshake)",
  "recommendedShape": "شكل الإطار: circle أو shield أو hexagon أو luxury_crest أو modern_badge أو minimal_ring",
  "recommendedLayout": "vertical أو horizontal أو emblem_stacked",
  "recommendedFont": "Cairo أو Tajawal أو Aref Ruqaa أو Amiri",
  "suggestedMenuItems": [
    {
      "id": "1",
      "category": "اسم القسم",
      "name": "اسم المنتج أو الخدمة المميزة",
      "description": "وصف شهي ومختصر",
      "price": 85,
      "unit": "وجبة",
      "badge": "الأكثر طلباً"
    }
  ],
  "suggestedOffers": [
    {
      "headline": "عنوان العرض باللهجة المصرية (مثال: قنبلة الأسبوع من الحاتي)",
      "discountValue": "20%",
      "subtext": "على جميع الطلبات العائلية طوال الويك إند",
      "callToAction": "اطلب دليفري الآن عبر واتساب"
    }
  ]
}
`;

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
      model: 'gemini-2.5-flash',
      contents: parts,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text?.trim() || '';
    const cleanJson = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      businessNameAr: parsed.businessNameAr || businessContext?.name_ar || 'نشاط دليلك',
      businessNameEn: parsed.businessNameEn || 'DALILAK BUSINESS',
      category: parsed.category || businessContext?.category || 'عام',
      slogan: parsed.slogan || 'الجودة والتميز دائماً في خدمتكم',
      primaryColor: parsed.primaryColor || '#1e293b',
      secondaryColor: parsed.secondaryColor || '#0ea5e9',
      accentColor: parsed.accentColor || '#f59e0b',
      recommendedIcon: parsed.recommendedIcon || 'Store',
      recommendedShape: parsed.recommendedShape || 'circle',
      recommendedLayout: parsed.recommendedLayout || 'vertical',
      recommendedFont: parsed.recommendedFont || 'Cairo',
      suggestedMenuItems: Array.isArray(parsed.suggestedMenuItems) && parsed.suggestedMenuItems.length > 0 
        ? parsed.suggestedMenuItems 
        : getFallbackMenuForCategory(businessContext?.category || 'عام'),
      suggestedOffers: Array.isArray(parsed.suggestedOffers) && parsed.suggestedOffers.length > 0
        ? parsed.suggestedOffers
        : getFallbackOffers(businessContext?.name_ar || 'المحل')
    };
  } catch (error) {
    console.warn('Gemini vision analysis failed, using contextual fallback:', error);
    return getContextualFallbackAnalysis(businessContext?.name_ar || '', businessContext?.category || 'عام');
  }
}

/**
 * Generates rich contextual fallback when API is offline or not set
 */
export function getContextualFallbackAnalysis(name: string, category: string): SignboardAnalysisResult {
  const cat = (category || '').toLowerCase();
  
  if (cat.includes('مطاعم') || cat.includes('أكل') || cat.includes('مشويات') || cat.includes('طعام')) {
    return {
      businessNameAr: name || 'مشويات ومطعم الأصيل',
      businessNameEn: 'AL ASEEL RESTAURANT',
      category: 'مطاعم ومشويات',
      slogan: 'طعم زمان وسر الصنعة على أصوله',
      primaryColor: '#991b1b', // Red-800
      secondaryColor: '#f97316', // Orange-500
      accentColor: '#fbbf24', // Amber-400
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
      ]
    };
  }

  if (cat.includes('كافيه') || cat.includes('بن') || cat.includes('قهوة')) {
    return {
      businessNameAr: name || 'كافيه وروستري العميد',
      businessNameEn: 'EL AMEED CAFE & ROASTERY',
      category: 'كافيهات ومحامص',
      slogan: 'فنجان قهوة بمزاج.. يضبط يومك',
      primaryColor: '#451a03', // Brown-900
      secondaryColor: '#b45309', // Amber-700
      accentColor: '#fde68a', // Amber-200
      recommendedIcon: 'Coffee',
      recommendedShape: 'circle',
      recommendedLayout: 'emblem_stacked',
      recommendedFont: 'Aref Ruqaa',
      suggestedMenuItems: [
        { id: '1', category: 'القهوة المختصة', name: 'قهوة تركي مخصوص بالحبهان', description: 'بن برازيلي وكولومبي محمص ومطحون طازج', price: 45, unit: 'فنجان', badge: 'مزاج' },
        { id: '2', category: 'القهوة المختصة', name: 'سبانش لاتيه مثلج (Iced Spanish Latte)', description: 'إسبريسو دبل شوت مع حليب مكثف محلى', price: 75, unit: 'كوب', badge: 'تريند' },
        { id: '3', category: 'المخبوزات', name: 'كرواسون زبدة فرنسي سادة أو شوكولاتة', description: 'طازة ومقرمش مخبوز يومياً في الصباح', price: 50, unit: 'قطعة', badge: 'طازة' },
        { id: '4', category: 'العصائر', name: 'موهيتو ليمون ونعناع منعش', description: 'صودا مع ليمون ونعناع فريش وسيرب طبيعي', price: 55, unit: 'كوب' }
      ],
      suggestedOffers: [
        { headline: '☕ صباحك رايق مع فنجان قهوتك المفضل', discountValue: 'اشتري 1 واحصل على 1', subtext: 'من الساعة 8 صباحاً حتى 12 ظهراً على كل أنواع القهوة', callToAction: 'شرفنا في الفرع وابدأ يومك بنشاط' },
        { headline: '🧊 كسر حر الصيف مع تشكيلة المشروبات المثلجة', discountValue: 'خصم 15%', subtext: 'على جميع مشروبات الفريبوتشينو والموهيتو المنعشة', callToAction: 'اطلب من المنيو الآن' }
      ]
    };
  }

  if (cat.includes('ذهب') || cat.includes('مجوهرات') || cat.includes('ساعات') || cat.includes('فضة')) {
    return {
      businessNameAr: name || 'مجوهرات الملكة',
      businessNameEn: 'QUEEN JEWELRY & DIAMONDS',
      category: 'مجوهرات وساعات فاخرة',
      slogan: 'بريق الذهب وأناقة تدوم مدى الحياة',
      primaryColor: '#0f172a', // Slate-900
      secondaryColor: '#d97706', // Gold-600
      accentColor: '#fef08a', // Light gold
      recommendedIcon: 'Gem',
      recommendedShape: 'luxury_crest',
      recommendedLayout: 'vertical',
      recommendedFont: 'Amiri',
      suggestedMenuItems: [
        { id: '1', category: 'أطقم ذهب', name: 'طقم شبكة فاخر عيار 18 كوليه وأسورة', description: 'تصميم إيطالي راقٍ مرصع بأحجار الزيركون السويسرية', price: 42000, unit: 'طقم', badge: 'VIP' },
        { id: '2', category: 'خواتم ودبل', name: 'دبلة ومحبس ماسي سوليتير معتمد', description: 'ذهب أبيض وأصفر عيار 18 مع شهادة ضمان معتمدة', price: 18500, unit: 'قطعة', badge: 'زفاف' },
        { id: '3', category: 'ساعات فاخرة', name: 'ساعة يد أصلية مقاومة للماء مع ضمان عامين', description: 'مينا كلاسيكية فاخرة بحزام جلد طبيعي أو ستانلس ستيل', price: 6500, unit: 'قطعة', badge: 'ضمان' }
      ],
      suggestedOffers: [
        { headline: '✨ تألقي كالملكة.. تخفيض خاص على المصنعية!', discountValue: 'خصم 50% على المصنعية', subtext: 'لكل العرائس على تشكيلة شبكات الذهب عيار 18 و21', callToAction: 'زوري فرعنا واختاري شبكة أحلامك' },
        { headline: '💍 هدية استثنائية لمن تحب في كل مناسبة', discountValue: 'خصم 20%', subtext: 'على مجموعة السلاسل والأساور الخفيفة العصرية', callToAction: 'احجز قطعتك الآن عبر واتساب' }
      ]
    };
  }

  // Default general business
  return {
    businessNameAr: name || 'مؤسسة النور التجارية',
    businessNameEn: 'AL NOOR COMMERCE & SERVICES',
    category: category || 'خدمات وتجارة عامة',
    slogan: 'ثقة وأمانة وجودة نعتز بتقديمها',
    primaryColor: '#0284c7', // Sky-600
    secondaryColor: '#0f172a', // Slate-900
    accentColor: '#38bdf8', // Sky-400
    recommendedIcon: 'Sparkles',
    recommendedShape: 'modern_badge',
    recommendedLayout: 'vertical',
    recommendedFont: 'Cairo',
    suggestedMenuItems: getFallbackMenuForCategory(category),
    suggestedOffers: getFallbackOffers(name || 'النشاط')
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
