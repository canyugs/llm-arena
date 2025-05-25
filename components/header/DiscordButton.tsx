'use client';

interface DiscordButtonProps {
  isDesktop?: boolean;
  onClose?: () => void;
}

export default function DiscordButton({ isDesktop = true, onClose }: DiscordButtonProps) {
  return (
    <a
      href="https://discord.gg/Pg2kNMRC9Q"
      target="_blank"
      rel="noopener noreferrer"
      className="w-full py-2 bg-gray-100 text-blue-500 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
      onClick={onClose}
    >
      <img src="/icons/nav/discord.svg" alt="Discord" width={18} height={18} />
      <span>{isDesktop ? '加入 Discord 社群' : '加入 DC 社群'}</span>
    </a>
  );
} 