import { Bell, Heart, Trophy, UserCheck, X } from 'lucide-react';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsDropdown({ isOpen, onClose }: NotificationsDropdownProps) {
  if (!isOpen) return null;

  const NOTIFICATIONS = [
    {
      id: 1,
      icon: <Heart className="w-4 h-4 text-pink-400" />,
      title: 'Friend Request Accepted',
      desc: 'BloxRacer99 accepted your friend request.',
      time: '10m ago',
    },
    {
      id: 2,
      icon: <Trophy className="w-4 h-4 text-amber-400" />,
      title: 'New Badge Unlocked!',
      desc: 'You unlocked "Master Trader" in Roblox Stock Exchange 2.',
      time: '1h ago',
    },
    {
      id: 3,
      icon: <UserCheck className="w-4 h-4 text-blue-400" />,
      title: 'Party Invite',
      desc: 'jasmineclockit invited you to play RIVALS.',
      time: '3h ago',
    },
    {
      id: 4,
      icon: <Bell className="w-4 h-4 text-purple-400" />,
      title: 'Ghost Driver Event',
      desc: 'Double XP Dragstrip weekend is now live!',
      time: '',
    },
  ];

  return (
    <div
      className="absolute top-14 right-4 z-50 w-80 bg-[#1e2024] border border-[#2d3036] rounded-xl shadow-2xl p-4 text-white"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#2d3036] mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">Notifications</span>
          <span className="bg-[#d83a3a] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            69
          </span>
        </div>
        <button onClick={onClose} className="text-neutral-400 hover:text-white text-xs">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {NOTIFICATIONS.map((n) => (
          <div
            key={n.id}
            className="p-2.5 rounded-lg bg-[#16181b] hover:bg-[#23252a] border border-[#27292e] flex items-start gap-3 transition-colors cursor-pointer"
          >
            <div className="mt-0.5 shrink-0">{n.icon}</div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-neutral-100">{n.title}</p>
              <p className="text-[11px] text-neutral-400 leading-tight mt-0.5">{n.desc}</p>
              {n.time ? (
                <span className="text-[10px] text-neutral-500 mt-1 block">{n.time}</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
