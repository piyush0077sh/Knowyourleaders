import en from '../data/locales.en.json';
import hi from '../data/locales.hi.json';
import ta from '../data/locales.ta.json';

const translations: Record<string, any> = { en, hi, ta };

export function translate(key: string, locale: string = 'en', replaceParams?: Record<string, string>): string {
  const dict = translations[locale] || translations['en'];
  const keys = key.split('.');
  
  let current: any = dict;
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      // Fallback to English
      let fallback: any = translations['en'];
      for (const fk of keys) {
        if (fallback && typeof fallback === 'object' && fk in fallback) {
          fallback = fallback[fk];
        } else {
          fallback = undefined;
          break;
        }
      }
      current = fallback;
      break;
    }
  }

  if (typeof current !== 'string') {
    return key;
  }

  let text = current;
  if (replaceParams) {
    for (const [pKey, pVal] of Object.entries(replaceParams)) {
      // Replaces both {{param}} and {param} formats
      text = text.replace(new RegExp(`{+${pKey}}+`, 'g'), pVal);
    }
  }

  return text;
}
