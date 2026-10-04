import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X,
  Check,
  Search,
  Info,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  Tag,
  Gamepad2,
  Paintbrush,
  PiggyBank,
  Star,
  Send,
  Clock,
  Sparkles,
} from 'lucide-react';
import { RobuxIcon } from './RobuxIcon';
import { RobloxVerifiedBadge } from './RobloxVerifiedBadge';
import { RobloxPlusBadge } from './RobloxPlusBadge';
import { RivalsBonusItemCard } from './RivalsBonusItemCard';
import brainrotX2Logo from '../assets/images/brainrot_x2_logo_1789303481905.jpg';
import { CheckoutModal, CheckoutPackage } from './CheckoutModal';
import { RobloxPlusCheckoutModal } from './RobloxPlusCheckoutModal';
import { getRobuxPackages, getPlusPlans } from '../utils/currency';

interface RobuxShopWindowProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  displayName: string;
  isVerified: boolean;
  hasRobloxPlus?: boolean;
  robux: number;
  onAddRobux: (amount: number) => void;
  onInitiateSend: (recipientUsername: string) => void;
  friends?: Array<{ id: string; username: string; avatarUrl: string }>;
  theme?: 'dark' | 'light';
  currency?: string;
  currencySymbol?: string;
}

// Icon for Roblox Plus ('P' tilted polygon)
function formatRobuxCompact(amount: number): string {
  if (!amount || amount <= 0) return '0';
  if (amount >= 1_000_000_000) {
    const val = (amount / 1_000_000_000).toFixed(1).replace(/\.0$/, '');
    return `${val}B+`;
  }
  if (amount >= 1_000_000) {
    const val = (amount / 1_000_000).toFixed(1).replace(/\.0$/, '');
    return `${val}M+`;
  }
  if (amount >= 1_000) {
    const val = (amount / 1_000).toFixed(1).replace(/\.0$/, '');
    return `${val}K+`;
  }
  return amount.toLocaleString('en-US');
}

export function RobloxPlusIcon({ className = 'w-4 h-4 shrink-0' }: { className?: string }) {
  return <RobloxPlusBadge className={className} />;
}

interface BonusPackageItem {
  id: string;
  amountFormatted: string;
  amountNum: number;
  originalFormatted: string;
  bonusBadge: string;
  priceFormatted: string;
}

interface StandardPackageItem {
  id: string;
  amountFormatted: string;
  amountNum: number;
  originalFormatted: string;
  bonusBadge: string;
  priceFormatted: string;
  isFeatured?: boolean;
}

interface PlusSubscriptionPlan {
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

// Exact text from Screenshots 5, 6, 7, 8, 9
const FAQS = [
  {
    id: 'faq-1',
    question: 'What are Robux?',
    answer:
      'Robux is the virtual currency that can be purchased using your local currency or with Roblox Gift Card credits. It allows users to customize their avatar and purchase special abilities and items in experiences.',
  },
  {
    id: 'faq-2',
    question: 'Where are my Robux?',
    answer:
      'Your Robux balance and transaction history can be found under My Transactions.\n\nIn the desktop and mobile app, you can find your Robux balance by logging into the account where the Robux were purchased or earned, tapping on the Robux icon at the top right of the app, and see your balance displayed at the top.\n\nOn the web browser, log in to the account where the Robux were purchased or earned and your Robux balance is shown in the upper right corner.',
  },
  {
    id: 'faq-3',
    question: 'Do Robux expire?',
    answer:
      'Robux do not expire. Once purchased, they will remain in the user’s account until they are spent. Users can hold onto and utilize their Robux at any time.',
  },
  {
    id: 'faq-4',
    question: 'How to redeem your gift card?',
    answer:
      'Roblox Gift Cards can be redeemed in a browser at roblox.com/redeem.',
  },
];

export function RobuxShopWindow({
  isOpen,
  onClose,
  username,
  displayName,
  isVerified,
  hasRobloxPlus = false,
  robux,
  onAddRobux,
  onInitiateSend,
  friends = [],
  theme = 'dark',
  currency = 'US USD',
  currencySymbol = '$',
}: RobuxShopWindowProps) {
  const isDark = theme === 'dark';
  const [openFaqIds, setOpenFaqIds] = useState<Record<string, boolean>>({});
  const [purchaseToast, setPurchaseToast] = useState<string | null>(null);
  const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false);
  const [selectedCheckoutPackage, setSelectedCheckoutPackage] = useState<CheckoutPackage | null>(null);
  const [selectedPlusPlan, setSelectedPlusPlan] = useState<PlusSubscriptionPlan | null>(null);

  // Dynamically formatted packages and plus plans based on chosen currency
  const robuxPackages = useMemo(
    () => getRobuxPackages(currency, currencySymbol),
    [currency, currencySymbol]
  );
  const plusPlans = useMemo(
    () => getPlusPlans(currency, currencySymbol),
    [currency, currencySymbol]
  );

  // Split packages: packages >= 2,000 Robux are joined with the banner, packages < 2,000 Robux are titled "Robux packages"
  const bonusBannerPackages = useMemo(
    () => robuxPackages.filter((pkg) => pkg.amountNum >= 2000),
    [robuxPackages]
  );
  const standardPackages = useMemo(
    () => robuxPackages.filter((pkg) => pkg.amountNum < 2000),
    [robuxPackages]
  );

  // Carousel navigation for "New on Roblox"
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollState = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(checkScrollState, 150);
    }
  }, [isOpen]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const offset = direction === 'left' ? -310 : 310;
      carouselRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(checkScrollState, 350);
    }
  };

  if (!isOpen) return null;

  const handleOpenCheckout = (pkg: {
    amountNum: number;
    amountFormatted?: string;
    originalFormatted?: string;
    bonusFormatted?: string;
    priceFormatted?: string;
    subtotalFormatted?: string;
    gstFormatted?: string;
  }) => {
    const is24k = pkg.amountNum === 24000;
    const checkoutData: CheckoutPackage = {
      amountNum: pkg.amountNum,
      amountFormatted: pkg.amountFormatted || pkg.amountNum.toLocaleString('en-US'),
      originalFormatted:
        pkg.originalFormatted ||
        (is24k ? '22,500' : `${Math.round(pkg.amountNum * 0.85).toLocaleString('en-US')}`),
      bonusFormatted:
        pkg.bonusFormatted ||
        (is24k
          ? '+1,500 bonus'
          : `+${(pkg.amountNum - Math.round(pkg.amountNum * 0.85)).toLocaleString('en-US')} bonus`),
      priceFormatted: pkg.priceFormatted || '11,99 €',
      subtotalFormatted:
        pkg.subtotalFormatted || pkg.priceFormatted || '11,99 €',
      gstFormatted: pkg.gstFormatted,
    };
    setSelectedCheckoutPackage(checkoutData);
  };

  const handleCompleteCheckout = (amountNum: number) => {
    onAddRobux(amountNum);
    setPurchaseToast(`Added +${amountNum.toLocaleString()} Robux to your balance!`);
    setTimeout(() => setPurchaseToast(null), 4000);
  };

  const handleSelectSubscription = (plan: PlusSubscriptionPlan) => {
    setSelectedPlusPlan(plan);
  };

  const toggleFaq = (id: string) => {
    setOpenFaqIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div
      id="robux-shop-window"
      className={`fixed inset-0 z-50 overflow-y-auto flex flex-col font-sans select-none ${
        isDark ? 'bg-[#0b0c10] text-white' : 'bg-[#ffffff] text-neutral-900'
      }`}
    >
      {/* Top Header Bar */}
      <header className={`sticky top-0 z-30 px-4 sm:px-8 py-3 flex items-center justify-between border-b backdrop-blur-sm transition-colors ${
        isDark ? 'bg-[#0e0f14]/95 border-[#1f2229]' : 'bg-white/95 border-transparent'
      }`}>
        {/* Left: Close button (X) */}
        <button
          type="button"
          onClick={onClose}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            isDark ? 'text-neutral-300 hover:text-white hover:bg-[#232527]' : 'text-neutral-800 hover:bg-neutral-100'
          }`}
          title="Close Shop"
        >
          <X className="w-5 h-5 stroke-[2]" />
        </button>

        {/* Center: Username: 13+ and Balance: X Robux (matches pic 1) */}
        <div className="flex flex-col items-center justify-center text-center italic">
          <span className={`text-[11px] sm:text-xs font-medium tracking-tight italic ${
            isDark ? 'text-neutral-400' : 'text-neutral-500'
          }`}>
            {username?.replace(/^@/, '') || 'Bugsbunnyboy1012'}: 13+
          </span>
          <span className={`text-xs sm:text-sm font-semibold tracking-tight italic ${
            isDark ? 'text-white' : 'text-neutral-800'
          }`}>
            Balance: {robux.toLocaleString('en-US')} Robux
          </span>
        </div>

        {/* Right: Balancing spacer */}
        <div className="w-10 h-10 flex items-center justify-end" />
      </header>

      {/* Action Row Below the Line: Robux Amount & Send Option */}
      <div className="relative z-20 w-full px-4 sm:px-8 pt-3 pb-1 flex items-center justify-end">
        <div
          id="shop-send-robux-container"
          className={`rounded-full p-1 pl-4 pr-1 flex items-center gap-3 border shadow-md transition-all ${
            isDark
              ? 'bg-[#12141a] border-[#252834]'
              : 'bg-[#f0f2f5] border-neutral-200/80'
          }`}
        >
          {/* Robux Amount (formatted like 17.2M+) */}
          <div className={`flex items-center gap-2 py-0.5 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            <RobuxIcon className={`w-5 h-5 sm:w-5.5 sm:h-5.5 shrink-0 ${isDark ? 'text-white' : 'text-neutral-900'}`} />
            <span className="text-sm sm:text-base font-bold tracking-tight leading-none">
              {formatRobuxCompact(robux)}
            </span>
          </div>

          {/* Send Option Button (Matches screenshot: rounded capsule button with dark navy-slate tint and subtle border) */}
          <button
            type="button"
            id="shop-top-send-robux-button"
            onClick={() => onInitiateSend && onInitiateSend('')}
            className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-[20px] sm:rounded-full flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-normal transition-all cursor-pointer active:scale-95 ${
              isDark
                ? 'bg-[#222735] hover:bg-[#2c3244] text-white border border-[#353c50] shadow-xs'
                : 'bg-[#d6d9e0] hover:bg-[#cbd0d9] text-[#1a1d24] border border-neutral-300/60 shadow-xs'
            }`}
            title="Send Robux"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0"
            >
              <line x1="12" y1="5" x2="12" y2="15" />
              <polyline points="7.5 9.5 12 5 16.5 9.5" />
              <line x1="6" y1="19" x2="18" y2="19" />
            </svg>
            <span>Send</span>
          </button>
        </div>
      </div>

      {/* Purchase Notification Toast */}
      {purchaseToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#161922] text-white border border-[#2e3445] px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="w-4 h-4 text-[#10b981]" />
          <span>{purchaseToast}</span>
        </div>
      )}

      {/* Main Content Body */}
      <main className="relative z-10 flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-2 pb-20 space-y-8">
        {/* Large Centered Title */}
        <div className="relative w-full text-center py-8 sm:py-12 flex flex-col items-center justify-center">
          <h1 className={`relative z-10 text-3xl sm:text-5xl lg:text-[54px] font-black tracking-tight leading-[1.12] drop-shadow-sm ${
            isDark ? 'text-white' : 'text-neutral-900'
          }`}>
            Enjoy up to 25%<br />more Robux
          </h1>
        </div>

        {/* SECTION 1: Bonus item we picked for you + Joined Robux packages (till 2000 robux) */}
        <RivalsBonusItemCard isDark={isDark}>
          {bonusBannerPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`p-3.5 sm:p-4.5 flex items-center justify-between transition-colors ${
                isDark ? 'hover:bg-[#111317]' : 'hover:bg-neutral-50/70'
              }`}
            >
              {/* Left side info */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <RobuxIcon className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 ${isDark ? 'text-white' : 'text-neutral-900'}`} />
                <span className={`text-base sm:text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                  {pkg.amountFormatted}
                </span>

                <div className="flex items-center gap-1 text-neutral-400">
                  <RobuxIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="text-xs sm:text-sm font-medium line-through">
                    {pkg.originalFormatted}
                  </span>
                </div>

                <span className={`text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  isDark ? 'text-neutral-300 bg-[#171920]' : 'text-neutral-600 bg-[#eff1f4]'
                }`}>
                  {pkg.bonusBadge}
                </span>

                {/* "For you" special badge if featured */}
                {pkg.isFeatured && (
                  <span className={`text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                    isDark ? 'text-neutral-200 bg-[#1b1e28]' : 'text-neutral-700 bg-[#f0f2f5]'
                  }`}>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>For you</span>
                  </span>
                )}
              </div>

              {/* Right button */}
              <button
                type="button"
                onClick={() =>
                  handleOpenCheckout({
                    amountNum: pkg.amountNum,
                    amountFormatted: pkg.amountFormatted,
                    originalFormatted: pkg.originalFormatted,
                    bonusFormatted: pkg.bonusBadge.replace('more', 'bonus'),
                    priceFormatted: pkg.priceFormatted,
                    subtotalFormatted: pkg.amountNum === 24000 ? '239,99 €' : pkg.priceFormatted,
                    gstFormatted: pkg.amountNum === 24000 ? '43,20 €' : undefined,
                  })
                }
                className={`text-xs sm:text-sm font-bold px-6 sm:px-8 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 shadow-2xs ${
                  pkg.isFeatured
                    ? 'bg-[#0055ff] hover:bg-[#0047e0] text-white active:scale-98 shadow-sm'
                    : isDark
                    ? 'bg-[#16181e] hover:bg-[#22252c] text-white active:scale-98 border border-white/10'
                    : 'bg-[#e4e6eb] hover:bg-[#d8dadf] text-neutral-800 active:scale-98'
                }`}
              >
                {pkg.priceFormatted}
              </button>
            </div>
          ))}
        </RivalsBonusItemCard>

        {/* SECTION 2: Robux packages (below 2000 robux) */}
        <section className="space-y-3 pt-2">
          <h2 className={`text-base sm:text-lg font-bold tracking-tight ${
            isDark ? 'text-white' : 'text-neutral-900'
          }`}>
            Robux packages
          </h2>

          <div className={`rounded-2xl sm:rounded-3xl border shadow-xs overflow-hidden divide-y ${
            isDark ? 'bg-black border-[#26282c] divide-[#1c1e22]' : 'bg-white border-neutral-200/80 divide-neutral-100'
          }`}>
            {standardPackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`p-3.5 sm:p-4.5 flex items-center justify-between transition-colors ${
                  isDark ? 'hover:bg-[#111317]' : 'hover:bg-neutral-50/70'
                }`}
              >
                {/* Left side info */}
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <RobuxIcon className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 ${isDark ? 'text-white' : 'text-neutral-900'}`} />
                  <span className={`text-base sm:text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                    {pkg.amountFormatted}
                  </span>

                  <div className="flex items-center gap-1 text-neutral-400">
                    <RobuxIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-medium line-through">
                      {pkg.originalFormatted}
                    </span>
                  </div>

                  <span className={`text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    isDark ? 'text-neutral-300 bg-[#171920]' : 'text-neutral-600 bg-[#eff1f4]'
                  }`}>
                    {pkg.bonusBadge}
                  </span>

                  {/* "For you" special badge on row 2 */}
                  {pkg.isFeatured && (
                    <span className={`text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      isDark ? 'text-neutral-200 bg-[#1b1e28]' : 'text-neutral-700 bg-[#f0f2f5]'
                    }`}>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>For you</span>
                    </span>
                  )}
                </div>

                {/* Right button (Featured row is BLUE #0055ff, others are dark/black pills) */}
                <button
                  type="button"
                  onClick={() =>
                    handleOpenCheckout({
                      amountNum: pkg.amountNum,
                      amountFormatted: pkg.amountFormatted,
                      originalFormatted: pkg.originalFormatted,
                      bonusFormatted: pkg.bonusBadge.replace('more', 'bonus'),
                      priceFormatted: pkg.priceFormatted,
                      subtotalFormatted: pkg.amountNum === 24000 ? '239,99 €' : pkg.priceFormatted,
                      gstFormatted: pkg.amountNum === 24000 ? '43,20 €' : undefined,
                    })
                  }
                  className={`text-xs sm:text-sm font-bold px-6 sm:px-8 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 shadow-2xs ${
                    pkg.isFeatured
                      ? 'bg-[#0055ff] hover:bg-[#0047e0] text-white active:scale-98 shadow-sm'
                      : isDark
                      ? 'bg-[#16181e] hover:bg-[#22252c] text-white active:scale-98 border border-white/10'
                      : 'bg-[#e4e6eb] hover:bg-[#d8dadf] text-neutral-800 active:scale-98'
                  }`}
                >
                  {pkg.priceFormatted}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: New on Roblox */}
        <section className="space-y-3 pt-2">
          {/* Header Row with Roblox Plus Icon + Title & Learn more */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RobloxPlusIcon className={`w-5 h-5 ${isDark ? 'text-white' : 'text-neutral-900'}`} />
              <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                New on Roblox
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsLearnMoreOpen(true)}
              className={`text-xs sm:text-sm font-semibold hover:underline cursor-pointer ${
                isDark ? 'text-neutral-300 hover:text-white' : 'text-neutral-700'
              }`}
            >
              Learn more
            </button>
          </div>

          {/* Carousel Viewport with Left/Right Arrows */}
          <div className="relative">
            {/* Left Scroll Arrow */}
            {canScrollLeft && (
              <button
                type="button"
                onClick={() => scrollCarousel('left')}
                className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20 cursor-pointer transition-transform active:scale-95 ${
                  isDark ? 'bg-[#202430] hover:bg-[#2c3242] text-white border border-neutral-700' : 'bg-[#1c1c1f] hover:bg-black text-white'
                }`}
                title="Previous"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Right Scroll Arrow */}
            {canScrollRight && (
              <button
                type="button"
                onClick={() => scrollCarousel('right')}
                className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 cursor-pointer transition-transform active:scale-95 ${
                  isDark ? 'bg-[#202430] hover:bg-[#2c3242] text-white border border-neutral-700' : 'bg-[#1c1c1f] hover:bg-black text-white'
                }`}
                title="Next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Scrollable Container */}
            <div
              ref={carouselRef}
              onScroll={checkScrollState}
              className="flex gap-4 overflow-x-auto scrollbar-none py-1 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {plusPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`w-[270px] sm:w-[285px] rounded-2xl border p-4.5 flex flex-col justify-between shrink-0 shadow-xs transition-colors ${
                    isDark
                      ? 'bg-black border-[#26282c] text-white hover:border-neutral-700'
                      : 'bg-white border-neutral-200/90 text-neutral-900 hover:border-neutral-300'
                  }`}
                >
                  <div>
                    {/* Top Row: Title + Price */}
                    <div className="flex items-start justify-between gap-2 pb-5">
                      <span className={`text-sm sm:text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        {plan.title}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                        {plan.originalPrice && (
                          <span className="text-neutral-400 line-through">
                            {plan.originalPrice}
                          </span>
                        )}
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                          {plan.priceFormatted}
                        </span>
                      </div>
                    </div>

                    {/* Features List with icons */}
                    <div className="space-y-3 pb-6">
                      {plan.features.map((feature, fIdx) => (
                        <div key={fIdx} className={`flex items-center gap-2.5 text-xs sm:text-[13px] ${isDark ? 'text-neutral-300' : 'text-neutral-800'}`}>
                          {feature.icon === 'tag' && (
                            <Tag className={`w-4 h-4 shrink-0 ${isDark ? 'text-neutral-400' : 'text-neutral-700'}`} />
                          )}
                          {feature.icon === 'gamepad' && (
                            <Gamepad2 className={`w-4 h-4 shrink-0 ${isDark ? 'text-neutral-400' : 'text-neutral-700'}`} />
                          )}
                          {feature.icon === 'robux' && (
                            <RobuxIcon className={`w-4 h-4 shrink-0 ${isDark ? 'text-neutral-400' : 'text-neutral-700'}`} />
                          )}
                          {feature.icon === 'brush' && (
                            <Paintbrush className={`w-4 h-4 shrink-0 ${isDark ? 'text-neutral-400' : 'text-neutral-700'}`} />
                          )}
                          {feature.icon === 'plus' && (
                            <RobloxPlusIcon className={`w-4 h-4 shrink-0 ${isDark ? 'text-neutral-400' : 'text-neutral-700'}`} />
                          )}
                          {feature.icon === 'piggy' && (
                            <PiggyBank className={`w-4 h-4 shrink-0 ${isDark ? 'text-neutral-400' : 'text-neutral-700'}`} />
                          )}
                          <span className="leading-snug">{feature.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Subscription Button */}
                  <button
                    type="button"
                    onClick={() => handleSelectSubscription(plan)}
                    className={`w-full active:scale-98 text-xs sm:text-sm font-bold py-2.5 rounded-xl transition-all cursor-pointer shadow-2xs ${
                      isDark
                        ? 'bg-[#16181e] hover:bg-[#22252c] text-white border border-white/10'
                        : 'bg-[#e4e6eb] hover:bg-[#d8dadf] text-neutral-800'
                    }`}
                  >
                    {plan.periodFormatted}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4: FAQ */}
        <section className="space-y-3 pt-2">
          <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            FAQ
          </h2>

          <div className="space-y-2.5">
            {FAQS.map((faq) => {
              const isOpen = !!openFaqIds[faq.id];
              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border overflow-hidden shadow-xs transition-colors ${
                    isDark
                      ? 'bg-black border-[#26282c] hover:border-neutral-700'
                      : 'bg-white border-neutral-200/90 hover:border-neutral-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    className={`w-full text-left p-4 sm:p-5 flex items-center justify-between font-medium text-xs sm:text-sm cursor-pointer select-none ${
                      isDark ? 'text-neutral-200 hover:text-white' : 'text-neutral-800 hover:text-neutral-900'
                    }`}
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-neutral-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className={`px-4 sm:px-5 pb-5 text-xs sm:text-sm leading-relaxed whitespace-pre-line border-t pt-3 animate-in fade-in duration-150 ${
                      isDark ? 'text-neutral-300 border-[#202432]' : 'text-neutral-700 border-neutral-100'
                    }`}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Learn More Modal */}
      {isLearnMoreOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsLearnMoreOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-black text-white w-full max-w-md rounded-2xl border border-[#26282c] shadow-2xl p-5 space-y-3.5 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#222634]">
              <div className="flex items-center gap-2">
                <RobloxPlusIcon className="w-5 h-5 text-white" />
                <h3 className="font-bold text-base text-white">About Roblox Plus</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLearnMoreOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Roblox Plus gives you exclusive benefits every month, including discounts on avatar shop items, free access to select private servers, and the ability to transfer Robux to friends with zero fees. Upgrade anytime with higher tier monthly stipends.
            </p>
            <button
              type="button"
              onClick={() => setIsLearnMoreOpen(false)}
              className="w-full py-2 bg-[#242833] hover:bg-[#323847] text-white rounded-xl text-xs font-bold border border-white/10 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Real Checkout Window (Payment Selection -> Card / PayPal / Redeem Card -> Completed Screen) */}
      {selectedCheckoutPackage && (
        <CheckoutModal
          isOpen={Boolean(selectedCheckoutPackage)}
          onClose={() => setSelectedCheckoutPackage(null)}
          packageInfo={selectedCheckoutPackage}
          username={username}
          currentRobux={robux}
          currencySymbol={currencySymbol}
          onCompletePurchase={(amt) => handleCompleteCheckout(amt)}
        />
      )}

      {/* Roblox Plus Checkout Window (Secure Payment with Roblox - Black Background & PayPal selection) */}
      {selectedPlusPlan && (
        <RobloxPlusCheckoutModal
          isOpen={Boolean(selectedPlusPlan)}
          onClose={() => setSelectedPlusPlan(null)}
          planTitle={selectedPlusPlan.title}
          priceFormatted={
            currency === 'IN INR'
              ? selectedPlusPlan.priceFormatted
              : '₹500.00'
          }
          renewsOn="10/20/2026"
        />
      )}
    </div>
  );
}
