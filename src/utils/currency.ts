export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  region: string;
  flag: string;
  position: 'before' | 'after';
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'US USD', symbol: '$', name: 'United States (USD)', region: 'Americas', flag: 'US', position: 'before' },
  { code: 'EU EUR', symbol: '€', name: 'Eurozone (EUR)', region: 'Europe', flag: 'EU', position: 'after' },
  { code: 'GB GBP', symbol: '£', name: 'United Kingdom (GBP)', region: 'Europe', flag: 'GB', position: 'before' },
  { code: 'IN INR', symbol: '₹', name: 'India (INR)', region: 'Asia', flag: 'IN', position: 'before' },
  { code: 'JP JPY', symbol: '¥', name: 'Japan (JPY)', region: 'Asia', flag: 'JP', position: 'before' },
  { code: 'BR BRL', symbol: 'R$', name: 'Brazil (BRL)', region: 'Americas', flag: 'BR', position: 'before' },
  { code: 'CA CAD', symbol: '$', name: 'Canada (CAD)', region: 'Americas', flag: 'CA', position: 'before' },
  { code: 'AU AUD', symbol: 'A$', name: 'Australia (AUD)', region: 'Oceania', flag: 'AU', position: 'before' },
  { code: 'MX MXN', symbol: '$', name: 'Mexico (MXN)', region: 'Americas', flag: 'MX', position: 'before' },
  { code: 'PH PHP', symbol: '₱', name: 'Philippines (PHP)', region: 'Asia', flag: 'PH', position: 'before' },
  { code: 'ID IDR', symbol: 'Rp', name: 'Indonesia (IDR)', region: 'Asia', flag: 'ID', position: 'before' },
  { code: 'MY MYR', symbol: 'RM', name: 'Malaysia (MYR)', region: 'Asia', flag: 'MY', position: 'before' },
  { code: 'SG SGD', symbol: 'S$', name: 'Singapore (SGD)', region: 'Asia', flag: 'SG', position: 'before' },
  { code: 'NZ NZD', symbol: 'NZ$', name: 'New Zealand (NZD)', region: 'Oceania', flag: 'NZ', position: 'before' },
  { code: 'CH CHF', symbol: 'CHF', name: 'Switzerland (CHF)', region: 'Europe', flag: 'CH', position: 'before' },
  { code: 'PL PLN', symbol: 'zł', name: 'Poland (PLN)', region: 'Europe', flag: 'PL', position: 'after' },
  { code: 'SE SEK', symbol: 'kr', name: 'Sweden (SEK)', region: 'Europe', flag: 'SE', position: 'after' },
  { code: 'NO NOK', symbol: 'kr', name: 'Norway (NOK)', region: 'Europe', flag: 'NO', position: 'after' },
  { code: 'DK DKK', symbol: 'kr', name: 'Denmark (DKK)', region: 'Europe', flag: 'DK', position: 'after' },
  { code: 'ZA ZAR', symbol: 'R', name: 'South Africa (ZAR)', region: 'Africa', flag: 'ZA', position: 'before' },
  { code: 'TH THB', symbol: '฿', name: 'Thailand (THB)', region: 'Asia', flag: 'TH', position: 'before' },
  { code: 'VN VND', symbol: '₫', name: 'Vietnam (VND)', region: 'Asia', flag: 'VN', position: 'after' },
  { code: 'HK HKD', symbol: 'HK$', name: 'Hong Kong (HKD)', region: 'Asia', flag: 'HK', position: 'before' },
  { code: 'TW TWD', symbol: 'NT$', name: 'Taiwan (TWD)', region: 'Asia', flag: 'TW', position: 'before' },
  { code: 'SA SAR', symbol: '﷼', name: 'Saudi Arabia (SAR)', region: 'Middle East', flag: 'SA', position: 'after' },
  { code: 'AE AED', symbol: 'د.إ', name: 'United Arab Emirates (AED)', region: 'Middle East', flag: 'AE', position: 'after' },
  { code: 'KR KRW', symbol: '₩', name: 'South Korea (KRW)', region: 'Asia', flag: 'KR', position: 'before' },
  { code: 'TR TRY', symbol: '₺', name: 'Turkey (TRY)', region: 'Europe/Asia', flag: 'TR', position: 'after' },
];

export interface RobuxPackageItem {
  id: string;
  amountFormatted: string;
  amountNum: number;
  originalFormatted: string;
  bonusBadge: string;
  isFeatured?: boolean;
  priceFormatted: string;
  subtotalFormatted?: string;
  gstFormatted?: string;
}

export interface PlusSubscriptionPlan {
  id: string;
  title: string;
  originalPrice?: string;
  priceFormatted: string;
  periodFormatted: string;
  robuxPerMonth?: number;
  features: Array<{
    text: string;
    icon: 'tag' | 'gamepad' | 'robux' | 'brush' | 'plus' | 'piggy';
  }>;
}

// Format price with chosen currency code & symbol
export function formatPriceWithCurrency(
  baseUsd: number,
  currencyCode: string = 'US USD',
  currencySymbol: string = '$',
  customLocalizedMap?: Record<string, string>
): string {
  if (customLocalizedMap && customLocalizedMap[currencyCode]) {
    return customLocalizedMap[currencyCode];
  }

  const curr = CURRENCIES.find((c) => c.code === currencyCode);
  const position = curr ? curr.position : 'before';
  const symbol = currencySymbol || (curr ? curr.symbol : '$');

  if (currencyCode.includes('EUR') || symbol === '€') {
    const formatted = baseUsd.toFixed(2).replace('.', ',');
    return `${formatted} €`;
  }

  const formatted = baseUsd.toFixed(2);
  return position === 'after' ? `${formatted} ${symbol}` : `${symbol}${formatted}`;
}

const PACKAGE_DEFINITIONS = [
  {
    id: 'pkg-24000',
    amountFormatted: '24,000',
    amountNum: 24000,
    originalFormatted: '22,500',
    bonusBadge: '+ 1,500 more',
    baseUsd: 199.99,
    localizedPrices: {
      'US USD': '$199.99',
      'EU EUR': '239,99 €',
      'GB GBP': '£179.99',
      'IN INR': '₹17,999',
      'JP JPY': '¥30,000',
      'BR BRL': 'R$ 1.099,90',
      'CA CAD': '$269.99',
      'AU AUD': 'A$ 299.99',
      'SA SAR': '749.99 ﷼',
      'AE AED': '734.99 د.إ',
      'KR KRW': '₩270,000',
      'TR TRY': '6.799,99 ₺',
    } as Record<string, string>,
    subtotals: {
      'EU EUR': '239,99 €',
      'US USD': '$199.99',
      'GB GBP': '£179.99',
      'IN INR': '₹17,999',
    } as Record<string, string>,
    gsts: {
      'EU EUR': '43,20 €',
      'US USD': '$16.00',
      'GB GBP': '£36.00',
      'IN INR': '₹3,240',
    } as Record<string, string>,
  },
  {
    id: 'pkg-11000',
    amountFormatted: '11,000',
    amountNum: 11000,
    originalFormatted: '10,000',
    bonusBadge: '+ 1,000 more',
    baseUsd: 99.99,
    localizedPrices: {
      'US USD': '$99.99',
      'EU EUR': '119,99 €',
      'GB GBP': '£89.99',
      'IN INR': '₹8,999',
      'JP JPY': '¥15,000',
      'BR BRL': 'R$ 549,90',
      'CA CAD': '$134.99',
      'AU AUD': 'A$ 149.99',
      'SA SAR': '374.99 ﷼',
      'AE AED': '367.99 د.إ',
      'KR KRW': '₩135,000',
      'TR TRY': '3.399,99 ₺',
    } as Record<string, string>,
  },
  {
    id: 'pkg-5250',
    amountFormatted: '5,250',
    amountNum: 5250,
    originalFormatted: '4,500',
    bonusBadge: '+ 750 more',
    baseUsd: 49.99,
    localizedPrices: {
      'US USD': '$49.99',
      'EU EUR': '59,99 €',
      'GB GBP': '£44.99',
      'IN INR': '₹4,499',
      'JP JPY': '¥7,500',
      'BR BRL': 'R$ 274,90',
      'CA CAD': '$67.99',
      'AU AUD': 'A$ 74.99',
      'SA SAR': '187.99 ﷼',
      'AE AED': '183.99 د.إ',
      'KR KRW': '₩67,500',
      'TR TRY': '1.699,99 ₺',
    } as Record<string, string>,
  },
  {
    id: 'pkg-3625',
    amountFormatted: '3,625',
    amountNum: 3625,
    originalFormatted: '3,150',
    bonusBadge: '+ 475 more',
    baseUsd: 34.99,
    localizedPrices: {
      'US USD': '$34.99',
      'EU EUR': '41,99 €',
      'GB GBP': '£31.49',
      'IN INR': '₹3,149',
      'JP JPY': '¥5,250',
      'BR BRL': 'R$ 192,90',
      'CA CAD': '$47.99',
      'AU AUD': 'A$ 52.99',
      'SA SAR': '131.99 ﷼',
      'AE AED': '128.99 د.إ',
      'KR KRW': '₩47,250',
      'TR TRY': '1.189,99 ₺',
    } as Record<string, string>,
  },
  {
    id: 'pkg-2000',
    amountFormatted: '2,000',
    amountNum: 2000,
    originalFormatted: '1,700',
    bonusBadge: '+ 300 more',
    baseUsd: 19.99,
    localizedPrices: {
      'US USD': '$19.99',
      'EU EUR': '23,99 €',
      'GB GBP': '£17.99',
      'IN INR': '₹1,799',
      'JP JPY': '¥3,000',
      'BR BRL': 'R$ 109,90',
      'CA CAD': '$26.99',
      'AU AUD': 'A$ 29.99',
      'SA SAR': '74.99 ﷼',
      'AE AED': '73.49 د.إ',
      'KR KRW': '₩27,000',
      'TR TRY': '679,99 ₺',
    } as Record<string, string>,
  },
  {
    id: 'pkg-1500',
    amountFormatted: '1,500',
    amountNum: 1500,
    originalFormatted: '1,200',
    bonusBadge: '+ 300 more',
    baseUsd: 14.99,
    localizedPrices: {
      'US USD': '$14.99',
      'EU EUR': '17,99 €',
      'GB GBP': '£13.49',
      'IN INR': '₹1,349',
      'JP JPY': '¥2,250',
      'BR BRL': 'R$ 82,90',
      'CA CAD': '$19.99',
      'AU AUD': 'A$ 22.99',
      'SA SAR': '56.99 ﷼',
      'AE AED': '55.49 د.إ',
      'KR KRW': '₩20,250',
      'TR TRY': '509,99 ₺',
    } as Record<string, string>,
  },
  {
    id: 'pkg-1000',
    amountFormatted: '1,000',
    amountNum: 1000,
    originalFormatted: '800',
    bonusBadge: '+ 200 more',
    baseUsd: 9.99,
    isFeatured: true,
    localizedPrices: {
      'US USD': '$9.99',
      'EU EUR': '11,99 €',
      'GB GBP': '£8.99',
      'IN INR': '₹899',
      'JP JPY': '¥1,500',
      'BR BRL': 'R$ 54,90',
      'CA CAD': '$13.49',
      'AU AUD': 'A$ 14.99',
      'SA SAR': '37.49 ﷼',
      'AE AED': '36.79 د.إ',
      'KR KRW': '₩13,500',
      'TR TRY': '339,99 ₺',
    } as Record<string, string>,
  },
  {
    id: 'pkg-500',
    amountFormatted: '500',
    amountNum: 500,
    originalFormatted: '400',
    bonusBadge: '+ 100 more',
    baseUsd: 4.99,
    localizedPrices: {
      'US USD': '$4.99',
      'EU EUR': '5,99 €',
      'GB GBP': '£4.49',
      'IN INR': '₹449',
      'JP JPY': '¥750',
      'BR BRL': 'R$ 27,90',
      'CA CAD': '$6.79',
      'AU AUD': 'A$ 7.49',
      'SA SAR': '18.79 ﷼',
      'AE AED': '18.39 د.إ',
      'KR KRW': '₩6,750',
      'TR TRY': '169,99 ₺',
    } as Record<string, string>,
  },
];

export function getRobuxPackages(currencyCode: string = 'US USD', currencySymbol: string = '$'): RobuxPackageItem[] {
  return PACKAGE_DEFINITIONS.map((def) => {
    const priceFormatted = formatPriceWithCurrency(
      def.baseUsd,
      currencyCode,
      currencySymbol,
      def.localizedPrices
    );

    const subtotalFormatted = def.subtotals && def.subtotals[currencyCode]
      ? def.subtotals[currencyCode]
      : priceFormatted;

    const gstFormatted = def.gsts && def.gsts[currencyCode]
      ? def.gsts[currencyCode]
      : undefined;

    return {
      id: def.id,
      amountFormatted: def.amountFormatted,
      amountNum: def.amountNum,
      originalFormatted: def.originalFormatted,
      bonusBadge: def.bonusBadge,
      isFeatured: def.isFeatured,
      priceFormatted,
      subtotalFormatted,
      gstFormatted,
    };
  });
}

export function getPlusPlans(currencyCode: string = 'US USD', currencySymbol: string = '$'): PlusSubscriptionPlan[] {
  const pBase = formatPriceWithCurrency(4.99, currencyCode, currencySymbol, {
    'US USD': '$4.99',
    'EU EUR': '5,99 €',
    'GB GBP': '£4.49',
    'IN INR': '₹449',
    'JP JPY': '¥750',
    'BR BRL': 'R$ 27,90',
    'CA CAD': '$6.79',
    'AU AUD': 'A$ 7.49',
    'SA SAR': '18.79 ﷼',
    'AE AED': '18.39 د.إ',
    'KR KRW': '₩6,750',
    'TR TRY': '169,99 ₺',
  });

  const p500 = formatPriceWithCurrency(9.99, currencyCode, currencySymbol, {
    'US USD': '$9.99',
    'EU EUR': '10,99 €',
    'GB GBP': '£8.99',
    'IN INR': '₹899',
    'JP JPY': '¥1,500',
    'BR BRL': 'R$ 54,90',
    'CA CAD': '$13.49',
    'AU AUD': 'A$ 14.99',
    'SA SAR': '37.49 ﷼',
    'AE AED': '36.79 د.إ',
    'KR KRW': '₩13,500',
    'TR TRY': '339,99 ₺',
  });

  const p500Orig = formatPriceWithCurrency(11.99, currencyCode, currencySymbol, {
    'US USD': '$11.99',
    'EU EUR': '11,99 €',
    'GB GBP': '£9.99',
    'IN INR': '₹1,099',
    'JP JPY': '¥1,800',
    'BR BRL': 'R$ 64,90',
    'CA CAD': '$15.99',
    'AU AUD': 'A$ 17.99',
  });

  const p1000 = formatPriceWithCurrency(14.99, currencyCode, currencySymbol, {
    'US USD': '$14.99',
    'EU EUR': '15,99 €',
    'GB GBP': '£13.49',
    'IN INR': '₹1,349',
    'JP JPY': '¥2,250',
    'BR BRL': 'R$ 82,90',
    'CA CAD': '$19.99',
    'AU AUD': 'A$ 22.99',
    'SA SAR': '56.99 ﷼',
    'AE AED': '55.49 د.إ',
    'KR KRW': '₩20,250',
    'TR TRY': '509,99 ₺',
  });

  const p1000Orig = formatPriceWithCurrency(17.99, currencyCode, currencySymbol, {
    'US USD': '$17.99',
    'EU EUR': '17,99 €',
    'GB GBP': '£15.99',
    'IN INR': '₹1,599',
    'JP JPY': '¥2,700',
    'BR BRL': 'R$ 99,90',
    'CA CAD': '$23.99',
    'AU AUD': 'A$ 26.99',
  });

  const p2000 = formatPriceWithCurrency(24.99, currencyCode, currencySymbol, {
    'US USD': '$24.99',
    'EU EUR': '25,99 €',
    'GB GBP': '£22.49',
    'IN INR': '₹2,249',
    'JP JPY': '¥3,750',
    'BR BRL': 'R$ 137,90',
    'CA CAD': '$33.99',
    'AU AUD': 'A$ 37.49',
    'SA SAR': '93.99 ﷼',
    'AE AED': '91.99 د.إ',
    'KR KRW': '₩33,750',
    'TR TRY': '849,99 ₺',
  });

  const p2000Orig = formatPriceWithCurrency(29.99, currencyCode, currencySymbol, {
    'US USD': '$29.99',
    'EU EUR': '29,99 €',
    'GB GBP': '£26.99',
    'IN INR': '₹2,699',
    'JP JPY': '¥4,500',
    'BR BRL': 'R$ 164,90',
    'CA CAD': '$39.99',
    'AU AUD': 'A$ 44.99',
  });

  return [
    {
      id: 'plus-base',
      title: 'Roblox Plus',
      priceFormatted: pBase,
      periodFormatted: `${pBase}/month`,
      features: [
        { text: 'Up to 20% off on items and avatars', icon: 'tag' },
        { text: 'Free private servers', icon: 'gamepad' },
        { text: 'Send Robux for free', icon: 'robux' },
        { text: 'Customize profile and app theme', icon: 'brush' },
      ],
    },
    {
      id: 'plus-500',
      title: 'Plus 500',
      originalPrice: p500Orig,
      priceFormatted: p500,
      periodFormatted: `${p500}/month`,
      robuxPerMonth: 500,
      features: [
        { text: 'Everything in Plus', icon: 'plus' },
        { text: '+500 Robux every month', icon: 'robux' },
        { text: `${p500Orig} total value`, icon: 'piggy' },
      ],
    },
    {
      id: 'plus-1000',
      title: 'Plus 1000',
      originalPrice: p1000Orig,
      priceFormatted: p1000,
      periodFormatted: `${p1000}/month`,
      robuxPerMonth: 1000,
      features: [
        { text: 'Everything in Plus', icon: 'plus' },
        { text: '+1,000 Robux every month', icon: 'robux' },
        { text: `${p1000Orig} total value`, icon: 'piggy' },
      ],
    },
    {
      id: 'plus-2000',
      title: 'Plus 2000',
      originalPrice: p2000Orig,
      priceFormatted: p2000,
      periodFormatted: `${p2000}/month`,
      robuxPerMonth: 2000,
      features: [
        { text: 'Everything in Plus', icon: 'plus' },
        { text: '+2,000 Robux every month', icon: 'robux' },
        { text: `${p2000Orig} total value`, icon: 'piggy' },
      ],
    },
  ];
}
