import { VectorLogoConfig, LogoShapeContainer } from '../types';

export interface LogoColorPalette {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
}

export const LOGO_COLOR_PALETTES: LogoColorPalette[] = [
  { id: 'gold-royal', name: 'الملكي الذهبي (فخامة ومجوهرات)', primary: '#0f172a', secondary: '#b45309', accent: '#f59e0b', text: '#0f172a' },
  { id: 'fire-grill', name: 'النار والمشويات (مطاعم وحاتي)', primary: '#881337', secondary: '#e11d48', accent: '#f59e0b', text: '#881337' },
  { id: 'coffee-roast', name: 'البن والتحميص (كافيه ومزاج)', primary: '#381c0c', secondary: '#78350f', accent: '#d97706', text: '#381c0c' },
  { id: 'emerald-trust', name: 'الزمرد الأخضر (طبيعي وصيدليات)', primary: '#064e3b', secondary: '#059669', accent: '#34d399', text: '#064e3b' },
  { id: 'ocean-tech', name: 'الأزرق المؤسسي (خدمات وتقنية)', primary: '#0f172a', secondary: '#0284c7', accent: '#38bdf8', text: '#0f172a' },
  { id: 'violet-luxury', name: 'البنفسجي الراقي (صالونات وأزياء)', primary: '#3b0764', secondary: '#7e22ce', accent: '#c084fc', text: '#3b0764' },
  { id: 'sunset-orange', name: 'البرتقالي النابض (وجبات وتوصيل)', primary: '#7c2d12', secondary: '#ea580c', accent: '#fbbf24', text: '#7c2d12' },
  { id: 'steel-industrial', name: 'الرمادي الصناعي (ورش وصيانة)', primary: '#18181b', secondary: '#52525b', accent: '#3b82f6', text: '#18181b' }
];

export interface IconPreset {
  id: string;
  name: string;
  category: string;
  svgPath: string;
}

export const VECTOR_ICONS: IconPreset[] = [
  {
    id: 'Store',
    name: 'متجر ومحل',
    category: 'عام',
    svgPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10'
  },
  {
    id: 'Utensils',
    name: 'شوك وسكين',
    category: 'مطاعم',
    svgPath: 'M18 2v20 M14 2c0 3 2 5 2 7v13 M3 2v7c0 2 2 4 4 4v9 M7 2v7'
  },
  {
    id: 'ChefHat',
    name: 'قبعة شيف',
    category: 'مطاعم',
    svgPath: 'M6 13.8a4.5 4.5 0 1 1 2.6-7.8A5 5 0 0 1 18 8a4.5 4.5 0 1 1 0 5.8H6z M6 17h12v4H6z'
  },
  {
    id: 'Flame',
    name: 'شعلة وفحم',
    category: 'مطاعم',
    svgPath: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z'
  },
  {
    id: 'Coffee',
    name: 'فنجان قهوة',
    category: 'كافيهات',
    svgPath: 'M17 8h1a4 4 0 1 1 0 8h-1 M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z M6 2v2 M10 2v2 M14 2v2'
  },
  {
    id: 'Gem',
    name: 'جوهرة وألماس',
    category: 'مجوهرات',
    svgPath: 'M6 3h12l4 6-10 12L2 9z M2 9h20 M12 21L8 9l4-6 4 6z'
  },
  {
    id: 'Crown',
    name: 'تاج ملكي',
    category: 'مجوهرات',
    svgPath: 'M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5z'
  },
  {
    id: 'Pill',
    name: 'كبسولة دواء',
    category: 'صيدليات',
    svgPath: 'M10.5 20.5l10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z M8.5 8.5l7 7'
  },
  {
    id: 'Scissors',
    name: 'مقص حلاقة',
    category: 'صالونات',
    svgPath: 'M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm14-2.5L8.7 10 M8.7 14L20 5.5'
  },
  {
    id: 'ShoppingBag',
    name: 'حقيبة تسوق',
    category: 'ملابس',
    svgPath: 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0'
  },
  {
    id: 'Sparkles',
    name: 'بريق ولمعان',
    category: 'عام',
    svgPath: 'M12 2l2.4 7.2L21 12l-6.6 2.8L12 22l-2.4-7.2L3 12l6.6-2.8z'
  },
  {
    id: 'Car',
    name: 'سيارة ومحركات',
    category: 'سيارات',
    svgPath: 'M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11 2 11.2 2 11.5V16c0 .6.4 1 1 1h2 M7 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'
  },
  {
    id: 'Wrench',
    name: 'مفتاح صيانة',
    category: 'خدمات',
    svgPath: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z'
  },
  {
    id: 'HeartHandshake',
    name: 'ثقة وأمانة',
    category: 'عام',
    svgPath: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'
  }
];

/**
 * Returns SVG container geometry
 */
export function getContainerShapeMarkup(shape: LogoShapeContainer, color: string, accentColor: string): string {
  switch (shape) {
    case 'circle':
      return `
        <circle cx="150" cy="150" r="136" fill="none" stroke="${color}" stroke-width="6" />
        <circle cx="150" cy="150" r="126" fill="none" stroke="${accentColor}" stroke-width="2" stroke-dasharray="6,4" />
      `;
    case 'shield':
      return `
        <path d="M150 16 L254 56 C254 170 150 256 150 280 C150 256 46 170 46 56 Z" fill="none" stroke="${color}" stroke-width="7" stroke-linejoin="round" />
        <path d="M150 28 L240 64 C240 162 150 240 150 262 C150 240 60 162 60 64 Z" fill="none" stroke="${accentColor}" stroke-width="2.5" stroke-dasharray="8,5" />
      `;
    case 'hexagon':
      return `
        <polygon points="150,18 266,82 266,218 150,282 34,218 34,82" fill="none" stroke="${color}" stroke-width="6" stroke-linejoin="round" />
        <polygon points="150,30 252,88 252,212 150,270 48,212 48,88" fill="none" stroke="${accentColor}" stroke-width="2" />
      `;
    case 'luxury_crest':
      return `
        <circle cx="150" cy="150" r="132" fill="none" stroke="${color}" stroke-width="5" />
        <circle cx="150" cy="150" r="122" fill="none" stroke="${accentColor}" stroke-width="3" />
        <!-- Laurel Leaves / Crest Top -->
        <path d="M130 36 C136 28 144 26 150 26 C156 26 164 28 170 36" fill="none" stroke="${accentColor}" stroke-width="3" />
        <path d="M120 46 C130 38 140 36 150 36 C160 36 170 38 180 46" fill="none" stroke="${accentColor}" stroke-width="2.5" />
        <!-- Stars -->
        <polygon points="150,18 153,24 160,24 154,28 156,34 150,30 144,34 146,28 140,24 147,24" fill="${accentColor}" />
      `;
    case 'modern_badge':
      return `
        <rect x="26" y="26" width="248" height="248" rx="42" fill="none" stroke="${color}" stroke-width="7" />
        <rect x="36" y="36" width="228" height="228" rx="34" fill="none" stroke="${accentColor}" stroke-width="2" stroke-dasharray="8,6" />
      `;
    case 'minimal_ring':
      return `
        <circle cx="150" cy="150" r="134" fill="none" stroke="${color}" stroke-width="4" />
      `;
    case 'none':
    default:
      return '';
  }
}

/**
 * Generates pure standalone scalable SVG vector logo string
 */
export function generateVectorLogoSvg(config: VectorLogoConfig, size = 500): string {
  const icon = VECTOR_ICONS.find((i) => i.id === config.iconName) || VECTOR_ICONS[0];
  const container = getContainerShapeMarkup(config.shapeContainer, config.primaryColor, config.accentColor);

  const fontFamily = config.fontFamily || 'Cairo';
  const hasContainer = config.shapeContainer !== 'none';

  // Determine icon size and text positions based on layout
  let iconTransform = 'translate(110, 60) scale(3.3)';
  let titleY = hasContainer ? 195 : 220;
  let subY = titleY + 28;
  let englishY = subY + 24;

  if (config.layout === 'horizontal') {
    iconTransform = 'translate(40, 110) scale(3.2)';
    titleY = 140;
    subY = 175;
    englishY = 205;
  } else if (config.layout === 'icon_center') {
    iconTransform = 'translate(105, 80) scale(3.8)';
    titleY = 230;
    subY = 262;
    englishY = 285;
  }

  const englishMarkup = config.showEnglishName && config.englishName ? `
    <text x="150" y="${englishY}" text-anchor="middle" font-family="'Outfit', sans-serif" font-weight="700" font-size="11" letter-spacing="3" fill="${config.secondaryColor}">
      ${escapeXml(config.englishName.toUpperCase())}
    </text>
  ` : '';

  const sloganMarkup = config.showSlogan && config.slogan ? `
    <text x="150" y="${subY}" text-anchor="middle" font-family="'Tajawal', sans-serif" font-weight="500" font-size="13" fill="${config.accentColor}">
      ${escapeXml(config.slogan)}
    </text>
  ` : '';

  const estMarkup = config.showEstablishedYear && config.establishedYear ? `
    <g transform="translate(150, 48)">
      <line x1="-40" y1="0" x2="-14" y2="0" stroke="${config.accentColor}" stroke-width="1.5" />
      <text x="0" y="4" text-anchor="middle" font-family="'Cairo', sans-serif" font-weight="700" font-size="11" fill="${config.secondaryColor}">
        منذ ${escapeXml(config.establishedYear)}
      </text>
      <line x1="14" y1="0" x2="40" y2="0" stroke="${config.accentColor}" stroke-width="1.5" />
    </g>
  ` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="${size}" height="${size}" dir="rtl">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@700;800;900&amp;family=Tajawal:wght@500;700;800&amp;family=Aref+Ruqaa:wght@700&amp;family=Amiri:wght@700&amp;family=Outfit:wght@600;800&amp;display=swap');
      .logo-title { font-family: '${fontFamily}', 'Cairo', sans-serif; font-weight: 800; }
    </style>
  </defs>

  <!-- Container Frame -->
  ${container}

  <!-- Established Year -->
  ${estMarkup}

  <!-- Vector Icon -->
  <g transform="${iconTransform}" stroke="${config.primaryColor}" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="${icon.svgPath}" />
  </g>

  <!-- Business Name (Arabic) -->
  <text x="150" y="${titleY}" text-anchor="middle" class="logo-title" font-size="22" fill="${config.textColor || config.primaryColor}">
    ${escapeXml(config.businessName)}
  </text>

  <!-- Slogan -->
  ${sloganMarkup}

  <!-- English Subtitle -->
  ${englishMarkup}
</svg>`;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
