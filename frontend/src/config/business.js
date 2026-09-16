/**
 * Central business details.
 *
 * ⚠️  TODO — before launch, replace every value marked PLACEHOLDER with the real
 * details supplied by the client (see docs/specs/01-overview-and-stack.md §1 and
 * docs/specs/14-build-order-and-open-questions.md §20 questions 1 & 4).
 *
 * These values feed the TopBar, Footer, contact page, legal pages and the
 * floating contact button — changing them here updates the whole site.
 */
const business = {
  /** Trading name shown in the header/footer */
  name: 'פארך',
  tagline: 'תשמישי קדושה',

  /** PLACEHOLDER — full legal registered name, required by the Consumer Protection Law */
  legalName: 'פארך — תשמישי קדושה',

  /**
   * PLACEHOLDER — company / licensed-dealer registration number.
   * Leave empty until confirmed: the footer hides the line when it is empty
   * rather than showing a made-up number.
   */
  businessId: '',

  /** PLACEHOLDER — customer service phone (spec §1) */
  phone: '1-800-707-707',
  /** Digits only, used for the tel: link */
  phoneDial: '1800707707',

  /** PLACEHOLDER — customer service email */
  email: 'info@parech.co.il',

  /**
   * PLACEHOLDER — WhatsApp number in international format, digits only
   * (e.g. '972501234567'). While empty, the floating button links to the
   * contact page instead of producing a dead wa.me link.
   */
  whatsapp: '',

  /** PLACEHOLDER — registered business address */
  address: {
    street: 'רחוב הרב קוק 12',
    city: 'ירושלים',
    zip: '9422012',
  },

  /** PLACEHOLDER — customer service opening hours */
  hours: [
    { days: 'ראשון–חמישי', time: '09:00 – 18:00' },
    { days: 'שישי וערבי חג', time: '09:00 – 13:00' },
    { days: 'שבת וחג', time: 'סגור' },
  ],

  /** Date of the last accessibility review, shown on /accessibility-statement */
  accessibilityReviewDate: '31.08.2026',
};

export const fullAddress = `${business.address.street}, ${business.address.city} ${business.address.zip}`;

export const whatsappUrl = business.whatsapp
  ? `https://wa.me/${business.whatsapp}`
  : null;

export default business;
