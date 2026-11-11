import { LanguageCode } from './i18n';

// Global configuration constants for BHAROSA
export const USD_INR_RATE = 84.5; // $1 USD = ₹84.50 INR

export function formatInrFromUsd(usdAmount: number): string {
  const inr = Math.round((Number(usdAmount) || 0) * USD_INR_RATE);
  return `₹${inr.toLocaleString('en-IN')}`;
}

export function formatUsd(usdAmount: number): string {
  const val = Number(usdAmount) || 0;
  return Number.isInteger(val) ? `$${val}` : `$${val.toFixed(2)}`;
}

export interface JobTemplate {
  id: 'logo' | 'reel' | 'website' | 'content' | 'ppt';
  label: {
    en: string;
    hi: string;
    hinglish: string;
  };
  defaultTextByLang: {
    en: string;
    hi: string;
    hinglish: string;
  };
  defaultText: string;
  defaultAmountUsd: number;
  fallbackChecklist: string[];
  fallbackChecklistByLang: {
    en: string[];
    hi: string[];
    hinglish: string[];
  };
}

export const JOB_TEMPLATES: JobTemplate[] = [
  {
    id: 'logo',
    label: {
      en: 'Logo',
      hi: 'लोगो डिज़ाइन',
      hinglish: 'Logo design',
    },
    defaultText:
      'Logo design for a college fest, 3 logo concepts, PNG + SVG, 2 revisions',
    defaultTextByLang: {
      en: 'Logo design for a college fest, 3 logo concepts, PNG + SVG, 2 revisions',
      hi: 'कॉलेज फेस्ट के लिए लोगो डिज़ाइन, 3 लोगो कॉन्सेप्ट, PNG और SVG फ़ाइलें, 2 रिवीजन',
      hinglish:
        'College fest ke liye logo design, 3 logo concepts, PNG aur SVG files, 2 revisions',
    },
    defaultAmountUsd: 200,
    fallbackChecklist: ['3 logo concepts', 'PNG and SVG files', '2 revisions'],
    fallbackChecklistByLang: {
      en: ['3 logo concepts', 'PNG and SVG files', '2 revisions'],
      hi: ['3 लोगो कॉन्सेप्ट', 'PNG और SVG फ़ाइलें', '2 रिवीजन'],
      hinglish: ['3 logo concepts', 'PNG aur SVG files', '2 revisions'],
    },
  },
  {
    id: 'reel',
    label: {
      en: 'Reel/Video edit',
      hi: 'रील / वीडियो एडिट',
      hinglish: 'Reel / Video edit',
    },
    defaultText:
      '3 Instagram Reels (60 sec each), 1080x1920 MP4, captions + color grading, 1 revision',
    defaultTextByLang: {
      en: '3 Instagram Reels (60 sec each), 1080x1920 MP4, captions + color grading, 1 revision',
      hi: '3 इंस्टाग्राम रील्स (60 सेकंड प्रत्येक), 1080x1920 MP4, कैप्शन और कलर ग्रेडिंग, 1 रिवीजन',
      hinglish:
        '3 Instagram Reels (60 sec har ek), 1080x1920 MP4, captions aur color grading, 1 revision',
    },
    defaultAmountUsd: 150,
    fallbackChecklist: [
      'Final video in MP4',
      'Under 60 seconds',
      'Captions added',
    ],
    fallbackChecklistByLang: {
      en: ['Final video in MP4', 'Under 60 seconds', 'Captions added'],
      hi: ['MP4 में अंतिम वीडियो', '60 सेकंड से कम अवधि', 'कैप्शन जोड़े गए'],
      hinglish: ['Final video MP4 mein', '60 seconds ke andar', 'Captions added'],
    },
  },
  {
    id: 'website',
    label: {
      en: 'Website',
      hi: 'वेबसाइट',
      hinglish: 'Website',
    },
    defaultText:
      '5-page responsive landing website, mobile friendly, contact form + source code link',
    defaultTextByLang: {
      en: '5-page responsive landing website, mobile friendly, contact form + source code link',
      hi: '5-पेज की रिस्पॉन्सिव वेबसाइट, मोबाइल फ्रेंडली, कॉन्टैक्ट फॉर्म और सोर्स कोड लिंक',
      hinglish:
        '5-page responsive website, mobile friendly, contact form aur source code link',
    },
    defaultAmountUsd: 500,
    fallbackChecklist: [
      'Responsive on mobile',
      '3 pages',
      'Contact form works',
    ],
    fallbackChecklistByLang: {
      en: ['Responsive on mobile', '3 pages', 'Contact form works'],
      hi: ['मोबाइल पर रिस्पॉन्सिव', '3 पेज पूरे', 'कॉन्टैक्ट फॉर्म काम करता है'],
      hinglish: ['Mobile par responsive', '3 pages pure', 'Contact form kaam karta hai'],
    },
  },
  {
    id: 'content',
    label: {
      en: 'Content writing',
      hi: 'कंटेंट लेखन',
      hinglish: 'Content writing',
    },
    defaultText:
      '4 SEO blog articles (1,500 words each) in DOCX/PDF format, original copy, 1 revision',
    defaultTextByLang: {
      en: '4 SEO blog articles (1,500 words each) in DOCX/PDF format, original copy, 1 revision',
      hi: '4 SEO ब्लॉग लेख (1,500 शब्द प्रत्येक) DOCX/PDF फ़ॉर्मेट में, मौलिक लेखन, 1 रिवीजन',
      hinglish:
        '4 SEO blog articles (1,500 words har ek) DOCX/PDF format mein, original copy, 1 revision',
    },
    defaultAmountUsd: 120,
    fallbackChecklist: ['Word count met', 'No plagiarism', '1 revision'],
    fallbackChecklistByLang: {
      en: ['Word count met', 'No plagiarism', '1 revision'],
      hi: ['शब्द संख्या पूरी', 'कोई कॉपी-पेस्ट नहीं', '1 रिवीजन'],
      hinglish: ['Word count pura hai', 'Koi plagiarism nahi', '1 revision'],
    },
  },
  {
    id: 'ppt',
    label: {
      en: 'PPT/Assignment',
      hi: 'पीपीटी / असाइनमेंट',
      hinglish: 'PPT / Assignment',
    },
    defaultText:
      '15-slide investor pitch deck in PPTX + PDF export with clean charts and speaker notes',
    defaultTextByLang: {
      en: '15-slide investor pitch deck in PPTX + PDF export with clean charts and speaker notes',
      hi: '15-स्लाइड की प्रेजेंटेशन PPTX और PDF में, साफ़ चार्ट और स्पीकर नोट्स के साथ',
      hinglish:
        '15-slide pitch deck PPTX aur PDF mein, clean charts aur speaker notes ke saath',
    },
    defaultAmountUsd: 100,
    fallbackChecklist: ['Slide count met', 'Clean layout', 'Speaker notes'],
    fallbackChecklistByLang: {
      en: ['Slide count met', 'Clean layout', 'Speaker notes'],
      hi: ['स्लाइड संख्या पूरी', 'साफ़ लेआउट', 'स्पीकर नोट्स शामिल'],
      hinglish: ['Slide count pura hai', 'Clean layout', 'Speaker notes added'],
    },
  },
];

export function getFallbackChecklistForTemplate(
  templateId?: string,
  brief?: string,
  lang: LanguageCode = 'en'
): Array<{ text: string; isSubjective: boolean }> {
  const safeLang: LanguageCode =
    lang === 'hi' || lang === 'hinglish' ? lang : 'en';

  const pickList = (tpl: JobTemplate) =>
    (tpl.fallbackChecklistByLang[safeLang] || tpl.fallbackChecklistByLang.en).map(
      (text) => ({
        text,
        isSubjective: false,
      })
    );

  const byId = JOB_TEMPLATES.find((t) => t.id === templateId);
  if (byId) {
    return pickList(byId);
  }

  const lower = String(brief || '').toLowerCase();
  if (lower.includes('reel') || lower.includes('video') || lower.includes('mp4')) {
    return pickList(JOB_TEMPLATES[1]);
  }
  if (lower.includes('website') || lower.includes('landing') || lower.includes('page')) {
    return pickList(JOB_TEMPLATES[2]);
  }
  if (
    lower.includes('write') ||
    lower.includes('writing') ||
    lower.includes('blog') ||
    lower.includes('article') ||
    lower.includes('content')
  ) {
    return pickList(JOB_TEMPLATES[3]);
  }
  if (
    lower.includes('ppt') ||
    lower.includes('slide') ||
    lower.includes('deck') ||
    lower.includes('presentation')
  ) {
    return pickList(JOB_TEMPLATES[4]);
  }

  return pickList(JOB_TEMPLATES[0]);
}
