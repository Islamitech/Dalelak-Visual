import jsPDF from 'jspdf';
import { 
  SocialFrameConfig, 
  MenuCatalogConfig, 
  PromoBannerConfig, 
  VectorLogoConfig 
} from '../types';
import { generateVectorLogoSvg } from './vectorLogoPresets';

/**
 * Loads an image from URL or DataURL into an HTMLImageElement
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Renders the Social Media Post with Frame on an HTML Canvas
 */
export async function renderSocialFrameToCanvas(
  canvas: HTMLCanvasElement,
  frameConfig: SocialFrameConfig,
  logoConfig: VectorLogoConfig,
  businessName: string
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Determine canvas resolution based on format
  let width = 1080;
  let height = 1080;
  if (frameConfig.format === 'story') {
    width = 1080;
    height = 1920;
  } else if (frameConfig.format === 'landscape') {
    width = 1200;
    height = 675;
  }

  canvas.width = width;
  canvas.height = height;

  // 1. Draw Background
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, width, height);

  // 2. Draw Product / Storefront Image if available
  if (frameConfig.productImage) {
    try {
      const prodImg = await loadImage(frameConfig.productImage);
      
      const zoom = frameConfig.productImageZoom || 1;
      const offsetX = frameConfig.productImageOffset?.x || 0;
      const offsetY = frameConfig.productImageOffset?.y || 0;

      // Cover scaling
      const imgRatio = prodImg.width / prodImg.height;
      const canvasRatio = width / height;
      let drawW = width * zoom;
      let drawH = height * zoom;

      if (imgRatio > canvasRatio) {
        drawW = drawH * imgRatio;
      } else {
        drawH = drawW / imgRatio;
      }

      const drawX = (width - drawW) / 2 + offsetX;
      const drawY = (height - drawH) / 2 + offsetY;

      ctx.save();
      // Clip within a rounded inner frame if style demands
      if (frameConfig.frameStyle === 'luxury_gold' || frameConfig.frameStyle === 'baladi_fresh') {
        ctx.beginPath();
        ctx.roundRect(28, 28, width - 56, height - 56, 32);
        ctx.clip();
      }
      ctx.drawImage(prodImg, drawX, drawY, drawW, drawH);
      ctx.restore();
    } catch (e) {
      console.warn('Failed to load product image for canvas:', e);
    }
  } else {
    // Beautiful placeholder gradient if no photo yet
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#f1f5f9');
    grad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#64748b';
    ctx.font = '600 28px "Tajawal", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('قم بإدراج صورة المنتج أو النشاط هنا لمعاينتها داخل البرواز', width / 2, height / 2);
  }

  // 3. Vignette / Dark gradient overlay for text readability
  const bottomGrad = ctx.createLinearGradient(0, height * 0.55, 0, height);
  bottomGrad.addColorStop(0, 'rgba(0,0,0,0)');
  bottomGrad.addColorStop(0.5, 'rgba(0,0,0,0.4)');
  bottomGrad.addColorStop(1, 'rgba(0,0,0,0.88)');
  ctx.fillStyle = bottomGrad;
  ctx.fillRect(0, height * 0.55, width, height * 0.45);

  const topGrad = ctx.createLinearGradient(0, 0, 0, height * 0.3);
  topGrad.addColorStop(0, 'rgba(0,0,0,0.7)');
  topGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, width, height * 0.3);

  // 4. Draw Frame Style Elements
  drawFrameOverlays(ctx, width, height, frameConfig);

  // 5. Draw Top Header Bar & Logo
  if (frameConfig.showLogo) {
    await drawCanvasLogo(ctx, width, height, logoConfig, businessName, frameConfig.logoPlacement);
  }

  // 6. Draw Promotional Badge
  if (frameConfig.badgeType !== 'none' && frameConfig.badgeText) {
    drawPromoBadge(ctx, width, height, frameConfig.badgeText, frameConfig.accentColor || '#f59e0b');
  }

  // 7. Draw Headlines
  if (frameConfig.headline || frameConfig.subheadline) {
    ctx.save();
    ctx.textAlign = 'right';
    ctx.direction = 'rtl';

    if (frameConfig.headline) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 44px "Cairo", sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;
      ctx.fillText(frameConfig.headline, width - 60, height - 160);
    }

    if (frameConfig.subheadline) {
      ctx.fillStyle = '#fef08a'; // Bright yellow
      ctx.font = '600 28px "Tajawal", sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 8;
      ctx.fillText(frameConfig.subheadline, width - 60, height - 115);
    }
    ctx.restore();
  }

  // 8. Draw Contact Bar & Dalilak Verified Badge
  if (frameConfig.showContactBar) {
    drawBottomContactBar(ctx, width, height, frameConfig);
  }
}

/**
 * Draws frame borders and artistic elements
 */
function drawFrameOverlays(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: SocialFrameConfig
) {
  ctx.save();

  if (config.frameStyle === 'luxury_gold') {
    // Outer Gold Border
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 14;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Inner Delicate Line
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3;
    ctx.strokeRect(34, 34, width - 68, height - 68);

    // Corner Ornaments
    drawCornerFlourish(ctx, 40, 40, 40);
    drawCornerFlourish(ctx, width - 40, 40, 40);
    drawCornerFlourish(ctx, 40, height - 40, 40);
    drawCornerFlourish(ctx, width - 40, height - 40, 40);
  } else if (config.frameStyle === 'baladi_fresh') {
    // Warm Red & Amber Border
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 18;
    ctx.strokeRect(18, 18, width - 36, height - 36);

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 5;
    ctx.strokeRect(32, 32, width - 64, height - 64);
  } else if (config.frameStyle === 'vibrant_neon') {
    // Neon glow frame
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 12;
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 20;
    ctx.strokeRect(24, 24, width - 48, height - 48);
  } else if (config.frameStyle === 'clean_minimal') {
    // Simple crisp white border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 20;
    ctx.strokeRect(20, 20, width - 40, height - 40);
  }

  ctx.restore();
}

function drawCornerFlourish(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draws the vector logo onto canvas
 */
async function drawCanvasLogo(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  logoConfig: VectorLogoConfig,
  businessName: string,
  placement: string
) {
  try {
    let logoImg: HTMLImageElement;
    let cleanupUrl: string | null = null;

    if (logoConfig.aiGeneratedImageUrl) {
      logoImg = await loadImage(logoConfig.aiGeneratedImageUrl);
    } else {
      const svgStr = generateVectorLogoSvg(logoConfig, 220);
      const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      cleanupUrl = URL.createObjectURL(svgBlob);
      logoImg = await loadImage(cleanupUrl);
    }

    let x = width - 210;
    let y = 45;

    if (placement === 'top_left') {
      x = 55;
      y = 45;
    } else if (placement === 'top_center') {
      x = (width - 175) / 2;
      y = 45;
    }

    // Pill container for logo clarity
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.roundRect(x - 10, y - 8, 185, 84, 18);
    ctx.fill();

    // Draw logo image with rounded corners
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, 68, 68, 12);
    ctx.clip();
    ctx.drawImage(logoImg, x, y, 68, 68);
    ctx.restore();

    ctx.fillStyle = '#0f172a';
    ctx.font = '800 18px "Cairo", sans-serif';
    ctx.textAlign = 'right';
    ctx.direction = 'rtl';
    const shortName = businessName.length > 14 ? businessName.slice(0, 13) + '..' : businessName;
    ctx.fillText(shortName, x + 168, y + 42);

    ctx.restore();
    if (cleanupUrl) URL.revokeObjectURL(cleanupUrl);
  } catch (e) {
    console.warn('Failed to render logo to canvas:', e);
  }
}

/**
 * Draws promotional badge like "عرض خاص" or "خصم 25%"
 */
function drawPromoBadge(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  bgColor: string
) {
  ctx.save();
  ctx.translate(65, 75);

  ctx.fillStyle = bgColor;
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;

  ctx.beginPath();
  ctx.roundRect(0, 0, 210, 52, 26);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.font = '900 22px "Cairo", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, 105, 34);

  ctx.restore();
}

/**
 * Draws bottom contact bar with WhatsApp & Dalilak Verified stamp
 */
function drawBottomContactBar(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: SocialFrameConfig
) {
  ctx.save();

  const barHeight = 65;
  const barY = height - barHeight - 28;

  // Glassmorphic / Solid bar container
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 4;

  ctx.beginPath();
  ctx.roundRect(40, barY, width - 80, barHeight, 18);
  ctx.fill();

  // Contact text (WhatsApp & Phone)
  ctx.fillStyle = '#0f172a';
  ctx.font = '700 22px "Outfit", "Cairo", sans-serif';
  ctx.textAlign = 'right';
  ctx.direction = 'rtl';

  const contactStr = config.whatsappNumber ? `واتساب: ${config.whatsappNumber}` : (config.phoneNumber || '');
  ctx.fillText(contactStr, width - 75, barY + 41);

  // Dalilak Official Badge on the other side
  if (config.showDalilakVerifiedBadge) {
    ctx.textAlign = 'left';
    ctx.direction = 'ltr';

    // Badge pill
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(60, barY + 12, 170, 40, 10);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 16px "Cairo", sans-serif';
    ctx.fillText('دليلك • نشاط موثق ✔', 75, barY + 38);
  }

  ctx.restore();
}

/**
 * Renders the Menu / Catalog to Canvas for High-Resolution Export
 */
export async function renderMenuCatalogToCanvas(
  canvas: HTMLCanvasElement,
  catalog: MenuCatalogConfig,
  logoConfig: VectorLogoConfig,
  businessName: string
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = 1240; // A4 proportional width at ~150DPI
  const height = 1754; // A4 proportional height

  canvas.width = width;
  canvas.height = height;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Decorative border
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 8;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  // Header Banner
  const headerGrad = ctx.createLinearGradient(0, 30, 0, 260);
  headerGrad.addColorStop(0, catalog.primaryColor || '#0f172a');
  headerGrad.addColorStop(1, '#1e293b');
  ctx.fillStyle = headerGrad;
  ctx.fillRect(34, 34, width - 68, 220);

  // Header Title & Slogan
  ctx.save();
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 48px "Cairo", sans-serif';
  ctx.fillText(businessName, width / 2, 120);

  ctx.fillStyle = catalog.accentColor || '#fbbf24';
  ctx.font = '700 26px "Tajawal", sans-serif';
  ctx.fillText(catalog.title || 'قائمة الأسعار والخدمات المعتمدة', width / 2, 175);

  if (catalog.subtitle) {
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 20px "Tajawal", sans-serif';
    ctx.fillText(catalog.subtitle, width / 2, 215);
  }
  ctx.restore();

  // Draw Items in Two Columns
  const startY = 320;
  const colWidth = (width - 160) / 2;
  const leftColX = 80;
  const rightColX = 80 + colWidth + 40;

  let currYRight = startY;
  let currYLeft = startY;

  ctx.direction = 'rtl';

  catalog.items.forEach((item, idx) => {
    // Distribute into 2 columns
    const isRight = idx % 2 === 0;
    const x = isRight ? rightColX : leftColX;
    let y = isRight ? currYRight : currYLeft;

    // Item card background
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, colWidth, 110, 14);
    ctx.fill();
    ctx.stroke();

    // Item Name
    ctx.textAlign = 'right';
    ctx.fillStyle = '#0f172a';
    ctx.font = '800 24px "Cairo", sans-serif';
    ctx.fillText(item.name, x + colWidth - 20, y + 42, colWidth - 140);

    // Item Description
    ctx.fillStyle = '#64748b';
    ctx.font = '500 16px "Tajawal", sans-serif';
    ctx.fillText(item.description || '', x + colWidth - 20, y + 74, colWidth - 50);

    // Price Tag
    if (catalog.showPrices && item.price) {
      ctx.textAlign = 'left';
      ctx.fillStyle = catalog.primaryColor || '#0284c7';
      ctx.font = '900 26px "Outfit", sans-serif';
      ctx.fillText(`${item.price} ${catalog.currency || 'ج.م'}`, x + 20, y + 46);

      if (item.unit) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 15px "Tajawal", sans-serif';
        ctx.fillText(`/ ${item.unit}`, x + 20, y + 74);
      }
    }

    // Badge if present
    if (item.badge) {
      ctx.save();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.roundRect(x + 16, y + 14, 85, 24, 6);
      ctx.fill();

      ctx.fillStyle = '#854d0e';
      ctx.font = '700 13px "Cairo", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.badge, x + 58, y + 31);
      ctx.restore();
    }

    if (isRight) {
      currYRight += 130;
    } else {
      currYLeft += 130;
    }
  });

  // Footer
  const footerY = height - 120;
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(34, footerY, width - 68, 86);

  ctx.textAlign = 'center';
  ctx.direction = 'rtl';
  ctx.fillStyle = '#475569';
  ctx.font = '600 20px "Tajawal", sans-serif';
  ctx.fillText(catalog.footerNote || 'الأسعار شاملة ومحدثة وفق معايير الجودة • منصة دليلك المعتمدة', width / 2, footerY + 52);
}

/**
 * Downloads Canvas content as high-resolution PNG
 */
export function exportCanvasAsPng(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
}

/**
 * Downloads Canvas content as print-ready PDF using jsPDF
 */
export function exportCanvasAsPdf(canvas: HTMLCanvasElement, filename: string): void {
  const isPortrait = canvas.height >= canvas.width;
  const pdf = new jsPDF({
    orientation: isPortrait ? 'portrait' : 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(`${filename}.pdf`);
}
