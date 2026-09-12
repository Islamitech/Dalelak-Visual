export interface DalilakBusiness {
  id: string;
  name_ar: string;
  name_en?: string;
  category?: string;
  governorate?: string;
  city?: string;
  street?: string;
  landmark?: string;
  phone: string;
  secondary_phone?: string;
  working_hours?: string;
  description?: string;
  lat?: number;
  lng?: number;
  owner_name?: string;
  owner_phone?: string;
  photos?: string[]; // الواجهات الميدانية واللافتات والكروت بتشفير Base64 أو روابط سحابية
  google_maps_url?: string;
  google_place_id?: string;
  verification_status?: string;
  notes?: string | Record<string, any>;
  created_at?: string;
  invoice_number?: string;
}

export type LogoShapeContainer = 
  | 'none' 
  | 'circle' 
  | 'shield' 
  | 'hexagon' 
  | 'luxury_crest' 
  | 'modern_badge' 
  | 'minimal_ring';

export type LogoLayout = 
  | 'vertical' 
  | 'horizontal' 
  | 'emblem_stacked' 
  | 'icon_center';

export type LogoFontFamily = 
  | 'Cairo' 
  | 'Tajawal' 
  | 'Aref Ruqaa' 
  | 'Amiri' 
  | 'Outfit';

export interface VectorLogoConfig {
  businessName: string;
  englishName: string;
  slogan: string;
  iconCategory: string;
  iconName: string;
  shapeContainer: LogoShapeContainer;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  fontFamily: LogoFontFamily;
  layout: LogoLayout;
  showEnglishName: boolean;
  showSlogan: boolean;
  showEstablishedYear: boolean;
  establishedYear: string;
  customSvgPath?: string;
  logoMode?: 'ai_image' | 'vector_preset';
  aiGeneratedImageUrl?: string | null;
  aiPrompt?: string;
  isGeneratingAiImage?: boolean;
}

export type FrameFormat = 'square' | 'story' | 'landscape';

export type FrameStyle = 
  | 'luxury_gold' 
  | 'baladi_fresh' 
  | 'vibrant_neon' 
  | 'clean_minimal' 
  | 'ramadan_oriental' 
  | 'street_food' 
  | 'corporate_blue' 
  | 'craftsman_industrial';

export interface SocialFrameConfig {
  format: FrameFormat;
  frameStyle: FrameStyle;
  productImage: string | null;
  productImageZoom: number; // 1 to 2
  productImageOffset: { x: number; y: number };
  badgeText: string;
  badgeType: 'offer' | 'quality' | 'discount' | 'new' | 'delivery' | 'custom' | 'none';
  showContactBar: boolean;
  phoneNumber: string;
  whatsappNumber: string;
  showDalilakVerifiedBadge: boolean;
  showLogo: boolean;
  logoPlacement: 'top_right' | 'top_left' | 'top_center' | 'bottom_right';
  headline: string;
  subheadline: string;
  primaryColor: string;
  accentColor: string;
}

export interface MenuCatalogItem {
  id: string;
  category: string;
  name: string;
  description: string;
  price: string | number;
  unit?: string; // قطعة / وجبة / كجم / باقة
  badge?: string; // الأكثر طلباً / توفير / حصري / جديد
}

export interface MenuCatalogConfig {
  title: string;
  subtitle: string;
  categories: string[];
  items: MenuCatalogItem[];
  layout: 'two_column' | 'single_column' | 'cards_grid';
  themeStyle: 'modern_clean' | 'warm_restaurant' | 'luxury_dark_accent' | 'fresh_market';
  currency: string;
  footerNote: string;
  showPrices: boolean;
  primaryColor: string;
  accentColor: string;
}

export interface PromoBannerConfig {
  headline: string;
  discountValue: string;
  subtext: string;
  badge: string;
  validUntil: string;
  terms: string;
  callToAction: string;
  themeStyle: 'fire_sale' | 'luxury_vip' | 'weekend_deal' | 'ramadan_special';
  format: 'square' | 'banner';
  primaryColor: string;
  accentColor: string;
  showQrBadge: boolean;
}

export interface VisualEcosystemProgress {
  businessId: string;
  businessName: string;
  lastUpdated: string;
  logoConfig: VectorLogoConfig;
  frameConfig: SocialFrameConfig;
  catalogConfig: MenuCatalogConfig;
  promoConfig: PromoBannerConfig;
  isPromotedToCore: boolean;
  promotedAt?: string;
  notes?: string;
}

export interface ServerConfig {
  coreUrl: string;
  coreKey: string;
  ecosystemUrl: string;
  ecosystemKey: string;
  geminiKey: string;
}
