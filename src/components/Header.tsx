'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Moon,
  Sun,
  Menu,
  X,
  User,
  Flame,
  Globe,
  PenSquare,
  LayoutDashboard,
  ShieldAlert,
  LogOut,
  ChevronDown,
  Bookmark,
  Sparkles,
  Bell,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useAuth } from './AuthProvider';
import { SearchModal } from './SearchModal';
import { AuthModal } from './AuthModal';
import { NotificationBell } from './NotificationBell';
import { HeaderWeatherMarket } from './HeaderWeatherMarket';
import { HeaderBreakingTicker } from './HeaderBreakingTicker';

const CATEGORIES = [
  { name: 'Top Stories', href: '/#top-stories' },
  { name: 'Pakistan', href: '/#pakistan' },
  { name: 'World', href: '/#world' },
  { name: 'Politics', href: '/category/politics' },
  { name: 'Business & Tech', href: '/#business-tech' },
  { name: 'Science & Climate', href: '/category/science' },
  { name: 'Opinion', href: '/category/opinion' },
  { name: 'Sports', href: '/#sports' },
];

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, profile, loading, isAdmin, isWriter, signOut } = useAuth();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'login' | 'signup' }>({
    open: false,
    mode: 'login',
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [currentDate, setCurrentDate] = useState('');
  const pathname = usePathname();
  const [activeCategory, setActiveCategory] = useState<string>('Top Stories');

  // 1. Sync active category with URL pathname and hash
  useEffect(() => {
    const syncActiveCategory = () => {
      // If on dedicated category page: /category/[slug]
      if (pathname?.startsWith('/category/')) {
        const slug = pathname.replace('/category/', '').split('/')[0].toLowerCase();
        if (slug === 'pakistan') setActiveCategory('Pakistan');
        else if (slug === 'world') setActiveCategory('World');
        else if (slug === 'politics') setActiveCategory('Politics');
        else if (slug === 'technology' || slug === 'business' || slug === 'business-tech')
          setActiveCategory('Business & Tech');
        else if (slug === 'science' || slug === 'climate') setActiveCategory('Science & Climate');
        else if (slug === 'opinion') setActiveCategory('Opinion');
        else if (slug === 'sports') setActiveCategory('Sports');
        return;
      }

      // If on homepage: check hash
      if (pathname === '/') {
        const hash = window.location.hash.replace('#', '').toLowerCase();
        if (hash === 'pakistan') setActiveCategory('Pakistan');
        else if (hash === 'world') setActiveCategory('World');
        else if (hash === 'politics') setActiveCategory('Politics');
        else if (hash === 'business-tech' || hash === 'technology' || hash === 'business')
          setActiveCategory('Business & Tech');
        else if (hash === 'science') setActiveCategory('Science & Climate');
        else if (hash === 'opinion') setActiveCategory('Opinion');
        else if (hash === 'sports') setActiveCategory('Sports');
        else if (hash === 'top-stories' || !hash) setActiveCategory('Top Stories');
        return;
      }

      // Other routes (/write, /admin, /news/[slug])
      setActiveCategory('');
    };

    syncActiveCategory();
    window.addEventListener('hashchange', syncActiveCategory);
    return () => window.removeEventListener('hashchange', syncActiveCategory);
  }, [pathname]);

  // 2. Scroll spy on homepage
  useEffect(() => {
    if (pathname !== '/') return;

    const sectionIds = ['top-stories', 'pakistan', 'world', 'business-tech', 'sports'];
    const sectionNames: Record<string, string> = {
      'top-stories': 'Top Stories',
      pakistan: 'Pakistan',
      world: 'World',
      'business-tech': 'Business & Tech',
      sports: 'Sports',
    };

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPos = window.scrollY + 220;
          let matched = false;
          for (let i = sectionIds.length - 1; i >= 0; i--) {
            const el = document.getElementById(sectionIds[i]);
            if (el && el.offsetTop <= scrollPos) {
              setActiveCategory(sectionNames[sectionIds[i]]);
              matched = true;
              break;
            }
          }
          if (!matched && window.scrollY < 300) {
            setActiveCategory('Top Stories');
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  useEffect(() => {
    const updateDate = () => {
      try {
        const now = new Date();
        const dateStr = new Intl.DateTimeFormat('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }).format(now);
        setCurrentDate(dateStr);
      } catch {
        setCurrentDate('Wednesday, October 28, 2026');
      }
    };

    updateDate();
    const timer = setInterval(updateDate, 60000);
    return () => clearInterval(timer);
  }, []);

  // Close avatar dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAvatarDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member';
  const displayEmail = user?.email || '';
  const initialLetter = displayName.charAt(0).toUpperCase();

  return (
    <header className="w-full border-b border-[var(--border-light)] bg-[var(--header-bg)] backdrop-blur-md sticky top-0 z-40 transition-colors">
      {/* Top Utility Ticker Bar */}
      <div className="border-b border-[var(--border-light)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Date & Edition */}
          <div className="flex items-center gap-4">
            <span
              className="font-medium tracking-tight text-[var(--text-primary)]"
              suppressHydrationWarning
            >
              {currentDate || 'Wednesday, October 28, 2026'}
            </span>
            <span className="hidden md:inline-block text-[var(--border-strong)] opacity-30">|</span>
            <div className="hidden md:flex items-center gap-1.5 text-[var(--text-muted)]">
              <Globe className="w-3.5 h-3.5" />
              <span>International Edition</span>
            </div>
            {/* Live Weather & Currency Market Ticker */}
            <HeaderWeatherMarket />
          </div>

          {/* Center: Live Rotating Breaking Ticker */}
          <HeaderBreakingTicker />

          {/* Right: Dark Mode Toggle */}
          <div className="flex items-center gap-3 ml-auto sm:ml-0">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-[var(--text-primary)] transition-colors flex items-center justify-center border border-[var(--border-light)] cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Masthead Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5">
        <div className="flex items-center justify-between gap-2">
          {/* Mobile hamburger & Quick Search */}
          <div className="flex items-center gap-1 sm:gap-2 lg:hidden shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-xl text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-[#dc2626]" />}
            </button>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-xl text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Search articles"
            >
              <Search className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
          </div>

          {/* Left search bar for desktop */}
          <div className="hidden lg:flex items-center gap-3 w-72">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[var(--bg-secondary)] hover:bg-gray-200 dark:hover:bg-gray-800 border border-[var(--border-light)] text-xs text-[var(--text-muted)] transition-colors w-52 cursor-pointer min-h-[38px]"
            >
              <Search className="w-3.5 h-3.5 text-[#dc2626]" />
              <span>Search journalism...</span>
              <kbd className="ml-auto text-[10px] bg-[var(--card-bg)] px-1.5 py-0.5 rounded border border-[var(--border-light)] font-mono">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Central Editorial Masthead Logo */}
          <div className="text-center flex-1 min-w-0 px-1">
            <Link href="/" className="inline-block group max-w-full">
              <h1 className="font-headline text-2xl min-[480px]:text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] group-hover:opacity-95 transition-opacity truncate">
                What&apos;s Happening<span className="text-[#dc2626]">.</span>
              </h1>
            </Link>
            <p className="hidden md:block text-[11px] tracking-widest uppercase font-serif text-[var(--text-muted)] mt-0.5">
              Independent Editorial &bull; Accurate, In-Depth, Global Perspective
            </p>
          </div>

          {/* Right Action Area (Auth State vs Logged In Avatar Menu) */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 shrink-0 lg:w-72">
            {loading ? (
              <div className="h-9 w-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            ) : user ? (
              /* LOGGED IN USER AVATAR & DROPDOWN */
              <div className="flex items-center gap-1.5 sm:gap-2.5 relative" ref={dropdownRef}>
                {/* Notification Bell */}
                <NotificationBell />

                {/* Write Article Link (writers/admins) */}
                <Link
                  href="/write"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-[var(--border-light)] hover:border-[#dc2626] hover:text-[#dc2626] transition-colors min-h-[44px]"
                >
                  <PenSquare className="w-3.5 h-3.5 text-[#dc2626]" />
                  <span>Write</span>
                </Link>

                {/* Avatar Button */}
                <button
                  onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center p-1 rounded-full hover:ring-2 hover:ring-[#dc2626] transition-all cursor-pointer"
                  aria-expanded={avatarDropdownOpen}
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={displayName}
                      className="w-8 h-8 rounded-full object-cover border border-[var(--border-light)]"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#dc2626] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      {initialLetter}
                    </div>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] hidden sm:block ml-1" />
                </button>

                {/* Dropdown Menu */}
                {avatarDropdownOpen && (
                  <div className="absolute right-0 top-12 w-64 sm:w-72 rounded-xl bg-[var(--card-bg)] border border-[var(--border-light)] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 max-w-[calc(100vw-2rem)]">
                    {/* User Header */}
                    <div className="p-3 border-b border-[var(--border-light)] bg-[var(--bg-secondary)] rounded-lg mb-1">
                      <div className="font-semibold text-xs text-[var(--text-primary)] truncate">
                        {displayName}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                        {displayEmail}
                      </div>
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            profile?.role === 'admin'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                              : profile?.role === 'writer'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                              : 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                          }`}
                        >
                          {profile?.role === 'admin' && <ShieldAlert className="w-3 h-3" />}
                          Role: {profile?.role || 'user'}
                        </span>
                      </div>
                    </div>

                    {/* Nav Items */}
                    <div className="space-y-0.5 text-xs text-[var(--text-primary)]">
                      <Link
                        href="/dashboard"
                        onClick={() => setAvatarDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-[44px]"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[var(--text-muted)]" />
                        <span>Dashboard</span>
                      </Link>

                      <Link
                        href="/notifications"
                        onClick={() => setAvatarDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-[44px]"
                      >
                        <Bell className="w-4 h-4 text-[var(--text-muted)]" />
                        <span>Notifications</span>
                      </Link>

                      <Link
                        href="/profile"
                        onClick={() => setAvatarDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-[44px]"
                      >
                        <User className="w-4 h-4 text-[var(--text-muted)]" />
                        <span>Profile & Bio</span>
                      </Link>

                      <Link
                        href="/write"
                        onClick={() => setAvatarDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-[44px]"
                      >
                        <PenSquare className="w-4 h-4 text-[var(--text-muted)]" />
                        <span>Write Article</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setAvatarDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors font-medium min-h-[44px]"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          <span>Admin Control Panel</span>
                        </Link>
                      )}
                    </div>

                    {/* Sign Out */}
                    <div className="pt-1 mt-1 border-t border-[var(--border-light)]">
                      <button
                        onClick={async () => {
                          setAvatarDropdownOpen(false);
                          await signOut();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer min-h-[44px]"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* LOGGED OUT BUTTONS */
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  href="/login"
                  className="px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-[44px] flex items-center justify-center"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="px-3.5 sm:px-4 py-2 rounded-lg text-xs font-semibold bg-[#dc2626] hover:bg-[#b91c1c] text-white shadow-sm transition-all hover:shadow-red-500/20 min-h-[44px] flex items-center justify-center"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Scrollable Category Bar (Requirement 3) */}
      <nav className="lg:hidden border-t border-[var(--border-light)] bg-[var(--card-bg)] overflow-x-auto no-scrollbar scroll-smooth">
        <ul className="flex items-center gap-1 px-3 text-xs font-semibold tracking-wide uppercase whitespace-nowrap min-w-max py-0.5">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.name;
            return (
              <li key={cat.name}>
                <Link
                  href={cat.href}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`inline-flex items-center py-2 px-3 transition-colors relative cursor-pointer min-h-[40px] ${
                    isActive
                      ? 'text-[#dc2626] font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[#dc2626]'
                  }`}
                >
                  <span>{cat.name}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#dc2626]" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Editorial Category Navigation Bar (Desktop) */}
      <nav className="hidden lg:block border-t border-[var(--border-light)] bg-[var(--card-bg)]">
        <div className="max-w-7xl mx-auto px-8">
          <ul className="flex items-center justify-between gap-1 py-1 text-xs font-semibold tracking-wide uppercase">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.name;
              return (
                <li key={cat.name}>
                  <Link
                    href={cat.href}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`inline-block py-2.5 px-3 transition-colors relative group cursor-pointer ${
                      isActive
                        ? 'text-[#dc2626] font-bold'
                        : 'text-[var(--text-secondary)] hover:text-[#dc2626]'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {isActive ? (
                      <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#dc2626]" />
                    ) : (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#dc2626] scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile Drawer Backdrop & Menu */}
      {mobileMenuOpen && (
        <>
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 top-[110px] z-40 bg-black/50 backdrop-blur-xs lg:hidden animate-fade-in"
          />
          <div className="lg:hidden border-t border-[var(--border-light)] bg-[var(--card-bg)] px-4 py-5 animate-in slide-in-from-top duration-200 z-50 relative max-h-[calc(100vh-120px)] overflow-y-auto">
            {/* User state if logged in */}
            {user && (
              <div className="mb-4 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-light)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={displayName}
                      className="w-10 h-10 rounded-full object-cover border border-[var(--border-light)]"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#dc2626] text-white flex items-center justify-center font-bold text-xs">
                      {initialLetter}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-xs text-[var(--text-primary)]">{displayName}</div>
                    <div className="text-[11px] text-[var(--text-muted)]">{profile?.role || 'user'}</div>
                  </div>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-xs text-[#dc2626] font-semibold"
                >
                  Edit
                </Link>
              </div>
            )}

            {/* Quick Action Links on Mobile */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Link
                href="/write"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#dc2626] text-white text-xs font-bold uppercase tracking-wider shadow-sm min-h-[44px]"
              >
                <PenSquare className="w-4 h-4" />
                <span>Write Story</span>
              </Link>
              <Link
                href="/notifications"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-[var(--border-light)] bg-[var(--bg-secondary)] text-xs font-semibold text-[var(--text-primary)] min-h-[44px]"
              >
                <Bell className="w-4 h-4 text-[#dc2626]" />
                <span>Alerts</span>
              </Link>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsSearchOpen(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-xs text-[var(--text-muted)] cursor-pointer min-h-[44px]"
              >
                <Search className="w-4 h-4 text-[#dc2626]" />
                <span>Search all news articles...</span>
              </button>
            </div>

            <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 px-1">
              Desks & Categories
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.name;
                return (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    onClick={() => {
                      setActiveCategory(cat.name);
                      setMobileMenuOpen(false);
                    }}
                    className={`p-3 rounded-xl font-medium text-xs flex items-center justify-between transition-colors min-h-[44px] ${
                      isActive
                        ? 'text-[#dc2626] bg-[var(--accent-red-subtle)] font-bold border-l-2 border-[#dc2626]'
                        : 'text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626]" />}
                  </Link>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-[var(--border-light)] flex gap-2">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2.5 text-center text-xs font-semibold rounded-xl border border-[var(--border-light)] text-[var(--text-primary)] min-h-[44px] flex items-center justify-center"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await signOut();
                    }}
                    className="flex-1 py-2.5 text-center text-xs font-semibold rounded-xl bg-[#dc2626] text-white min-h-[44px] flex items-center justify-center cursor-pointer"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2.5 text-center text-xs font-semibold rounded-xl border border-[var(--border-light)] text-[var(--text-primary)] min-h-[44px] flex items-center justify-center"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2.5 text-center text-xs font-semibold rounded-xl bg-[#dc2626] text-white min-h-[44px] flex items-center justify-center"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Global Search and Auth Modal Fallback */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <AuthModal
        isOpen={authModal.open}
        mode={authModal.mode}
        onClose={() => setAuthModal({ ...authModal, open: false })}
      />
    </header>
  );
}
