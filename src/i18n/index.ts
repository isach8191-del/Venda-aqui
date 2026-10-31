import { LanguageCode, LanguageInfo, TranslationSchema, CurrencyCode } from './types';
import { ptMZ } from './translations/pt-MZ';
import { ptPT } from './translations/pt-PT';
import { en } from './translations/en';
import { es } from './translations/es';
import { fr } from './translations/fr';
import { ar } from './translations/ar';
import { zh } from './translations/zh';
import { hi } from './translations/hi';
import { sw } from './translations/sw';
import { ru } from './translations/ru';
import { de } from './translations/de';

export * from './types';

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  {
    code: 'pt-MZ',
    name: 'Português (Moçambique)',
    nativeName: 'Português (Moçambique)',
    flag: '🇲🇿',
    isRTL: false,
    defaultCurrency: 'MZN',
    locale: 'pt-MZ',
  },
  {
    code: 'pt-PT',
    name: 'Português (Portugal)',
    nativeName: 'Português (Portugal)',
    flag: '🇵🇹',
    isRTL: false,
    defaultCurrency: 'EUR',
    locale: 'pt-PT',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    isRTL: false,
    defaultCurrency: 'USD',
    locale: 'en-US',
  },
  {
    code: 'es',
    name: 'Español',
    nativeName: 'Español',
    flag: '🇪🇸',
    isRTL: false,
    defaultCurrency: 'USD',
    locale: 'es-ES',
  },
  {
    code: 'fr',
    name: 'Français',
    nativeName: 'Français',
    flag: '🇫🇷',
    isRTL: false,
    defaultCurrency: 'EUR',
    locale: 'fr-FR',
  },
  {
    code: 'ar',
    name: 'العربية (Árabe)',
    nativeName: 'العربية',
    flag: '🇦🇪',
    isRTL: true,
    defaultCurrency: 'USD',
    locale: 'ar-AE',
  },
  {
    code: 'zh',
    name: '中文 (Chinês)',
    nativeName: '中文',
    flag: '🇨🇳',
    isRTL: false,
    defaultCurrency: 'CNY',
    locale: 'zh-CN',
  },
  {
    code: 'hi',
    name: 'हिन्दी (Hindi)',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    isRTL: false,
    defaultCurrency: 'INR',
    locale: 'hi-IN',
  },
  {
    code: 'sw',
    name: 'Kiswahili',
    nativeName: 'Kiswahili',
    flag: '🇹🇿',
    isRTL: false,
    defaultCurrency: 'KES',
    locale: 'sw-KE',
  },
  {
    code: 'ru',
    name: 'Русский (Russo)',
    nativeName: 'Русский',
    flag: '🇷🇺',
    isRTL: false,
    defaultCurrency: 'RUB',
    locale: 'ru-RU',
  },
  {
    code: 'de',
    name: 'Deutsch (Alemão)',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    isRTL: false,
    defaultCurrency: 'EUR',
    locale: 'de-DE',
  },
];

export const TRANSLATIONS: Record<LanguageCode, TranslationSchema> = {
  'pt-MZ': ptMZ,
  'pt-PT': ptPT,
  'en': en,
  'es': es,
  'fr': fr,
  'ar': ar,
  'zh': zh,
  'hi': hi,
  'sw': sw,
  'ru': ru,
  'de': de,
};

export const SUPPORTED_CURRENCIES: { code: CurrencyCode; symbol: string; name: string }[] = [
  { code: 'MZN', symbol: 'MT', name: 'MZN (Metical - Moçambique)' },
  { code: 'EUR', symbol: '€', name: 'EUR (€ - Euro)' },
  { code: 'USD', symbol: '$', name: 'USD ($ - Dólar Americano)' },
  { code: 'BRL', symbol: 'R$', name: 'BRL (R$ - Real Brasileiro)' },
  { code: 'ZAR', symbol: 'R', name: 'ZAR (R - Rand Sul-Africano)' },
  { code: 'KES', symbol: 'KSh', name: 'KES (KSh - Xelim Queniano)' },
  { code: 'CNY', symbol: '¥', name: 'CNY (¥ - Yuan Chinês)' },
  { code: 'INR', symbol: '₹', name: 'INR (₹ - Rúpia Indiana)' },
  { code: 'RUB', symbol: '₽', name: 'RUB (₽ - Rublo Russo)' },
  { code: 'GBP', symbol: '£', name: 'GBP (£ - Libra Esterlina)' },
  { code: 'AOA', symbol: 'Kz', name: 'AOA (Kz - Kwanza Angolano)' },
  { code: 'CVE', symbol: 'CVE', name: 'CVE (Escudo Cabo-verdiano)' },
];

export const POPULAR_COUNTRIES: { code: string; name: Record<string, string> }[] = [
  { code: 'MZ', name: { 'pt-MZ': 'Moçambique', 'pt-PT': 'Moçambique', en: 'Mozambique', es: 'Mozambique', fr: 'Mozambique', ar: 'موزمبيق', zh: '莫桑比克', hi: 'मोज़ाम्बिक', sw: 'Msumbiji', ru: 'Мозамбик', de: 'Mosambik' } },
  { code: 'PT', name: { 'pt-MZ': 'Portugal', 'pt-PT': 'Portugal', en: 'Portugal', es: 'Portugal', fr: 'Portugal', ar: 'البرتغال', zh: '葡萄牙', hi: 'पुर्तगाल', sw: 'Ureno', ru: 'Португалия', de: 'Portugal' } },
  { code: 'BR', name: { 'pt-MZ': 'Brasil', 'pt-PT': 'Brasil', en: 'Brazil', es: 'Brasil', fr: 'Brésil', ar: 'البرازيل', zh: '巴西', hi: 'ब्राज़ील', sw: 'Brazili', ru: 'Бразилия', de: 'Brasilien' } },
  { code: 'AO', name: { 'pt-MZ': 'Angola', 'pt-PT': 'Angola', en: 'Angola', es: 'Angola', fr: 'Angola', ar: 'أنغولا', zh: '安哥拉', hi: 'अंगोला', sw: 'Angola', ru: 'Ангола', de: 'Angola' } },
  { code: 'CV', name: { 'pt-MZ': 'Cabo Verde', 'pt-PT': 'Cabo Verde', en: 'Cape Verde', es: 'Cabo Verde', fr: 'Cap-Vert', ar: 'الرأس الأخضر', zh: '佛得角', hi: 'केप वर्डे', sw: 'Rasi ya Verde', ru: 'Кабо-Верде', de: 'Kap Verde' } },
  { code: 'ZA', name: { 'pt-MZ': 'África do Sul', 'pt-PT': 'África do Sul', en: 'South Africa', es: 'Sudáfrica', fr: 'Afrique du Sud', ar: 'جنوب أفريقيا', zh: '南非', hi: 'दक्षिण अफ्रीका', sw: 'Afrika Kusini', ru: 'ЮАР', de: 'Südafrika' } },
  { code: 'KE', name: { 'pt-MZ': 'Quénia', 'pt-PT': 'Quénia', en: 'Kenya', es: 'Kenia', fr: 'Kenya', ar: 'كينيا', zh: '肯尼亚', hi: 'केन्या', sw: 'Kenya', ru: 'Кения', de: 'Kenia' } },
  { code: 'US', name: { 'pt-MZ': 'Estados Unidos', 'pt-PT': 'Estados Unidos', en: 'United States', es: 'Estados Unidos', fr: 'États-Unis', ar: 'الولايات المتحدة', zh: '美国', hi: 'संयुक्त राज्य अमेरिका', sw: 'Marekani', ru: 'США', de: 'Vereinigte Staaten' } },
  { code: 'ES', name: { 'pt-MZ': 'Espanha', 'pt-PT': 'Espanha', en: 'Spain', es: 'España', fr: 'Espagne', ar: 'إسبانيا', zh: '西班牙', hi: 'स्पेन', sw: 'Hispania', ru: 'Испания', de: 'Spanien' } },
  { code: 'FR', name: { 'pt-MZ': 'França', 'pt-PT': 'França', en: 'France', es: 'Francia', fr: 'France', ar: 'فرنسا', zh: '法国', hi: 'फ़्रांस', sw: 'Ufaransa', ru: 'Франция', de: 'Frankreich' } },
  { code: 'DE', name: { 'pt-MZ': 'Alemanha', 'pt-PT': 'Alemanha', en: 'Germany', es: 'Alemania', fr: 'Allemagne', ar: 'ألمانيا', zh: '德国', hi: 'जर्मनी', sw: 'Ujerumani', ru: 'Германия', de: 'Deutschland' } },
  { code: 'CN', name: { 'pt-MZ': 'China', 'pt-PT': 'China', en: 'China', es: 'China', fr: 'Chine', ar: 'الصين', zh: '中国', hi: 'चीन', sw: 'China', ru: 'Китай', de: 'China' } },
  { code: 'IN', name: { 'pt-MZ': 'Índia', 'pt-PT': 'Índia', en: 'India', es: 'India', fr: 'Inde', ar: 'الهند', zh: '印度', hi: 'भारत', sw: 'Uhindi', ru: 'Индия', de: 'Indien' } },
  { code: 'RU', name: { 'pt-MZ': 'Rússia', 'pt-PT': 'Rússia', en: 'Russia', es: 'Rusia', fr: 'Russie', ar: 'روسيا', zh: '俄罗斯', hi: 'रूस', sw: 'Urusi', ru: 'Россия', de: 'Russland' } },
  { code: 'GB', name: { 'pt-MZ': 'Reino Unido', 'pt-PT': 'Reino Unido', en: 'United Kingdom', es: 'Reino Unido', fr: 'Royaume-Uni', ar: 'المملكة المتحدة', zh: '英国', hi: 'यूनाइटेड किंगडम', sw: 'Uingereza', ru: 'Великобритания', de: 'Vereinigtes Königreich' } },
];

export function getCountryName(countryCode: string, lang: LanguageCode): string {
  const match = POPULAR_COUNTRIES.find(c => c.code.toUpperCase() === countryCode.toUpperCase());
  if (match) {
    return match.name[lang] || match.name['en'] || countryCode;
  }
  return countryCode;
}

export function detectDeviceLanguage(): LanguageCode {
  if (typeof window === 'undefined' || !navigator) return 'en';

  const userLanguages = (navigator.languages && navigator.languages.length 
    ? Array.from(navigator.languages) 
    : [navigator.language || '']
  ).map(l => l.toLowerCase());

  for (const lang of userLanguages) {
    if (lang === 'pt-mz') return 'pt-MZ';
    if (lang.startsWith('pt')) return 'pt-MZ'; // Default PT locale
    if (lang.startsWith('es')) return 'es';
    if (lang.startsWith('fr')) return 'fr';
    if (lang.startsWith('ar')) return 'ar';
    if (lang.startsWith('zh')) return 'zh';
    if (lang.startsWith('hi')) return 'hi';
    if (lang.startsWith('sw')) return 'sw';
    if (lang.startsWith('ru')) return 'ru';
    if (lang.startsWith('de')) return 'de';
    if (lang.startsWith('en')) return 'en';
  }

  // Fallback to English as requested
  return 'en';
}

export function getTranslation(lang: LanguageCode): TranslationSchema {
  return TRANSLATIONS[lang] || TRANSLATIONS['en'];
}

export function getLanguageInfo(lang: LanguageCode): LanguageInfo {
  return SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0];
}

export function formatCurrency(amount: number, currency: CurrencyCode | string = 'MZN', lang: LanguageCode = 'pt-MZ'): string {
  const cleanAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const langInfo = getLanguageInfo(lang);
  const locale = langInfo.locale || 'pt-MZ';

  try {
    // Attempt standard Intl.NumberFormat
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
      maximumFractionDigits: cleanAmount % 1 === 0 ? 0 : 2,
      minimumFractionDigits: 0,
    }).format(cleanAmount);
  } catch {
    // Fallback if specific currency is not supported by browser's Intl
    const curObj = SUPPORTED_CURRENCIES.find(c => c.code.toUpperCase() === currency.toUpperCase());
    const symbol = curObj ? curObj.symbol : currency;
    const formattedNum = new Intl.NumberFormat(locale).format(cleanAmount);
    return `${symbol} ${formattedNum}`;
  }
}

export function formatDate(dateStr: string | number | Date, lang: LanguageCode = 'pt-MZ'): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return String(dateStr);
    const langInfo = getLanguageInfo(lang);
    return new Intl.DateTimeFormat(langInfo.locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return String(dateStr);
  }
}

export function formatRelativeTime(dateStr: string | number | Date, lang: LanguageCode = 'pt-MZ'): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    const langInfo = getLanguageInfo(lang);

    // Try relative time format if supported
    if (typeof Intl !== 'undefined' && Intl.RelativeTimeFormat) {
      const rtf = new Intl.RelativeTimeFormat(langInfo.locale, { numeric: 'auto' });
      if (diffSec < 60) return rtf.format(-Math.max(1, diffSec), 'second');
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return rtf.format(-diffMin, 'minute');
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return rtf.format(-diffHour, 'hour');
      const diffDay = Math.floor(diffHour / 24);
      if (diffDay < 30) return rtf.format(-diffDay, 'day');
      const diffMonth = Math.floor(diffDay / 30);
      if (diffMonth < 12) return rtf.format(-diffMonth, 'month');
      return rtf.format(-Math.floor(diffDay / 365), 'year');
    }

    return formatDate(date, lang);
  } catch {
    return formatDate(dateStr, lang);
  }
}
