/**
 * Demo catalogue — categories, sub-categories and products used to populate a
 * showcase database so the site can be reviewed with real-looking content.
 *
 * Consumed by:
 *   - `npm run seed:images`   → generates the product/category artwork
 *   - `npm run seed:catalog`  → upserts categories, products, reviews & coupons
 *
 * `art` picks the illustration template used for the generated image, and
 * `palette` tints it. Replace the generated SVGs with the client's real
 * photography once it is available — the file names stay the same.
 */

export const categories = [
  { name: 'ציצית', slug: 'tzitzit', order: 1, art: 'tzitzit' },
  { name: 'טליתות', slug: 'prayer-shawls', order: 2, art: 'tallit' },
  { name: 'תפילין', slug: 'tefillin', order: 3, art: 'tefillin' },
  { name: 'מזוזות', slug: 'mezuzot', order: 4, art: 'mezuzah' },
  { name: 'מתנות', slug: 'general', order: 5, art: 'gift' },
  { name: 'שבת', slug: 'shabbat', order: 6, art: 'candles' },
  { name: 'כיפות', slug: 'kippot', order: 7, art: 'kippah' },
  { name: 'פתילים', slug: 'wicks', order: 8, art: 'wick' },
  { name: 'נרתיקים', slug: 'talit-tefillin-covers', order: 9, art: 'pouch' },
  { name: 'סידורים', slug: 'siddurim', order: 10, art: 'book' },

  // Sub-categories — a parent category page also lists its children's products.
  { name: 'בגדי ציצית', slug: 'tzitzit-garments', parentSlug: 'tzitzit', order: 1 },
  { name: 'חוטי ציצית', slug: 'tzitzit-strings', parentSlug: 'tzitzit', order: 2 },
  { name: 'גופיה ציצית', slug: 'tzitzit-undershirt', parentSlug: 'tzitzit', order: 3 },

  { name: 'טליתות צמר', slug: 'tallit-wool', parentSlug: 'prayer-shawls', order: 1 },
  { name: 'טליתות משי', slug: 'tallit-silk', parentSlug: 'prayer-shawls', order: 2 },
  { name: 'טליתות בר מצווה', slug: 'tallit-bar-mitzvah', parentSlug: 'prayer-shawls', order: 3 },

  { name: 'תפילין רש"י', slug: 'tefillin-rashi', parentSlug: 'tefillin', order: 1 },
  { name: 'תפילין רבנו תם', slug: 'tefillin-rabbeinu-tam', parentSlug: 'tefillin', order: 2 },
  { name: 'רצועות ואביזרים', slug: 'tefillin-straps', parentSlug: 'tefillin', order: 3 },

  { name: 'קלפי מזוזה', slug: 'mezuzah-scrolls', parentSlug: 'mezuzot', order: 1 },
  { name: 'בתי מזוזה', slug: 'mezuzah-cases', parentSlug: 'mezuzot', order: 2 },

  { name: 'כיסויי חלה ומפות', slug: 'shabbat-textiles', parentSlug: 'shabbat', order: 1 },
  { name: 'פמוטים וגביעים', slug: 'shabbat-silver', parentSlug: 'shabbat', order: 2 },
];

const SIZE_OPTION = (values) => ({ name: 'מידה', values });

/** Builds a single-dimension variant list from [value, price] pairs. */
const sizeVariants = (pairs, skuPrefix) =>
  pairs.map(([value, price], index) => ({
    optionValues: { 'מידה': value },
    price,
    sku: `${skuPrefix}-${index + 1}`,
    inStock: true,
    stockQuantity: 8 + index * 3,
  }));

export const products = [
  /* ============================ ציצית ============================ */
  {
    name: 'בגד ציצית כותנה — פסים שחורים',
    slug: 'tzitzit-cotton-black-stripes',
    categorySlug: 'tzitzit-garments',
    description:
      'בגד ציצית (טלית קטן) בגזרת פונצ\'ו, עשוי כותנה נושמת באיכות גבוהה, עם פסים שחורים-כסופים לאורך הבד וציציות לבנות קשורות ביד בארבע הכנפות. מתאים ללבישה יומיומית ולשימוש ממושך, ונשמר היטב גם לאחר כביסות רבות.',
    tags: ['ציצית', 'טלית קטן', 'כותנה'],
    basePrice: 89,
    badge: 'רב מכר',
    featured: true,
    art: 'tzitzit',
    palette: 'ivory',
    options: [SIZE_OPTION(['2', '4', '6', '8', '10'])],
    variants: sizeVariants(
      [['2', 89], ['4', 99], ['6', 109], ['8', 119], ['10', 129]],
      'TZK-COT'
    ),
    specs: { material: 'כותנה 100%', hashgacha: 'בד"ץ העדה החרדית', craftsmanship: 'קשירת ציצית בעבודת יד' },
    returnPolicy: { returnable: true, customizable: false },
  },
  {
    name: 'בגד ציצית צמר מרינו מהודר',
    slug: 'tzitzit-merino-wool',
    categorySlug: 'tzitzit-garments',
    description:
      'טלית קטן מצמר מרינו רך במיוחד, ללא גירוד, בעבודת אריגה צפופה. הבד עבה דיו כדי לשמור על צורתו לאורך שנים, ומתאים במיוחד למי שמקפיד על ציצית צמר לכתחילה.',
    tags: ['ציצית', 'צמר', 'מהודר'],
    basePrice: 189,
    originalPrice: 229,
    badge: 'מבצע',
    featured: true,
    art: 'tzitzit',
    palette: 'cream',
    options: [SIZE_OPTION(['4', '6', '8', '10'])],
    variants: sizeVariants([['4', 189], ['6', 209], ['8', 229], ['10', 249]], 'TZK-MER'),
    specs: { material: 'צמר מרינו', hashgacha: 'בד"ץ בית יוסף', tradition: 'אשכנז / ספרד' },
    returnPolicy: { returnable: true, customizable: false },
  },
  {
    name: 'טלית קטן לילדים — גזרת פונצ\'ו',
    slug: 'tzitzit-kids-poncho',
    categorySlug: 'tzitzit-garments',
    description:
      'בגד ציצית לילדים בגזרה נוחה ורכה, קלה ללבישה עצמאית. הבד עמיד לכביסות תכופות, והציציות קשורות בקשירה חזקה שמחזיקה מעמד גם בגן ובבית הספר.',
    tags: ['ציצית', 'ילדים'],
    basePrice: 59,
    art: 'tzitzit',
    palette: 'sky',
    options: [SIZE_OPTION(['0', '1', '2', '3', '4'])],
    variants: sizeVariants([['0', 59], ['1', 62], ['2', 65], ['3', 69], ['4', 72]], 'TZK-KID'),
    specs: { material: 'כותנה מסורקת', hashgacha: 'בד"ץ העדה החרדית' },
    returnPolicy: { returnable: true, customizable: false },
  },
  {
    name: 'גופיית ציצית כותנה נושמת',
    slug: 'tzitzit-undershirt-cotton',
    categorySlug: 'tzitzit-undershirt',
    description:
      'גופיית ציצית בגזרה צמודה ונוחה, מכותנה נושמת המנדפת זיעה. נלבשת מתחת לחולצה מבלי להיראות, ומתאימה במיוחד לימי הקיץ ולעבודה מאומצת.',
    tags: ['ציצית', 'גופיה', 'קיץ'],
    basePrice: 79,
    art: 'tzitzit',
    palette: 'ivory',
    options: [SIZE_OPTION(['S', 'M', 'L', 'XL', 'XXL'])],
    variants: sizeVariants([['S', 79], ['M', 79], ['L', 84], ['XL', 89], ['XXL', 94]], 'TZK-UND'),
    specs: { material: 'כותנה 95% / אלסטן 5%', hashgacha: 'בד"ץ בית יוסף' },
    returnPolicy: { returnable: true, customizable: false },
  },
  {
    name: 'חוטי ציצית צמר — קשירת אשכנז',
    slug: 'tzitzit-strings-ashkenaz',
    categorySlug: 'tzitzit-strings',
    description:
      'סט חוטי ציצית מצמר טווי לשמה, עבים ואיכותיים, בקשירת אשכנז מסורתית. הסט כולל חוטים לארבע כנפות ותעודת הכשר.',
    tags: ['חוטי ציצית', 'צמר', 'לשמה'],
    basePrice: 45,
    art: 'strings',
    palette: 'ivory',
    specs: { material: 'צמר טווי לשמה', hashgacha: 'בד"ץ העדה החרדית', tradition: 'אשכנז' },
    returnPolicy: { returnable: true, customizable: false },
  },
  {
    name: 'חוטי ציצית עם פתיל תכלת',
    slug: 'tzitzit-strings-techelet',
    categorySlug: 'tzitzit-strings',
    description:
      'סט חוטי ציצית הכולל פתיל תכלת מצבע חילזון הארגמון, לצד חוטי צמר לבנים טווים לשמה. מגיע עם דף הסבר על סדר הקשירה.',
    tags: ['חוטי ציצית', 'תכלת'],
    basePrice: 149,
    badge: 'חדש',
    art: 'strings',
    palette: 'azure',
    specs: { material: 'צמר טווי לשמה + פתיל תכלת', hashgacha: 'בד"ץ בית יוסף' },
    returnPolicy: { returnable: true, customizable: false },
  },

  /* ============================ טליתות ============================ */
  {
    name: 'טלית צמר מהודרת — פסים כסף',
    slug: 'tallit-wool-silver-stripes',
    categorySlug: 'tallit-wool',
    description:
      'טלית גדול מצמר טהור באריגה מסורתית, עם פסים כסופים לאורך הבד ופינות מחוזקות. הטלית נופלת יפה על הכתפיים ואינה מחליקה, ומגיעה עם נרתיק תואם.',
    tags: ['טלית', 'צמר', 'מהודר'],
    basePrice: 349,
    badge: 'רב מכר',
    featured: true,
    art: 'tallit',
    palette: 'silver',
    options: [SIZE_OPTION(['50', '55', '60', '70', '80'])],
    variants: sizeVariants(
      [['50', 349], ['55', 379], ['60', 409], ['70', 449], ['80', 489]],
      'TAL-WSS'
    ),
    specs: { material: 'צמר טהור', hashgacha: 'בד"ץ העדה החרדית', craftsmanship: 'אריגה מסורתית' },
    returnPolicy: { returnable: true, customizable: false },
  },
  {
    name: 'טלית "מלכות" עם עטרה מוזהבת',
    slug: 'tallit-malchut-gold-atara',
    categorySlug: 'tallit-wool',
    description:
      'טלית צמר יוקרתית עם עטרה רקומה בחוטי זהב ופסים בגוון שמנת-זהב. נבחרת רבות לחתנים ולאירועים, ומגיעה באריזת מתנה מהודרת.',
    tags: ['טלית', 'חתן', 'מתנה'],
    basePrice: 549,
    originalPrice: 649,
    badge: 'מבצע',
    featured: true,
    art: 'tallit',
    palette: 'gold',
    options: [SIZE_OPTION(['55', '60', '70', '80'])],
    variants: sizeVariants([['55', 549], ['60', 589], ['70', 639], ['80', 689]], 'TAL-MAL'),
    specs: { material: 'צמר טהור', craftsmanship: 'עטרה ברקמת חוטי זהב', hashgacha: 'בד"ץ בית יוסף' },
    returnPolicy: { returnable: true, customizable: false },
  },
  {
    name: 'טלית משי בעבודת יד',
    slug: 'tallit-handmade-silk',
    categorySlug: 'tallit-silk',
    description:
      'טלית משי בעבודת יד, קלה במיוחד ונעימה למגע, עם דוגמה עדינה בגווני תכלת. מתאימה במיוחד לימי הקיץ ולמי שמעדיף טלית קלה.',
    tags: ['טלית', 'משי', 'עבודת יד'],
    basePrice: 689,
    art: 'tallit',
    palette: 'azure',
    options: [SIZE_OPTION(['55', '60', '70'])],
    variants: sizeVariants([['55', 689], ['60', 739], ['70', 799]], 'TAL-SLK'),
    specs: { material: 'משי טבעי', craftsmanship: 'אריגה ידנית' },
    returnPolicy: { returnable: true, customizable: false },
  },
  {
    name: 'סט טלית לבר מצווה',
    slug: 'tallit-bar-mitzvah-set',
    categorySlug: 'tallit-bar-mitzvah',
    description:
      'מארז מתנה שלם לבר מצווה: טלית צמר במידת נוער, נרתיק טלית ותפילין תואם, כיפה וכיסוי ראש. מגיע בקופסת מתנה מהודרת המוכנה להענקה.',
    tags: ['טלית', 'בר מצווה', 'מארז מתנה'],
    basePrice: 459,
    badge: 'מארז מתנה',
    featured: true,
    art: 'tallit',
    palette: 'royal',
    specs: { material: 'צמר טהור', craftsmanship: 'מארז מתנה מלא' },
    returnPolicy: { returnable: true, customizable: false },
  },
  {
    name: 'טלית "אור זרוע" — צמר קלה',
    slug: 'tallit-or-zarua-light',
    categorySlug: 'tallit-wool',
    description:
      'טלית צמר בעובי קל, מאווררת ונוחה לעטיפה ממושכת. הפסים בגוון לבן על לבן מעניקים מראה נקי וקלאסי.',
    tags: ['טלית', 'צמר', 'קלה'],
    basePrice: 279,
    art: 'tallit',
    palette: 'ivory',
    options: [SIZE_OPTION(['50', '55', '60', '70'])],
    variants: sizeVariants([['50', 279], ['55', 299], ['60', 329], ['70', 359]], 'TAL-ORZ'),
    specs: { material: 'צמר טהור', hashgacha: 'בד"ץ העדה החרדית' },
    returnPolicy: { returnable: true, customizable: false },
  },
  {
    name: 'טלית איטלקית קלאסית',
    slug: 'tallit-italian-classic',
    categorySlug: 'tallit-wool',
    description:
      'טלית באריגה איטלקית עם מרקם עשיר ופסים שחורים רחבים. משקל בינוני שנופל יפה, ופינות מחוזקות בתפירה כפולה.',
    tags: ['טלית', 'צמר', 'קלאסי'],
    basePrice: 399,
    art: 'tallit',
    palette: 'graphite',
    options: [SIZE_OPTION(['55', '60', '70', '80'])],
    variants: sizeVariants([['55', 399], ['60', 429], ['70', 469], ['80', 509]], 'TAL-ITA'),
    specs: { material: 'צמר טהור', craftsmanship: 'אריגה איטלקית' },
    returnPolicy: { returnable: true, customizable: false },
  },

  /* ============================ תפילין ============================ */
  {
    name: 'תפילין "פשוטות מהודרות" — כתב בית יוסף',
    slug: 'tefillin-peshutot-mehudarot',
    categorySlug: 'tefillin-rashi',
    description:
      'זוג תפילין רש"י בכתב בית יוסף, בכתיבה נאה של סופר סת"ם מוסמך. הבתים מרובעים ומחופים בשחרות איכותית, והפרשיות נבדקו בבדיקת מחשב ובבדיקת מגיה.',
    tags: ['תפילין', 'רש"י', 'סת"ם'],
    basePrice: 1890,
    featured: true,
    art: 'tefillin',
    palette: 'graphite',
    specs: {
      material: 'עור בהמה גסה',
      kashrut: 'נבדק בבדיקת מחשב ומגיה',
      hashgacha: 'בד"ץ העדה החרדית',
      tradition: 'כתב בית יוסף',
    },
    returnPolicy: {
      returnable: false,
      customizable: false,
      nonReturnableReason: 'תשמיש קדושה — לאחר פתיחת האריזה או בדיקת הפרשיות לא ניתן להחזיר את הפריט.',
    },
  },
  {
    name: 'תפילין "גסות" — עור עגל מהודר',
    slug: 'tefillin-gassot-calf-leather',
    categorySlug: 'tefillin-rashi',
    description:
      'תפילין גסות עשויות מעור עגל עבה בעבודת יד, עמידות במיוחד לאורך שנים. הכתיבה מהודרת, והבתים מרובעים בדיוק רב.',
    tags: ['תפילין', 'גסות', 'מהודר'],
    basePrice: 3450,
    art: 'tefillin',
    palette: 'graphite',
    specs: {
      material: 'עור עגל',
      kashrut: 'נבדק בבדיקת מחשב ומגיה',
      hashgacha: 'בד"ץ בית יוסף',
      craftsmanship: 'בתים בעבודת יד',
    },
    returnPolicy: {
      returnable: false,
      customizable: false,
      nonReturnableReason: 'תשמיש קדושה — לאחר פתיחת האריזה או בדיקת הפרשיות לא ניתן להחזיר את הפריט.',
    },
  },
  {
    name: 'תפילין רבנו תם',
    slug: 'tefillin-rabbeinu-tam',
    categorySlug: 'tefillin-rabbeinu-tam',
    description:
      'זוג תפילין רבנו תם בכתיבה מהודרת, המיועד להנחה נוספת לאחר תפילין רש"י. הבתים מרובעים והפרשיות נבדקו פעמיים.',
    tags: ['תפילין', 'רבנו תם'],
    basePrice: 2290,
    art: 'tefillin',
    palette: 'graphite',
    specs: {
      material: 'עור בהמה גסה',
      kashrut: 'נבדק בבדיקת מחשב ומגיה',
      tradition: 'רבנו תם',
    },
    returnPolicy: {
      returnable: false,
      customizable: false,
      nonReturnableReason: 'תשמיש קדושה — לאחר פתיחת האריזה או בדיקת הפרשיות לא ניתן להחזיר את הפריט.',
    },
  },
  {
    name: 'רצועות תפילין עור — עבודת יד',
    slug: 'tefillin-straps-handmade',
    categorySlug: 'tefillin-straps',
    description:
      'זוג רצועות תפילין מעור מעובד, צבועות שחור בצד אחד כהלכה. הרצועות רכות ונוחות, ואינן מתפתלות בקשירה.',
    tags: ['תפילין', 'רצועות'],
    basePrice: 159,
    art: 'strap',
    palette: 'graphite',
    specs: { material: 'עור מעובד', hashgacha: 'בד"ץ העדה החרדית' },
    returnPolicy: { returnable: true, customizable: false },
  },

  /* ============================ מזוזות ============================ */
  {
    name: 'קלף מזוזה מהודר 12 ס"מ',
    slug: 'mezuzah-scroll-12cm',
    categorySlug: 'mezuzah-scrolls',
    description:
      'קלף מזוזה בכתיבה מהודרת של סופר סת"ם מוסמך, על קלף עבודת יד. נבדק בבדיקת מחשב ובבדיקת מגיה לפני המשלוח, ומגיע עם תעודת כשרות.',
    tags: ['מזוזה', 'קלף', 'סת"ם'],
    basePrice: 320,
    featured: true,
    art: 'scroll',
    palette: 'cream',
    specs: {
      material: 'קלף עבודת יד',
      kashrut: 'נבדק בבדיקת מחשב ומגיה',
      hashgacha: 'בד"ץ בית יוסף',
    },
    returnPolicy: {
      returnable: false,
      customizable: false,
      nonReturnableReason: 'תשמיש קדושה — קלף שנפתח או נבדק אינו ניתן להחזרה.',
    },
  },
  {
    name: 'בית מזוזה זכוכית ואבן ירושלמית',
    slug: 'mezuzah-case-jerusalem-stone',
    categorySlug: 'mezuzah-cases',
    description:
      'בית מזוזה בשילוב זכוכית שקופה ואבן ירושלמית מקורית, עם אות שי"ן מוזהבת. עמיד לתנאי חוץ ומתאים גם לדלת הכניסה.',
    tags: ['מזוזה', 'בית מזוזה', 'אבן ירושלמית'],
    basePrice: 129,
    art: 'mezuzah',
    palette: 'stone',
    options: [SIZE_OPTION(['7 ס"מ', '10 ס"מ', '12 ס"מ', '15 ס"מ'])],
    variants: sizeVariants(
      [['7 ס"מ', 129], ['10 ס"מ', 149], ['12 ס"מ', 169], ['15 ס"מ', 199]],
      'MZC-JRS'
    ),
    specs: { material: 'זכוכית ואבן ירושלמית', craftsmanship: 'עבודת יד' },
    returnPolicy: { returnable: true, customizable: false },
  },
  {
    name: 'בית מזוזה אלומיניום מודרני',
    slug: 'mezuzah-case-modern-aluminum',
    categorySlug: 'mezuzah-cases',
    description:
      'בית מזוזה בעיצוב נקי ומודרני מאלומיניום מוברש, עמיד לשמש ולגשם. מתאים לבתים בעיצוב עכשווי ולמשרדים.',
    tags: ['מזוזה', 'בית מזוזה', 'מודרני'],
    basePrice: 69,
    art: 'mezuzah',
    palette: 'silver',
    options: [SIZE_OPTION(['7 ס"מ', '10 ס"מ', '12 ס"מ', '15 ס"מ'])],
    variants: sizeVariants(
      [['7 ס"מ', 69], ['10 ס"מ', 79], ['12 ס"מ', 89], ['15 ס"מ', 99]],
      'MZC-ALU'
    ),
    specs: { material: 'אלומיניום מוברש' },
    returnPolicy: { returnable: true, customizable: false },
  },
  {
    name: 'בית מזוזה כסף 925 מעוטר',
    slug: 'mezuzah-case-sterling-silver',
    categorySlug: 'mezuzah-cases',
    description:
      'בית מזוזה מכסף סטרלינג 925, מעוטר בדוגמת פילגרן עדינה בעבודת יד. מגיע בקופסת מתנה — בחירה נפוצה למתנת חנוכת בית.',
    tags: ['מזוזה', 'כסף', 'מתנה'],
    basePrice: 449,
    badge: 'מהודר',
    art: 'mezuzah',
    palette: 'silver',
    specs: { material: 'כסף סטרלינג 925', craftsmanship: 'פילגרן בעבודת יד' },
    returnPolicy: { returnable: true, customizable: false },
  },
  {
    name: 'סט 7 בתי מזוזה לבית',
    slug: 'mezuzah-cases-set-of-7',
    categorySlug: 'mezuzah-cases',
    description:
      'סט של שבעה בתי מזוזה בגוון אחיד לכל חדרי הבית, כולל בית עמיד לחוץ לדלת הכניסה. פתרון נוח וחסכוני לחנוכת בית.',
    tags: ['מזוזה', 'סט', 'חנוכת בית'],
    basePrice: 199,
    originalPrice: 259,
    badge: 'מבצע',
    art: 'mezuzah',
    palette: 'stone',
    specs: { material: 'פוליריזן בגימור אבן' },
    returnPolicy: { returnable: true, customizable: false },
  },

  /* ============================ מתנות ============================ */
  {
    name: 'סט קידוש מהודר — גביע ומגש',
    slug: 'kiddush-set-cup-tray',
    categorySlug: 'general',
    description:
      'סט קידוש הכולל גביע מצופה כסף ומגש תואם, בעיטור גפנים קלאסי. מגיע בקופסת מתנה מרופדת — מתנה מכובדת לחתונה או לחנוכת בית.',
    tags: ['מתנה', 'קידוש', 'גביע'],
    basePrice: 289,
    badge: 'מארז מתנה',
    featured: true,
    art: 'gift',
    palette: 'silver',
    specs: { material: 'ציפוי כסף', craftsmanship: 'עיטור גפנים' },
    returnPolicy: { returnable: true, customizable: false },
  },
  {
    name: 'זוג פמוטי כסף קלאסיים',
    slug: 'candlesticks-silver-pair',
    categorySlug: 'general',
    description:
      'זוג פמוטים מצופי כסף בעיצוב קלאסי מדורג, יציבים ומכובדים. מתאימים לנרות שבת רגילים ולנרות נשמה.',
    tags: ['מתנה', 'פמוטים', 'שבת'],
    basePrice: 349,
    art: 'candles',
    palette: 'silver',
    specs: { material: 'ציפוי כסף' },
    returnPolicy: { returnable: true, customizable: false },
  },
  {
    name: 'קופסת צדקה מעוצבת',
    slug: 'tzedakah-box-designer',
    categorySlug: 'general',
    description:
      'קופסת צדקה בעיצוב עכשווי משילוב עץ ומתכת, עם מכסה נשלף לריקון נוח. מוסיפה נוכחות יפה בסלון או במטבח.',
    tags: ['מתנה', 'צדקה'],
    basePrice: 139,
    art: 'gift',
    palette: 'royal',
    specs: { material: 'עץ ומתכת', craftsmanship: 'עיצוב עכשווי' },
    returnPolicy: { returnable: true, customizable: false },
  },
  {
    name: 'מארז מתנה לבר מצווה',
    slug: 'bar-mitzvah-gift-box',
    categorySlug: 'general',
    description:
      'מארז מתנה הכולל סידור כיס בכריכת עור, כיפה, נרתיק תפילין וכרטיס ברכה. ארוז בקופסה מהודרת ומוכן להענקה.',
    tags: ['מתנה', 'בר מצווה', 'מארז'],
    basePrice: 249,
    badge: 'מארז מתנה',
    art: 'gift',
    palette: 'gold',
    specs: { craftsmanship: 'מארז מתנה ארוז' },
    returnPolicy: { returnable: true, customizable: false },
  },

  /* ============================ שבת ============================ */
  {
    name: 'כיסוי חלה קטיפה עם רקמת ירושלים',
    slug: 'challah-cover-jerusalem-velvet',
    categorySlug: 'shabbat-textiles',
    description:
      'כיסוי חלה מקטיפה עשירה, עם רקמת נוף ירושלים בחוטי זהב ומסגרת מעוטרת. מרופד מבפנים ושומר על החלות חמימות.',
    tags: ['שבת', 'כיסוי חלה', 'רקמה'],
    basePrice: 119,
    featured: true,
    art: 'challah',
    palette: 'royal',
    specs: { material: 'קטיפה', craftsmanship: 'רקמת חוטי זהב' },
    returnPolicy: { returnable: true, customizable: false },
  },
  {
    name: 'מפת שבת רקומה — סט עם כיסוי חלה',
    slug: 'shabbat-tablecloth-set',
    categorySlug: 'shabbat-textiles',
    description:
      'סט מפת שבת וכיסוי חלה תואם, ברקמה עדינה בגווני שמנת וזהב. הבד עמיד לכתמים וניתן לכביסה במכונה.',
    tags: ['שבת', 'מפה', 'סט'],
    basePrice: 259,
    originalPrice: 299,
    badge: 'מבצע',
    art: 'challah',
    palette: 'cream',
    options: [SIZE_OPTION(['140×220', '160×260', '180×300'])],
    variants: sizeVariants(
      [['140×220', 259], ['160×260', 289], ['180×300', 329]],
      'SHB-TCL'
    ),
    specs: { material: 'פוליאסטר עמיד', craftsmanship: 'רקמה מכונתית עדינה' },
    returnPolicy: { returnable: true, customizable: false },
  },
  {
    name: 'גביע קידוש כסף 925',
    slug: 'kiddush-cup-sterling-925',
    categorySlug: 'shabbat-silver',
    description:
      'גביע קידוש מכסף סטרלינג 925 בעיצוב חלק וקלאסי, עם תחתית יציבה. מגיע עם תחתית תואמת בקופסת מתנה.',
    tags: ['שבת', 'גביע', 'כסף'],
    basePrice: 529,
    featured: true,
    art: 'cup',
    palette: 'silver',
    specs: { material: 'כסף סטרלינג 925' },
    returnPolicy: { returnable: true, customizable: false },
  },
  {
    name: 'מגש נרות שבת מזכוכית',
    slug: 'shabbat-candle-tray-glass',
    categorySlug: 'shabbat-silver',
    description:
      'מגש נרות שבת מזכוכית מחוסמת עם הדפס דקורטיבי, קל לניקוי ומגן על המשטח מטפטוף שעווה.',
    tags: ['שבת', 'נרות', 'מגש'],
    basePrice: 89,
    art: 'candles',
    palette: 'stone',
    specs: { material: 'זכוכית מחוסמת' },
    returnPolicy: { returnable: true, customizable: false },
  },
  {
    name: 'פמוטי נסיעות מתקפלים',
    slug: 'travel-candlesticks-folding',
    categorySlug: 'shabbat-silver',
    description:
      'זוג פמוטים מתקפלים בנרתיק קומפקטי — פתרון נוח לשבת מחוץ לבית, במלון או בנסיעה.',
    tags: ['שבת', 'פמוטים', 'נסיעות'],
    basePrice: 119,
    art: 'candles',
    palette: 'gold',
    specs: { material: 'מתכת מצופה', craftsmanship: 'מנגנון קיפול' },
    returnPolicy: { returnable: true, customizable: false },
  },

  /* ============================ כיפות ============================ */
  {
    name: 'כיפת קטיפה קלאסית',
    slug: 'kippah-velvet-classic',
    categorySlug: 'kippot',
    description:
      'כיפת קטיפה בגזרה קלאסית, עם תפר פנימי מחוזק ששומר על הצורה. הגוון שחור עמוק אחיד, ללא הברקה.',
    tags: ['כיפה', 'קטיפה'],
    basePrice: 29,
    art: 'kippah',
    palette: 'graphite',
    options: [SIZE_OPTION(['16 ס"מ', '18 ס"מ', '20 ס"מ', '22 ס"מ'])],
    variants: sizeVariants(
      [['16 ס"מ', 29], ['18 ס"מ', 32], ['20 ס"מ', 35], ['22 ס"מ', 38]],
      'KIP-VEL'
    ),
    specs: { material: 'קטיפה' },
    returnPolicy: { returnable: true, customizable: false },
  },
  {
    name: 'כיפה סרוגה בעבודת יד',
    slug: 'kippah-knitted-handmade',
    categorySlug: 'kippot',
    description:
      'כיפה סרוגה בעבודת יד מחוטי כותנה, עם דוגמת מסגרת עדינה. קלה, נושמת ומתאימה ללבישה יומיומית.',
    tags: ['כיפה', 'סרוגה', 'עבודת יד'],
    basePrice: 45,
    art: 'kippah',
    palette: 'azure',
    options: [SIZE_OPTION(['16 ס"מ', '18 ס"מ', '20 ס"מ'])],
    variants: sizeVariants([['16 ס"מ', 45], ['18 ס"מ', 49], ['20 ס"מ', 54]], 'KIP-KNT'),
    specs: { material: 'כותנה', craftsmanship: 'סריגה בעבודת יד' },
    returnPolicy: { returnable: true, customizable: false },
  },
  {
    name: 'כיפה בוכרית מעוטרת',
    slug: 'kippah-bukharian-embroidered',
    categorySlug: 'kippot',
    description:
      'כיפה בוכרית ברקמה צבעונית עשירה, בגזרה גבוהה ונוחה. מוסיפה מראה חגיגי ומתאימה גם למתנה.',
    tags: ['כיפה', 'בוכרית', 'רקמה'],
    basePrice: 59,
    art: 'kippah',
    palette: 'royal',
    specs: { material: 'כותנה רקומה', craftsmanship: 'רקמה צבעונית' },
    returnPolicy: { returnable: true, customizable: false },
  },
  {
    name: 'כיפת עור רכה',
    slug: 'kippah-soft-leather',
    categorySlug: 'kippot',
    description:
      'כיפת עור רך ודק, שומרת על צורתה ואינה מחליקה. גימור נקי ותפר עדין בהיקף.',
    tags: ['כיפה', 'עור'],
    basePrice: 69,
    art: 'kippah',
    palette: 'stone',
    options: [SIZE_OPTION(['18 ס"מ', '20 ס"מ', '22 ס"מ'])],
    variants: sizeVariants([['18 ס"מ', 69], ['20 ס"מ', 74], ['22 ס"מ', 79]], 'KIP-LTH'),
    specs: { material: 'עור טבעי' },
    returnPolicy: { returnable: true, customizable: false },
  },
  {
    name: 'מארז 12 כיפות לאירוע',
    slug: 'kippot-event-pack-12',
    categorySlug: 'kippot',
    description:
      'מארז של 12 כיפות סאטן לאירועים, בגוון אחיד. פתרון נוח לחתונות, לבר מצווה ולבריתות.',
    tags: ['כיפה', 'אירוע', 'מארז'],
    basePrice: 89,
    badge: 'מארז',
    art: 'kippah',
    palette: 'ivory',
    specs: { material: 'סאטן' },
    returnPolicy: { returnable: true, customizable: false },
  },

  /* ============================ פתילים ============================ */
  {
    name: 'פתילות צף לנר נשמה — 50 יחידות',
    slug: 'floating-wicks-50',
    categorySlug: 'wicks',
    description:
      'מארז 50 פתילות צף איכותיות לשמן זית, עם דיסקית פקק יציבה. בעירה נקייה וללא פיח.',
    tags: ['פתילים', 'שמן', 'נרות'],
    basePrice: 39,
    art: 'wick',
    palette: 'cream',
    specs: { material: 'כותנה טהורה' },
    returnPolicy: { returnable: true, customizable: false },
  },
  {
    name: 'שמן זית זך למאור — ליטר',
    slug: 'olive-oil-lighting-1l',
    categorySlug: 'wicks',
    description:
      'שמן זית זך למאור בבקבוק ליטר, מסונן היטב לבעירה צלולה ונקייה. מתאים לנרות שבת, לנר נשמה ולחנוכייה.',
    tags: ['שמן זית', 'מאור'],
    basePrice: 54,
    art: 'oil',
    palette: 'gold',
    options: [SIZE_OPTION(['750 מ"ל', '1 ליטר', '3 ליטר'])],
    variants: sizeVariants(
      [['750 מ"ל', 44], ['1 ליטר', 54], ['3 ליטר', 139]],
      'OIL-LIT'
    ),
    specs: { material: 'שמן זית זך', hashgacha: 'בד"ץ העדה החרדית' },
    returnPolicy: { returnable: true, customizable: false },
  },
  {
    name: 'כוסיות זכוכית לנרות — 30 יחידות',
    slug: 'glass-cups-30',
    categorySlug: 'wicks',
    description:
      'מארז 30 כוסיות זכוכית עבות לנרות שמן, עמידות לחום וניתנות לשימוש חוזר לאחר שטיפה.',
    tags: ['פתילים', 'כוסיות', 'זכוכית'],
    basePrice: 45,
    art: 'oil',
    palette: 'stone',
    specs: { material: 'זכוכית עמידת חום' },
    returnPolicy: { returnable: true, customizable: false },
  },
  {
    name: 'נרות שבת קלועים — 72 יחידות',
    slug: 'shabbat-candles-72',
    categorySlug: 'wicks',
    description:
      'מארז 72 נרות שבת קלועים בזמן בעירה של כשלוש שעות. בעירה יציבה ללא טפטוף מיותר.',
    tags: ['נרות', 'שבת'],
    basePrice: 29,
    art: 'wick',
    palette: 'ivory',
    specs: { material: 'פרפין ושעווה' },
    returnPolicy: { returnable: true, customizable: false },
  },

  /* ============================ נרתיקים ============================ */
  {
    name: 'סט נרתיקי טלית ותפילין — קטיפה מוזהבת',
    slug: 'tallit-tefillin-bag-velvet-gold',
    categorySlug: 'talit-tefillin-covers',
    description:
      'סט נרתיקים מקטיפה עשירה עם רקמת חוטי זהב ורוכסן איכותי. הריפוד הפנימי מגן על הטלית ועל התפילין, והסט כולל נרתיק טלית ונרתיק תפילין תואמים.',
    tags: ['נרתיק', 'קטיפה', 'סט'],
    basePrice: 179,
    featured: true,
    art: 'pouch',
    palette: 'royal',
    specs: { material: 'קטיפה', craftsmanship: 'רקמת חוטי זהב' },
    returnPolicy: { returnable: true, customizable: false },
  },
  {
    name: 'סט נרתיקים עור איטלקי',
    slug: 'tallit-tefillin-bag-italian-leather',
    categorySlug: 'talit-tefillin-covers',
    description:
      'סט נרתיקים מעור איטלקי רך בגימור מט, עם תפירה מחוזקת וידית נשיאה. מראה מכובד שמשתפר עם השנים.',
    tags: ['נרתיק', 'עור', 'סט'],
    basePrice: 429,
    badge: 'מהודר',
    art: 'pouch',
    palette: 'stone',
    specs: { material: 'עור איטלקי', craftsmanship: 'תפירה ידנית' },
    returnPolicy: { returnable: true, customizable: false },
  },
  {
    name: 'נרתיק תפילין עמיד למים',
    slug: 'tefillin-bag-waterproof',
    categorySlug: 'talit-tefillin-covers',
    description:
      'נרתיק תפילין בציפוי עמיד למים, עם ריפוד פנימי מגן ורוכסן אטום. מתאים במיוחד לנסיעות וללימוד מחוץ לבית.',
    tags: ['נרתיק', 'תפילין', 'נסיעות'],
    basePrice: 99,
    art: 'pouch',
    palette: 'graphite',
    specs: { material: 'ניילון מצופה', craftsmanship: 'ריפוד מגן' },
    returnPolicy: { returnable: true, customizable: false },
  },
  {
    name: 'נרתיק טלית עם רקמת שם אישית',
    slug: 'tallit-bag-personalized-embroidery',
    categorySlug: 'talit-tefillin-covers',
    description:
      'נרתיק טלית מקטיפה עם רקמת שם אישית בחוטי זהב או כסף. השם נרקם במיוחד עבורכם — נאשר איתכם את הכיתוב לפני תחילת העבודה. זמן הכנה: 3–7 ימי עסקים.',
    tags: ['נרתיק', 'רקמה אישית', 'מתנה'],
    basePrice: 219,
    badge: 'בהתאמה אישית',
    art: 'pouch',
    palette: 'gold',
    specs: { material: 'קטיפה', craftsmanship: 'רקמת שם בעבודת יד' },
    returnPolicy: {
      returnable: false,
      customizable: true,
      nonReturnableReason: 'מוצר בהתאמה אישית — אינו ניתן להחזרה לאחר תחילת הרקמה.',
    },
  },

  /* ============================ סידורים ============================ */
  {
    name: 'סידור "תפילת ישראל" בכריכת עור',
    slug: 'siddur-tefilat-yisrael-leather',
    categorySlug: 'siddurim',
    description:
      'סידור בנוסח אשכנז בכריכת עור רכה, עם אותיות גדולות וברורות ופתיחה נוחה. כולל תפילות לחול, לשבת ולמועדים.',
    tags: ['סידור', 'עור'],
    basePrice: 129,
    featured: true,
    art: 'book',
    palette: 'royal',
    options: [{ name: 'נוסח', values: ['אשכנז', 'ספרד', 'עדות המזרח'] }],
    variants: [
      { optionValues: { 'נוסח': 'אשכנז' }, price: 129, sku: 'SID-TY-ASH', inStock: true, stockQuantity: 22 },
      { optionValues: { 'נוסח': 'ספרד' }, price: 129, sku: 'SID-TY-SEF', inStock: true, stockQuantity: 18 },
      { optionValues: { 'נוסח': 'עדות המזרח' }, price: 139, sku: 'SID-TY-EDM', inStock: true, stockQuantity: 11 },
    ],
    specs: { material: 'כריכת עור', craftsmanship: 'הדפסה על נייר משובח' },
    returnPolicy: { returnable: true, customizable: false },
  },
  {
    name: 'סידור לבר מצווה עם שם מוטבע',
    slug: 'siddur-bar-mitzvah-embossed',
    categorySlug: 'siddurim',
    description:
      'סידור מהודר בכריכה קשה, עם הטבעת שם אישית בחוטי זהב על הכריכה. מתנה אישית ומרגשת לבר מצווה. זמן הכנה: 3–7 ימי עסקים.',
    tags: ['סידור', 'בר מצווה', 'הטבעה אישית'],
    basePrice: 179,
    badge: 'בהתאמה אישית',
    art: 'book',
    palette: 'gold',
    specs: { material: 'כריכה קשה', craftsmanship: 'הטבעת שם בחוטי זהב' },
    returnPolicy: {
      returnable: false,
      customizable: true,
      nonReturnableReason: 'מוצר בהתאמה אישית — אינו ניתן להחזרה לאחר ביצוע ההטבעה.',
    },
  },
  {
    name: 'תהילים כיס בכריכת עור',
    slug: 'tehilim-pocket-leather',
    categorySlug: 'siddurim',
    description:
      'ספר תהילים בגודל כיס עם כריכת עור רכה, נוח לנשיאה בתיק ובכיס. אותיות ברורות ונייר דק ואיכותי.',
    tags: ['תהילים', 'כיס'],
    basePrice: 49,
    art: 'book',
    palette: 'stone',
    specs: { material: 'כריכת עור רכה' },
    returnPolicy: { returnable: true, customizable: false },
  },
  {
    name: 'חומש עם פירוש רש"י — סט חמישה כרכים',
    slug: 'chumash-rashi-set',
    categorySlug: 'siddurim',
    description:
      'סט חמישה חומשים עם פירוש רש"י מנוקד, בכריכה קשה ובעימוד רחב ונוח לעין. מתאים ללימוד בבית ובבית הכנסת.',
    tags: ['חומש', 'רש"י', 'סט'],
    basePrice: 389,
    originalPrice: 449,
    badge: 'מבצע',
    art: 'book',
    palette: 'graphite',
    specs: { material: 'כריכה קשה', craftsmanship: 'עימוד רחב ומנוקד' },
    returnPolicy: { returnable: true, customizable: false },
  },
];

/** Demo coupons so the cart's coupon field can be tried out. */
export const coupons = [
  { code: 'WELCOME10', type: 'percentage', value: 10, minOrderAmount: 150, active: true },
  { code: 'SHABBAT50', type: 'fixed', value: 50, minOrderAmount: 400, active: true },
];

/** Demo reviewers — plain showcase accounts, created only if no customers exist. */
export const reviewers = [
  { firstName: 'משה', lastName: 'כהן' },
  { firstName: 'שרה', lastName: 'לוי' },
  { firstName: 'יעקב', lastName: 'פרידמן' },
  { firstName: 'רבקה', lastName: 'אברמוביץ' },
  { firstName: 'דוד', lastName: 'מזרחי' },
  { firstName: 'חנה', lastName: 'שטרן' },
  { firstName: 'אליהו', lastName: 'ביטון' },
  { firstName: 'מרים', lastName: 'רוזנברג' },
];

/** Demo review texts, spread across the catalogue. */
export const reviewTexts = [
  { rating: 5, comment: 'איכות מעולה, הגיע מהר ובאריזה מכובדת. בהחלט אזמין שוב.' },
  { rating: 5, comment: 'בדיוק כמו בתמונה. העבודה נקייה והפרטים מדויקים.' },
  { rating: 4, comment: 'מוצר יפה ואיכותי. הייתי שמח למידה אחת גדולה יותר, אבל מרוצה מאוד.' },
  { rating: 5, comment: 'קניתי כמתנה והרושם היה מצוין. השירות בטלפון היה סבלני ומקצועי.' },
  { rating: 4, comment: 'תמורה טובה למחיר. ההזמנה הגיעה יומיים לפני הזמן המשוער.' },
  { rating: 5, comment: 'התייעצתי לפני ההזמנה וקיבלתי הכוונה מדויקת. הפריט עצמו מהודר.' },
  { rating: 5, comment: 'שירות אדיב, משלוח מהיר והמוצר עומד בכל הציפיות.' },
  { rating: 4, comment: 'איכות טובה מאוד. האריזה הגיעה מעט פגומה אבל המוצר עצמו תקין לגמרי.' },
  { rating: 5, comment: 'משתמש כבר חודשיים ומרוצה מאוד. ממליץ בחום.' },
  { rating: 3, comment: 'המוצר תקין, אך הגוון בפועל מעט כהה יותר מהתמונה באתר.' },
  { rating: 5, comment: 'רמת גימור גבוהה. ניכר שהושקעה בו עבודה.' },
  { rating: 4, comment: 'הזמנתי שוב אחרי הפעם הראשונה — סימן טוב.' },
];
