import React, { useState } from 'react';
import { X } from 'lucide-react';
import { RobloxPlusBadge } from './RobloxPlusBadge';

interface RobloxPlusCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planTitle?: string;
  priceFormatted?: string;
  renewsOn?: string;
  isDark?: boolean;
}

/**
 * PayPal Badge Logo
 */
function PayPalLogo() {
  return (
    <div className="bg-white px-2 py-1 rounded flex items-center justify-center shadow-2xs border border-neutral-200">
      <span className="font-extrabold italic text-[#003087] text-xs sm:text-sm tracking-tighter">
        Pay<span className="text-[#0079C1]">Pal</span>
      </span>
    </div>
  );
}

/**
 * Hexagonal Roblox Plus 'P' Icon matching the reference picture
 */
function RobloxPlusHexIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Hexagon outline with rounded joins */}
      <path
        d="M24 4L41 14V34L24 44L7 34V14L24 4Z"
        stroke="currentColor"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Centered clean modern 'P' glyph */}
      <path
        d="M20 32V16H27C29.7614 16 32 18.2386 32 21C32 23.7614 29.7614 26 27 26H20"
        stroke="currentColor"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const RobloxPlusCheckoutModal: React.FC<RobloxPlusCheckoutModalProps> = ({
  isOpen,
  onClose,
  planTitle = 'Roblox Plus',
  priceFormatted = '₹500.00',
  renewsOn = '10/20/2026',
}) => {
  const [selectedPayment, setSelectedPayment] = useState<'paypal'>('paypal');

  if (!isOpen) return null;

  return (
    <div
      id="roblox-plus-checkout-modal"
      className="fixed inset-0 z-[60] overflow-y-auto flex items-center justify-center p-4 sm:p-6 select-none animate-in fade-in duration-200"
      style={{
        backgroundColor: '#000000',
      }}
    >
      {/* Close button at top right */}
      <button
        type="button"
        onClick={onClose}
        className="fixed top-5 right-5 sm:top-6 sm:right-8 w-10 h-10 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-50"
        title="Close"
      >
        <X className="w-6 h-6 stroke-[2]" />
      </button>

      {/* Main Container - Black Background as requested */}
      <div className="w-full max-w-4xl bg-black text-white px-4 sm:px-8 py-8 sm:py-12 flex flex-col">
        {/* Top Header: Secure Payment with Roblox */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-8 sm:mb-12">
          Secure Payment with Roblox
        </h1>

        {/* Two-column layout with vertical divider */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative items-start">
          {/* Left Column: Plan Information */}
          <div className="space-y-4">
            {/* Title with Hexagonal Plus Icon */}
            <div className="flex items-center gap-3">
              <div className="text-white shrink-0">
                <RobloxPlusHexIcon className="w-10 h-10 sm:w-11 sm:h-11" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {planTitle}
              </h2>
            </div>

            {/* Plan Details */}
            <div className="space-y-1.5 pt-1 text-sm sm:text-base font-semibold text-white">
              <p className="font-bold text-white">Monthly</p>
              <p className="font-bold text-white">
                Renews On: <span className="font-extrabold">{renewsOn}</span>
              </p>
              <p className="font-bold text-white">
                Balance Due: <span className="font-extrabold">{priceFormatted}</span>
              </p>
            </div>
          </div>

          {/* Vertical Divider (Desktop) / Horizontal Divider (Mobile) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-neutral-800" />

          {/* Right Column: Payment Type Selection */}
          <div className="space-y-4 md:pl-6">
            <label className="block text-sm sm:text-base font-medium text-neutral-200">
              Select payment type:
            </label>

            {/* PayPal Option Card */}
            <div
              onClick={() => setSelectedPayment('paypal')}
              className={`w-full max-w-md rounded-md p-3 sm:p-3.5 flex items-center justify-between transition-all cursor-pointer ${
                selectedPayment === 'paypal'
                  ? 'bg-[#181a20] border border-neutral-700 shadow-sm'
                  : 'bg-[#14151a] border border-neutral-800 hover:bg-[#181a20]'
              }`}
            >
              <div className="flex items-center gap-3">
                <PayPalLogo />
              </div>
              <span className="text-sm sm:text-base font-semibold text-neutral-200">
                PayPal
              </span>
            </div>

            {/* Red Error Message exactly as in the picture */}
            <div className="pt-2 text-xs sm:text-sm font-semibold text-red-500 leading-snug space-y-0.5">
              <p>Sorry an error has occurred.</p>
              <p>Please try again later.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
