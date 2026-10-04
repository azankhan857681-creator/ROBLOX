import React, { useState } from 'react';
import { Info, X, Sparkles, Shield, Rocket, Clock } from 'lucide-react';
import rivalsOfficialBanner from '../assets/images/rivals_official_banner.png';
import rivalsOfficialIcon from '../assets/images/rivals_official_icon.png';
import { RobloxVerifiedBadge } from './RobloxVerifiedBadge';

const RIVALS_BANNER_URL = 'https://tr.rbxcdn.com/180DAY-99ae7910dac324d824e934988d8200d4/768/432/Image/Png/noFilter';
const RIVALS_ICON_URL = 'https://tr.rbxcdn.com/180DAY-eec9ed6090f47619f245e59e087a8621/150/150/Image/Png/noFilter';

interface RivalsBonusItemCardProps {
  isDark?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * RivalsBonusItemCard recreates the exact bonus promotional section from
 * Screenshot_20260913-221532-069.png and joined package layout from Screenshot 2026-09-20 221928.png.
 */
export const RivalsBonusItemCard: React.FC<RivalsBonusItemCardProps> = ({
  isDark = true,
  className = '',
  children,
}) => {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [bannerSrc, setBannerSrc] = useState<string>(RIVALS_BANNER_URL);
  const [iconSrc, setIconSrc] = useState<string>(RIVALS_ICON_URL);

  return (
    <section id="bonus-item-section" className={`w-full space-y-3.5 sm:space-y-4 ${className}`}>
      {/* Top Heading: "Limited-time avatar items" with "Ends in 10 days" pill matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 pb-1">
        <div>
          <h2
            id="bonus-item-heading"
            className="text-2xl sm:text-3xl md:text-[30px] font-extrabold sm:font-black tracking-tight text-white leading-tight text-left"
          >
            Limited-time avatar items
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 font-medium mt-1">
            Get an exclusive item when you buy an eligible Robux package.
          </p>
        </div>
        <div className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-neutral-900 text-xs font-bold shadow-sm shrink-0">
          <Clock className="w-3.5 h-3.5 text-neutral-900" />
          <span>Ends in 10 days</span>
        </div>
      </div>

      {/* Large Horizontal Promotional Card (With optional joined package rows) */}
      <div
        id="rivals-rpg-bundle-card"
        className={`relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border shadow-2xl transition-all ${
          isDark
            ? 'bg-[#0e1017] border-[#26282c]'
            : 'bg-[#10121a] border-neutral-700/50'
        }`}
      >
        {/* Top/Image Area: Authentic RIVALS FPS Scene */}
        <div className="relative w-full h-[175px] sm:h-[210px] md:h-[230px] overflow-hidden select-none">
          {/* Background Image: Official RIVALS Roblox Arena Image */}
          <img
            src={bannerSrc}
            onError={() => setBannerSrc(rivalsOfficialBanner)}
            alt="RIVALS Roblox FPS Arena"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover object-[center_35%]"
          />

          {/* Cinematic Dark Gradient Overlays (left & bottom shadow vignette matching reference) */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1017] via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-black/15 pointer-events-none" />

          {/* Centered Content: Icon + Title Group */}
          <div className="relative z-10 h-full px-5 sm:px-8 md:px-10 flex items-center">
            <div className="flex items-center gap-4 sm:gap-6 max-w-full">
              {/* Circular golden/orange game icon with crossed RPG-style weapons */}
              <div
                id="rivals-rpg-icon-badge"
                className="relative shrink-0 w-[76px] h-[76px] sm:w-[96px] sm:h-[96px] md:w-[108px] md:h-[108px] drop-shadow-[0_0_20px_rgba(245,158,11,0.6)] transition-transform duration-300 hover:scale-105"
              >
                <img
                  src={iconSrc}
                  onError={() => setIconSrc(rivalsOfficialIcon)}
                  alt="RIVALS RPG Bundle"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain select-none"
                />
              </div>

              {/* Text Group: RIVALS (i) and RPG BUNDLE! */}
              <div className="flex flex-col justify-center select-text">
                {/* RIVALS + Circular Info (i) Icon */}
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight uppercase leading-none drop-shadow-md">
                    RIVALS
                  </span>

                  <button
                    type="button"
                    id="rivals-info-button"
                    onClick={() => setIsInfoModalOpen(true)}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 hover:bg-white/35 border border-white/35 flex items-center justify-center text-white/90 hover:text-white transition-all cursor-pointer active:scale-90"
                    title="RIVALS RPG Bundle Details"
                    aria-label="RIVALS RPG Bundle Information"
                  >
                    <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>

                {/* RPG BUNDLE! */}
                <span className="text-sm sm:text-base md:text-lg font-extrabold text-white uppercase tracking-normal leading-tight mt-1 sm:mt-1.5 drop-shadow-sm">
                  RPG BUNDLE!
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Joined Robux Packages (from 24.000 down to 2.000) or subtle bottom edge */}
        {children ? (
          <div className={`divide-y border-t ${
            isDark ? 'bg-black border-[#26282c] divide-[#1c1e22]' : 'bg-white border-neutral-200 divide-neutral-100'
          }`}>
            {children}
          </div>
        ) : (
          <div className="h-4 sm:h-5 bg-[#0e1017] border-t border-[#1a1d26]/80" />
        )}
      </div>

      {/* Interactive RIVALS RPG Bundle Info Modal */}
      {isInfoModalOpen && (
        <div
          id="rivals-bundle-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsInfoModalOpen(false)}
        >
          <div
            id="rivals-bundle-modal-content"
            onClick={(e) => e.stopPropagation()}
            className="bg-[#13151c] text-white w-full max-w-sm sm:max-w-md rounded-2xl border border-[#252a3a] shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-sm text-white uppercase tracking-wide">
                  Bonus Item Details
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsInfoModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Visual */}
            <div className="relative rounded-xl overflow-hidden border border-neutral-800 bg-[#0a0b10] p-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full shrink-0 drop-shadow-[0_0_14px_rgba(245,158,11,0.5)]">
                <img
                  src={iconSrc}
                  onError={() => setIconSrc(rivalsOfficialIcon)}
                  alt="RIVALS RPG"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg text-white">RIVALS RPG BUNDLE</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-0.5">
                  <span className="text-neutral-300 font-semibold">NOSNIW Games</span>
                  <RobloxVerifiedBadge className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 text-xs sm:text-sm text-neutral-300 leading-relaxed">
              <p>
                Equip the exclusive heavy weapon loadout in <strong className="text-white">RIVALS</strong> on Roblox! Features the dual-warhead rocket launcher, customized projectile trail effects, and matching combat tags.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-[#1a1d27] p-2.5 rounded-xl border border-white/5 flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-semibold text-neutral-200">Custom RPG Skin</span>
                </div>
                <div className="bg-[#1a1d27] p-2.5 rounded-xl border border-white/5 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold text-neutral-200">Exclusive Badge</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsInfoModalOpen(false)}
                className="w-full py-2.5 bg-[#0055ff] hover:bg-[#0047e0] active:scale-98 text-white rounded-xl text-sm font-bold transition-all cursor-pointer shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
