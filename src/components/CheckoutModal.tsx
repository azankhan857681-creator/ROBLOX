import React, { useState } from 'react';
import {
  X,
  ArrowLeft,
  Check,
  CreditCard,
  HelpCircle,
  Mail,
  Loader2,
  Lock,
  ChevronUp,
  Sparkles,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { RobuxIcon } from './RobuxIcon';

export interface CheckoutPackage {
  amountNum: number;
  amountFormatted: string;
  originalFormatted: string;
  bonusFormatted: string;
  priceFormatted: string;
  subtotalFormatted: string;
  gstFormatted?: string;
  bonusItemName?: string;
  bonusItemDesc?: string;
  bonusItemImage?: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageInfo: CheckoutPackage;
  username: string;
  currentRobux: number;
  onCompletePurchase: (amount: number, bonusItem?: string) => void;
  currencySymbol?: string;
}

// Crisp SVGs for payment method badges matching Roblox checkout
function VisaLogo({ className = 'h-3.5 w-auto' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 16" fill="none">
      <path
        d="M19.1 1.2L13.9 14.8H9.8L6.4 3.7C6.2 2.9 6 2.6 5.3 2.2C4.1 1.6 2.1 1 0.5 0.7L0.6 0.2H7.4C8.3 0.2 9.1 0.8 9.3 1.9L10.9 10.5L15.1 0.2H19.1ZM35.7 10.3C35.8 6.4 30.3 6.2 30.4 4.4C30.4 3.9 30.9 3.3 32.1 3.2C32.7 3.1 34.3 3 35.8 3.7L36.5 0.8C35.6 0.5 34.3 0.2 32.7 0.2C28.8 0.2 26 2.3 26 5.3C25.9 7.5 27.9 8.8 29.4 9.5C31 10.3 31.5 10.8 31.5 11.5C31.5 12.6 30.2 13.1 29 13.1C27 13.1 25.8 12.6 24.8 12.1L24.1 15.2C25.2 15.7 26.9 16.1 28.7 16.1C32.9 16.1 35.6 14 35.7 10.3ZM46.3 14.8H49.8L46.8 0.2H43.6C42.8 0.2 42.1 0.6 41.8 1.4L35.7 14.8H39.8L40.6 12.6H45.7L46.3 14.8ZM41.8 9.6L43.8 3.9L45.1 9.6H41.8ZM25.4 0.2L22.2 14.8H18.3L21.5 0.2H25.4Z"
        fill="#1A1F71"
      />
    </svg>
  );
}

function MastercardLogo({ className = 'h-4 w-auto' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="#EB001B" />
      <circle cx="22" cy="10" r="10" fill="#F79E1B" />
      <path
        d="M16 3.1a9.96 9.96 0 0 1 3.8 6.9 9.96 9.96 0 0 1-3.8 6.9 9.96 9.96 0 0 1-3.8-6.9c0-2.7 1.4-5.1 3.8-6.9z"
        fill="#FF5F00"
      />
    </svg>
  );
}

function DiscoverLogo({ className = 'h-3.5 w-auto' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 70 14" fill="none">
      <text
        x="0"
        y="11"
        fill="#231F20"
        fontFamily="sans-serif"
        fontWeight="900"
        fontSize="12"
        letterSpacing="0.5"
      >
        DISC
      </text>
      <circle cx="39" cy="7.5" r="5.5" fill="#F68B1F" />
      <text
        x="46"
        y="11"
        fill="#231F20"
        fontFamily="sans-serif"
        fontWeight="900"
        fontSize="12"
        letterSpacing="0.5"
      >
        VER
      </text>
    </svg>
  );
}

function AmexLogo({ className = 'h-3.5 w-auto' }: { className?: string }) {
  return (
    <div className="bg-[#006FCF] text-white font-black text-[9px] px-1 py-0.5 rounded-xs leading-none tracking-tighter shrink-0 flex items-center justify-center font-sans">
      AMEX
    </div>
  );
}

function PaypalLogo({ className = 'h-5 w-auto' }: { className?: string }) {
  return (
    <div className="flex items-center gap-1">
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path
          d="M7 21L9.2 6.5H16.2C18.6 6.5 20.2 7.7 19.8 10.1C19.4 12.3 17.6 13.6 15.3 13.6H12.4L11.2 21H7Z"
          fill="#003087"
        />
        <path
          d="M9.5 17.5L11 7.8H17.2C19.3 7.8 20.8 8.8 20.4 11C20 13 18.4 14.1 16.4 14.1H13.8L12.7 21H9.5L9.5 17.5Z"
          fill="#0079C1"
          opacity="0.8"
        />
      </svg>
      <span className="font-extrabold italic text-sm text-[#003087] tracking-tight">
        Pay<span className="text-[#0079C1]">Pal</span>
      </span>
    </div>
  );
}

function RobloxCardLogo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <div className={`bg-black rounded-md flex items-center justify-center shrink-0 ${className}`}>
      <div className="w-2.5 h-2.5 bg-white -rotate-12 rounded-2xs flex items-center justify-center">
        <div className="w-1 h-1 bg-black rounded-3xs" />
      </div>
    </div>
  );
}

export function CheckoutModal({
  isOpen,
  onClose,
  packageInfo,
  username,
  currentRobux,
  onCompletePurchase,
  currencySymbol = '$',
}: CheckoutModalProps) {
  type CheckoutStep = 'select_payment' | 'credit_card' | 'paypal' | 'redeem_card' | 'success';
  const [step, setStep] = useState<CheckoutStep>('select_payment');

  // Form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [cardError, setCardError] = useState<string | null>(null);

  // Redeem code states
  const [redeemCode, setRedeemCode] = useState('');
  const [isCodeRedeemed, setIsCodeRedeemed] = useState(false);
  const [redeemFeedback, setRedeemFeedback] = useState<string | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  // Processing loader
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep('select_payment');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setBillingEmail('');
    setCardError(null);
    setRedeemCode('');
    setIsCodeRedeemed(false);
    setRedeemFeedback(null);
    setRedeemError(null);
    setIsProcessing(false);
    onClose();
  };

  // Prevent typing any letters into card number, expiry, and CVV fields
  const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'].includes(
        e.key
      ) ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }
    // Block letters and all non-digit characters
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
    if (cardError) setCardError(null);
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 4);
    let formatted = digitsOnly;
    if (digitsOnly.length > 2) {
      formatted = `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
    }
    setCardExpiry(formatted);
    if (cardError) setCardError(null);
  };

  const handleCardCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardCvv(digitsOnly);
    if (cardError) setCardError(null);
  };

  const handleCardSubmit = () => {
    // If user didn't write anything in card fields, show error message
    if (!cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
      setCardError('Please enter your card information to proceed');
      return;
    }
    setCardError(null);
    handleProcessPayment('card');
  };

  const handleProcessPayment = (methodName: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep('success');
      onCompletePurchase(packageInfo.amountNum);
    }, 1200);
  };

  // Redeem code input handler
  const handleRedeemCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRedeemCode(e.target.value.toUpperCase());
    if (redeemError) setRedeemError(null);
  };

  const handleApplyRedeemCode = () => {
    if (!redeemCode.trim()) {
      setRedeemError('Please enter a redeem code');
      setRedeemFeedback(null);
      return;
    }
    setRedeemError(null);
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsCodeRedeemed(true);
      setRedeemFeedback(`Code applied successfully! Added ${packageInfo.priceFormatted} credit.`);
    }, 600);
  };

  const handleSubmitRedeemOrder = () => {
    if (!isCodeRedeemed && !redeemCode.trim()) {
      setRedeemError('Please enter a redeem code');
      return;
    }
    setRedeemError(null);
    if (!isCodeRedeemed && redeemCode.trim()) {
      setIsCodeRedeemed(true);
    }
    handleProcessPayment('giftcard');
  };

  return (
    <div
      id="roblox-checkout-modal-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans select-none animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[#13151b] text-white w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-[#242938] my-auto animate-in zoom-in-95 duration-150"
      >
        {/* ========================================================================= */}
        {/* VIEW 1: SELECT PAYMENT TYPE (Dark Theme) */}
        {/* ========================================================================= */}
        {step === 'select_payment' && (
          <div className="p-6 sm:p-10 space-y-6 sm:space-y-8 bg-[#13151b]">
            {/* Header: Secure checkout */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.5]" />
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Secure checkout
                </h1>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="w-9 h-9 rounded-full hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Two-Column Grid: Left Package Summary Card, Right Payment Options */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
              {/* Left Summary Card */}
              <div className="md:col-span-6 bg-[#181b24] rounded-2xl border border-[#262b3a] p-5 sm:p-6 shadow-xs space-y-4">
                {/* Robux Amount & Price */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <RobuxIcon className="w-6 h-6 text-white shrink-0" />
                      <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {packageInfo.amountFormatted}
                      </span>
                      {packageInfo.originalFormatted && (
                        <div className="flex items-center gap-0.5 text-neutral-400 line-through text-xs sm:text-sm font-medium">
                          <RobuxIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span>{packageInfo.originalFormatted}</span>
                        </div>
                      )}
                    </div>

                    {packageInfo.bonusFormatted && (
                      <div className="inline-block text-[11px] sm:text-xs font-semibold text-neutral-200 bg-[#252c3c] px-2.5 py-0.5 rounded-full border border-white/5">
                        {packageInfo.bonusFormatted}
                      </div>
                    )}
                  </div>

                  <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {packageInfo.priceFormatted}
                  </span>
                </div>
              </div>

              {/* Right: Payment Types */}
              <div className="md:col-span-6 space-y-3.5">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Select payment type:
                </h2>

                <div className="space-y-2.5">
                  {/* Option 1: Credit / Debit Card */}
                  <button
                    type="button"
                    onClick={() => setStep('credit_card')}
                    className="w-full bg-[#181b24] hover:bg-[#202532] active:scale-[0.99] border border-[#262b3a] rounded-xl px-4 py-3.5 flex items-center justify-between gap-3 text-left transition-all cursor-pointer shadow-2xs group hover:border-[#384055]"
                  >
                    <div className="flex items-center gap-2">
                      <div className="bg-[#222736] border border-[#31384c] rounded-xs px-1.5 py-1 flex items-center">
                        <VisaLogo className="h-3 w-auto" />
                      </div>
                      <div className="bg-[#222736] border border-[#31384c] rounded-xs px-1 py-0.5 flex items-center">
                        <MastercardLogo className="h-3.5 w-auto" />
                      </div>
                      <div className="bg-[#222736] border border-[#31384c] rounded-xs px-1 py-0.5 hidden sm:flex items-center">
                        <DiscoverLogo className="h-3 w-auto" />
                      </div>
                      <AmexLogo />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-neutral-200 group-hover:text-white">
                      Credit / Debit Card
                    </span>
                  </button>

                  {/* Option 2: PayPal */}
                  <button
                    type="button"
                    onClick={() => setStep('paypal')}
                    className="w-full bg-[#181b24] hover:bg-[#202532] active:scale-[0.99] border border-[#262b3a] rounded-xl px-4 py-3.5 flex items-center justify-between gap-3 text-left transition-all cursor-pointer shadow-2xs group hover:border-[#384055]"
                  >
                    <div className="bg-[#222736] border border-[#31384c] rounded-xs px-2 py-1 flex items-center">
                      <PaypalLogo className="h-3.5 w-auto" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-neutral-200 group-hover:text-white">
                      PayPal
                    </span>
                  </button>

                  {/* Option 3: Redeem Roblox Card */}
                  <button
                    type="button"
                    onClick={() => setStep('redeem_card')}
                    className="w-full bg-[#181b24] hover:bg-[#202532] active:scale-[0.99] border border-[#262b3a] rounded-xl px-4 py-3.5 flex items-center justify-between gap-3 text-left transition-all cursor-pointer shadow-2xs group hover:border-[#384055]"
                  >
                    <div className="bg-[#222736] border border-[#31384c] p-1 rounded-lg">
                      <RobloxCardLogo className="w-6 h-6" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-neutral-200 group-hover:text-white">
                      Redeem Roblox Card
                    </span>
                  </button>

                  {/* Option 4: Other */}
                  <button
                    type="button"
                    onClick={() => setStep('credit_card')}
                    className="w-full bg-[#181b24] hover:bg-[#202532] active:scale-[0.99] border border-[#262b3a] rounded-xl px-4 py-3.5 flex items-center justify-between gap-3 text-left transition-all cursor-pointer shadow-2xs group hover:border-[#384055]"
                  >
                    <div className="w-7 h-5 rounded-xs bg-[#222736] border border-[#31384c] flex items-center justify-center">
                      <CreditCard className="w-3.5 h-3.5 text-neutral-300" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-neutral-200 group-hover:text-white">
                      Other
                    </span>
                  </button>
                </div>

                <p className="text-[11px] sm:text-xs text-neutral-400 pt-3 leading-relaxed">
                  By purchasing Robux, you agree to our{' '}
                  <span className="font-bold text-neutral-300 underline cursor-pointer">
                    Terms of Use
                  </span>
                  , including the arbitration clause and revocation policy.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: CREDIT / DEBIT CARD (Dark Theme) */}
        {/* ========================================================================= */}
        {step === 'credit_card' && (
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[480px] bg-[#13151b]">
            {/* Left Column: ROBLOX Order Summary with GST */}
            <div className="md:col-span-5 bg-[#0f1116] p-6 sm:p-8 border-b md:border-b-0 md:border-r border-[#222634] flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                {/* Back button + ROBLOX Logo */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('select_payment')}
                    className="w-8 h-8 rounded-full hover:bg-neutral-800 flex items-center justify-center text-neutral-300 hover:text-white cursor-pointer transition-colors"
                    title="Back to payment options"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <span className="font-black text-xl tracking-tight text-white font-sans">
                    ROBLOX
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-2 pt-2 text-xs sm:text-sm">
                  <div className="flex items-center justify-between text-neutral-200">
                    <span className="font-semibold">{packageInfo.amountNum} Robux</span>
                    <span className="font-bold text-white">{packageInfo.subtotalFormatted}</span>
                  </div>
                  <div className="text-neutral-400 text-[11px] sm:text-xs">
                    {packageInfo.amountNum} Robux
                  </div>
                </div>

                <div className="border-t border-[#222634] pt-4 space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Subtotal</span>
                    <span className="text-neutral-200">{packageInfo.subtotalFormatted}</span>
                  </div>
                  <div className="flex items-center justify-between text-white font-extrabold text-base sm:text-lg">
                    <span>Total</span>
                    <span>{packageInfo.subtotalFormatted}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] sm:text-xs text-neutral-400 pt-1">
                    <span>Including 18% GST</span>
                    <span>{packageInfo.gstFormatted || '₹3,050.85'}</span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-neutral-500">
                Official Roblox payment gateway secured with 256-bit encryption.
              </div>
            </div>

            {/* Right Column: Card Inputs & Billing Information */}
            <div className="md:col-span-7 bg-[#161821] p-6 sm:p-8 flex flex-col justify-between space-y-6">
              {/* Header with user profile & ENG */}
              <div className="flex items-center justify-between border-b border-[#222634] pb-3 text-xs text-neutral-400">
                <div className="flex items-center gap-1.5 font-medium text-neutral-200">
                  <div className="w-5 h-5 rounded-full bg-[#222634] flex items-center justify-center text-neutral-200 text-[10px] font-bold">
                    {username?.[0]?.toUpperCase() || 'B'}
                  </div>
                  <span>{username || 'Bugsbunnyboy1012'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-300">ENG</span>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-6 h-6 rounded-full hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white ml-2 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Payment via credit or debit card
                </h2>

                {/* Card Number Input */}
                <div className="space-y-1.5">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      id="checkout-card-number-input"
                      value={cardNumber}
                      onKeyDown={handleNumberKeyDown}
                      onChange={handleCardNumberChange}
                      placeholder="Card number"
                      className={`w-full bg-[#1e222e] focus:bg-[#242938] border ${
                        cardError && !cardNumber.trim() ? 'border-rose-500' : 'border-[#2e3547]'
                      } focus:border-[#0055ff] rounded-xl px-4 py-3 text-xs sm:text-sm font-medium outline-none transition-all pr-28 text-white placeholder-neutral-500`}
                    />
                    <div className="absolute right-3 flex items-center gap-1.5 pointer-events-none">
                      <VisaLogo className="h-2.5 w-auto" />
                      <MastercardLogo className="h-3 w-auto" />
                      <AmexLogo />
                      <DiscoverLogo className="h-2.5 w-auto hidden sm:block" />
                    </div>
                  </div>
                </div>

                {/* MM/YY and CVV Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    id="checkout-card-expiry-input"
                    value={cardExpiry}
                    onKeyDown={handleNumberKeyDown}
                    onChange={handleCardExpiryChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    className={`w-full bg-[#1e222e] focus:bg-[#242938] border ${
                      cardError && !cardExpiry.trim() ? 'border-rose-500' : 'border-[#2e3547]'
                    } focus:border-[#0055ff] rounded-xl px-4 py-3 text-xs sm:text-sm font-medium outline-none transition-all text-white placeholder-neutral-500`}
                  />
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      id="checkout-card-cvv-input"
                      value={cardCvv}
                      onKeyDown={handleNumberKeyDown}
                      onChange={handleCardCvvChange}
                      placeholder="CVV2/CVC2"
                      maxLength={4}
                      className={`w-full bg-[#1e222e] focus:bg-[#242938] border ${
                        cardError && !cardCvv.trim() ? 'border-rose-500' : 'border-[#2e3547]'
                      } focus:border-[#0055ff] rounded-xl px-4 py-3 text-xs sm:text-sm font-medium outline-none transition-all pr-8 text-white placeholder-neutral-500`}
                    />
                    <HelpCircle className="w-4 h-4 text-neutral-400 absolute right-3 pointer-events-none" />
                  </div>
                </div>

                {/* Billing Information */}
                <div className="space-y-2 pt-1">
                  <h3 className="text-xs sm:text-sm font-bold text-neutral-200">
                    Billing information
                  </h3>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="email"
                      id="checkout-billing-email-input"
                      value={billingEmail}
                      onChange={(e) => setBillingEmail(e.target.value)}
                      placeholder="Optional"
                      className="w-full bg-[#1e222e] focus:bg-[#242938] border border-[#2e3547] focus:border-[#0055ff] rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm font-medium outline-none transition-all text-white placeholder-neutral-500"
                    />
                  </div>
                </div>

                {/* Validation Error Message */}
                {cardError && (
                  <div
                    id="checkout-card-error-message"
                    className="text-xs font-semibold text-rose-400 bg-rose-950/60 border border-rose-800/70 px-3.5 py-2.5 rounded-xl flex items-center gap-2 animate-in fade-in duration-150"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{cardError}</span>
                  </div>
                )}

                {/* Pay Button */}
                <button
                  type="button"
                  id="checkout-pay-button"
                  disabled={isProcessing}
                  onClick={handleCardSubmit}
                  className="w-full bg-[#0055ff] hover:bg-[#0047e0] active:scale-[0.99] text-white font-extrabold text-sm sm:text-base py-3.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <span>Pay {packageInfo.subtotalFormatted}</span>
                  )}
                </button>

                {/* Disclaimer Text from Screenshot 2 */}
                <p className="text-[10px] text-neutral-500 leading-relaxed pt-1">
                  By submitting payment information you acknowledge that you are at least 18 years
                  old, and that you have read, understood and agree to be bound by Xsolla&apos;s{' '}
                  <span className="text-neutral-400 underline">End-User License Agreement</span>,{' '}
                  <span className="text-neutral-400 underline">Privacy Policy</span>,{' '}
                  <span className="text-neutral-400 underline">Refund Policy</span>,{' '}
                  <span className="text-neutral-400 underline">Roblox Terms</span> including the
                  arbitration clause, and{' '}
                  <span className="text-neutral-400 underline">Roblox Privacy Policy</span> along
                  with the applicable refund and cancellation policies.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: PAYPAL DIRECT CHECKOUT (Dark Theme) */}
        {/* ========================================================================= */}
        {step === 'paypal' && (
          <div className="p-6 sm:p-10 space-y-6 bg-[#13151b]">
            <div className="flex items-center justify-between border-b border-[#222634] pb-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep('select_payment')}
                  className="w-8 h-8 rounded-full hover:bg-neutral-800 flex items-center justify-center text-neutral-300 cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <PaypalLogo className="h-5 w-auto" />
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="w-8 h-8 rounded-full hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-w-md mx-auto space-y-6 py-4 text-center">
              <div className="bg-[#181b24] border border-[#262b3a] rounded-2xl p-6 space-y-3">
                <span className="text-xs text-neutral-400 uppercase tracking-wider font-bold">
                  Merchant
                </span>
                <h3 className="text-lg font-black text-white">Roblox Corporation</h3>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {packageInfo.subtotalFormatted}
                </div>
                <p className="text-xs text-neutral-400">
                  {packageInfo.amountNum} Robux Package
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  id="checkout-paypal-pay-button"
                  disabled={isProcessing}
                  onClick={() => handleProcessPayment('paypal')}
                  className="w-full bg-[#ffc439] hover:bg-[#f4bb34] active:scale-[0.99] text-[#003087] font-black text-base py-3.5 rounded-full shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing with PayPal...</span>
                    </>
                  ) : (
                    <>
                      <span>Pay with</span>
                      <span className="font-black italic text-lg text-[#003087]">
                        Pay<span className="text-[#0079C1]">Pal</span>
                      </span>
                    </>
                  )}
                </button>

                <p className="text-xs text-neutral-400">
                  You will be charged {packageInfo.subtotalFormatted} directly through your PayPal account.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: REDEEM ROBLOX CARD (Dark Theme) */}
        {/* ========================================================================= */}
        {step === 'redeem_card' && (
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[480px] bg-[#13151b]">
            {/* Left Column: Large Robux amount + Bonus Steal a Brainrot Game Pass */}
            <div className="md:col-span-5 bg-[#0f1116] p-6 sm:p-8 border-b md:border-b-0 md:border-r border-[#222634] flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                <button
                  type="button"
                  onClick={() => setStep('select_payment')}
                  className="w-8 h-8 rounded-full hover:bg-neutral-800 flex items-center justify-center text-neutral-300 hover:text-white cursor-pointer"
                  title="Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Big Robux Icon + Amount + Price */}
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#1e2330] border border-[#2d3548] flex items-center justify-center shrink-0 shadow-xs">
                    <RobuxIcon className="w-8 h-8 text-white" variant="white" />
                  </div>
                  <div className="space-y-0.5">
                    <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
                      {packageInfo.amountNum} Robux
                    </h2>
                    <p className="text-sm font-bold text-neutral-300">
                      {packageInfo.priceFormatted}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-neutral-500">
                Roblox gift cards and codes can be redeemed globally.
              </div>
            </div>

            {/* Right Column: Roblox Credit breakdown & Redeem Code Box */}
            <div className="md:col-span-7 bg-[#161821] p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Roblox Credit
                  </h2>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-7 h-7 rounded-full hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Balances list */}
                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-300">Available credit</span>
                    <span className="font-bold text-white">
                      {isCodeRedeemed ? packageInfo.priceFormatted : `${currencySymbol}0.00`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-neutral-400">
                    <span>{packageInfo.amountNum} Robux</span>
                    <span className="font-semibold text-neutral-200">- {packageInfo.priceFormatted}</span>
                  </div>

                  <div className="border-t border-[#222634] pt-2.5 flex items-center justify-between">
                    <span
                      className={`font-semibold ${
                        isCodeRedeemed ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      Remaining balance
                    </span>
                    <span
                      className={`font-bold ${
                        isCodeRedeemed ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isCodeRedeemed ? `${currencySymbol}0.00` : `- ${packageInfo.priceFormatted}`}
                    </span>
                  </div>
                </div>

                {/* Redeem Code Container */}
                <div className="bg-[#1c202c] border border-[#293042] rounded-xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-white">
                    <span>Redeem Code</span>
                    <ChevronUp className="w-4 h-4 text-neutral-400" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1">
                      <span>Redeem code</span>
                      <HelpCircle className="w-3 h-3 text-neutral-400" />
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        id="checkout-redeem-code-input"
                        value={redeemCode}
                        onChange={handleRedeemCodeChange}
                        placeholder="Redeem code"
                        className={`flex-1 bg-[#12141b] focus:bg-[#181b24] border ${
                          redeemError ? 'border-rose-500' : 'border-[#2e364a]'
                        } focus:border-[#0055ff] rounded-lg px-3 py-2 text-xs sm:text-sm font-medium outline-none transition-all uppercase text-white placeholder-neutral-500`}
                      />
                      <button
                        type="button"
                        id="checkout-redeem-apply-button"
                        onClick={handleApplyRedeemCode}
                        className="bg-[#2d3446] hover:bg-[#384157] text-white px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 border border-white/5"
                      >
                        Redeem
                      </button>
                    </div>
                  </div>

                  {redeemError && (
                    <div
                      id="checkout-redeem-error-message"
                      className="text-xs font-semibold text-rose-400 bg-rose-950/60 border border-rose-800/70 px-3 py-2 rounded-lg flex items-center gap-2 animate-in fade-in duration-150"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{redeemError}</span>
                    </div>
                  )}

                  {redeemFeedback && (
                    <div className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1.5 rounded-md flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{redeemFeedback}</span>
                    </div>
                  )}

                  <p className="text-[10px] text-neutral-400 leading-relaxed pt-1">
                    By redeeming your code, you represent that you, and your parent or legal
                    guardian if you are under age 18, agree to our{' '}
                    <span className="font-semibold text-neutral-300 underline">Terms of Use</span> including the
                    arbitration clause and{' '}
                    <span className="font-semibold text-neutral-300 underline">
                      Gift Card Terms & Conditions
                    </span>{' '}
                    and acknowledge our{' '}
                    <span className="font-semibold text-neutral-300 underline">Privacy Policy</span>.
                  </p>
                </div>
              </div>

              {/* Submit Order button */}
              <div className="pt-2">
                <button
                  type="button"
                  id="checkout-submit-order-button"
                  disabled={isProcessing}
                  onClick={handleSubmitRedeemOrder}
                  className={`w-full font-bold text-sm sm:text-base py-3.5 rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 ${
                    isCodeRedeemed
                      ? 'bg-[#0055ff] hover:bg-[#0047e0] text-white active:scale-[0.99]'
                      : 'bg-[#2d3446] hover:bg-[#384157] text-neutral-200 active:scale-[0.99]'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Submitting Order...</span>
                    </>
                  ) : (
                    <span>Submit Order</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 5: SUCCESS / PURCHASE COMPLETE (Dark Theme) */}
        {/* ========================================================================= */}
        {step === 'success' && (
          <div className="p-8 sm:p-12 text-center space-y-6 max-w-lg mx-auto animate-in zoom-in-95 duration-200 bg-[#13151b]">
            {/* Animated Celebration Icon */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-30" />
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/20">
                <Check className="w-10 h-10 sm:w-12 sm:h-12 stroke-[3]" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Purchase Completed!
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 font-medium">
                Your purchase of <strong className="text-white font-bold">{packageInfo.amountFormatted} Robux</strong> was successful.
              </p>
            </div>

            {/* Dark Green Notification Card */}
            <div className="bg-[#13221a] border border-emerald-800/70 rounded-2xl p-4 sm:p-5 text-left space-y-3">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs sm:text-sm">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {packageInfo.amountFormatted} Robux has been sent to your account!
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-emerald-800/50 text-xs text-emerald-200">
                <span className="font-medium text-neutral-300">Account:</span>
                <span className="font-bold text-white">{username || 'Bugsbunnyboy1012'}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-emerald-200">
                <span className="font-medium text-neutral-300">New Robux Balance:</span>
                <div className="flex items-center gap-1 font-black text-sm text-emerald-400">
                  <RobuxIcon className="w-4 h-4 text-emerald-400" />
                  <span>{(currentRobux + packageInfo.amountNum).toLocaleString('en-US')}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                id="checkout-done-button"
                onClick={handleClose}
                className="w-full bg-[#222736] hover:bg-[#2c3346] active:scale-[0.99] text-white font-bold text-sm sm:text-base py-3.5 rounded-xl transition-all cursor-pointer shadow-md border border-[#333c52]"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
