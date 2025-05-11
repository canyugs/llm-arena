'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import logo from '@/app/logo.webp';
import { useUser } from '@/app/contexts/UserContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const user = useUser();
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };
  
  const isActive = (path: string) => {
    return pathname === path;
  };
  
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="w-full py-2 border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* 桌面版 Header */}
        <div className="hidden md:flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src={logo}
                alt="FreeSEED"
                width={32}
                height={32}
                className="rounded-sm"
              />
              <span className="text-xl font-medium text-gray-700">FreeSEED</span>
            </Link>
            <nav className="flex space-x-6">
              <Link 
                href="/" 
                className={`flex items-center space-x-2 px-3 py-1 ${isActive('/') ? 'text-blue-500 bg-blue-50 rounded-md' : 'text-gray-600 hover:text-blue-500'}`}
              >
                <img src="/icons/nav/chat.svg" alt="Chat" width={20} height={20} />
                <span>AI對話</span>
              </Link>
              <Link 
                href="/game" 
                className={`flex items-center space-x-2 px-3 py-1 ${isActive('/game') ? 'text-blue-500 bg-blue-50 rounded-md' : 'text-gray-600 hover:text-blue-500'}`}
              >
                <img src="/icons/nav/game.svg" alt="Game" width={20} height={20} />
                <span>AI遊戲</span>
              </Link>
              <Link 
                href="/hot" 
                className={`flex items-center space-x-2 px-3 py-1 ${isActive('/hot') ? 'text-blue-500 bg-blue-50 rounded-md' : 'text-gray-600 hover:text-blue-500'}`}
              >
                <img src="/icons/nav/fire.svg" alt="Fire" width={20} height={20} />
                <span>熱門探索</span>
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative" ref={profileRef}>
              <button 
                onClick={toggleProfile}
                className="focus:outline-none"
              >
                {user ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img 
                      src={user.avatar} 
                      alt={user.username} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                )}
              </button>
              
              {isProfileOpen && user && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium text-gray-900">{user.username}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    登出
                  </button>
                </div>
              )}
            </div>
            <Link href="/daily-topic" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center space-x-2">
              <img src="/icons/nav/bulb-white.svg" alt="Bulb" width={18} height={18} />
              <span>每日主題</span>
            </Link>
          </div>
        </div>

        {/* 手機版 Header */}
        <div className="flex md:hidden justify-between items-center">
          <button
            className="text-gray-600 focus:outline-none"
            onClick={toggleMenu}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src={logo}
              alt="FreeSEED"
              width={28}
              height={28}
              className="rounded-sm"
            />
            <span className="text-xl font-medium text-gray-700">FreeSEED</span>
          </Link>
          
          <Link href="/daily-topic" className="focus:outline-none">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
              <img src="/icons/nav/bulb-white.svg" alt="Bulb" width={20} height={20} />
            </div>
          </Link>
        </div>

        {/* 手機版選單 - 覆蓋整個畫面 */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-white z-50 pt-20 px-4 overflow-y-auto">
            {/* 關閉按鈕與打開按鈕在相同的位置 */}
            <div className="fixed top-0 left-0 right-0 py-2 px-4 bg-white border-b flex justify-between items-center z-50">
              <button
                className="text-gray-600 focus:outline-none"
                onClick={toggleMenu}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src={logo}
                  alt="FreeSEED"
                  width={28}
                  height={28}
                  className="rounded-sm"
                />
                <span className="text-xl font-medium text-gray-700">FreeSEED</span>
              </Link>
              
              <Link href="/daily-topic" className="focus:outline-none">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                  <img src="/icons/nav/bulb-white.svg" alt="Bulb" width={20} height={20} />
                </div>
              </Link>
            </div>
            <nav className="flex flex-col space-y-5 mt-4">
              <Link 
                href="/" 
                className={`flex items-center space-x-3 py-4 px-3 ${isActive('/') ? 'text-blue-500 bg-blue-50 rounded-xl' : 'text-gray-700 hover:text-blue-500'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <img src="/icons/nav/chat.svg" alt="Chat" width={24} height={24} />
                <span className="text-lg">AI對話</span>
              </Link>
              <Link 
                href="/game" 
                className={`flex items-center space-x-3 py-4 px-3 ${isActive('/game') ? 'text-blue-500 bg-blue-50 rounded-xl' : 'text-gray-700 hover:text-blue-500'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <img src="/icons/nav/game.svg" alt="Game" width={24} height={24} />
                <span className="text-lg">AI遊戲</span>
              </Link>
              <Link 
                href="/hot" 
                className={`flex items-center space-x-3 py-4 px-3 ${isActive('/hot') ? 'text-blue-500 bg-blue-50 rounded-xl' : 'text-gray-700 hover:text-blue-500'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <img src="/icons/nav/fire.svg" alt="Fire" width={24} height={24} />
                <span className="text-lg">熱門探索</span>
              </Link>
              <div className="border-t my-2"></div>
              {user ? (
                <div className="flex items-center space-x-3 py-4 px-3">
                  <img 
                    src={user.avatar} 
                    alt={user.username} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-lg">{user.username}</span>
                    <button
                      onClick={handleLogout}
                      className="text-sm text-blue-500 text-left hover:text-blue-700 mt-1"
                    >
                      登出
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3 py-4 px-3 text-gray-700">
                  <img src="/icons/nav/profile.svg" alt="Profile" width={24} height={24} />
                  <span className="text-lg">個人資料</span>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
