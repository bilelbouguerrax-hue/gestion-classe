import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Menu,
  Search,
  Lock,
  Cloud,
  CloudOff,
  RefreshCw,
  Languages,
  Bell,
  GraduationCap,
  LogOut,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  onOpenAlerts: () => void;
  alertCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenSearch,
  onOpenAlerts,
  alertCount,
}) => {
  const { data, syncState, lockApp, lang, setLanguage, t, activeTeacher, openTeacherSelector, logout } = useApp();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6 no-print">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Menu"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus:outline-none lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight tracking-tight sm:text-lg">
              {t.appTitle}
            </h1>
            <p className="text-xs font-medium text-slate-500 hidden sm:block">
              {data.settings.schoolName} • {data.settings.academicYear}
            </p>
          </div>
        </div>
      </div>

      {/* Center Search Bar Shortcut */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <button
          onClick={onOpenSearch}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-sm text-slate-400 hover:border-slate-300 hover:bg-slate-100/80 transition-all shadow-xs"
        >
          <span className="flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-400" />
            <span>{t.common.search}</span>
          </span>
          <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search button */}
        <button
          onClick={onOpenSearch}
          aria-label="Recherche"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Sync Status Badge */}
        <div
          title={
            syncState === 'online'
              ? t.common.syncOnline
              : syncState === 'saving'
              ? t.common.syncSaving
              : t.common.syncOffline
          }
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors border"
          style={{
            borderColor:
              syncState === 'online'
                ? '#bbf7d0'
                : syncState === 'saving'
                ? '#fed7aa'
                : '#fecaca',
            backgroundColor:
              syncState === 'online'
                ? '#f0fdf4'
                : syncState === 'saving'
                ? '#fffbeb'
                : '#fef2f2',
            color:
              syncState === 'online'
                ? '#15803d'
                : syncState === 'saving'
                ? '#b45309'
                : '#b91c1c',
          }}
        >
          {syncState === 'online' && <Cloud className="h-3.5 w-3.5 text-emerald-600" />}
          {syncState === 'saving' && <RefreshCw className="h-3.5 w-3.5 text-amber-600 animate-spin" />}
          {syncState === 'offline' && <CloudOff className="h-3.5 w-3.5 text-rose-500" />}
          <span className="hidden sm:inline">
            {syncState === 'online' ? 'Cloud Sync' : syncState === 'saving' ? 'Sync...' : 'Local'}
          </span>
        </div>

        {/* Alerts Bell */}
        <button
          onClick={onOpenAlerts}
          className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
          title={t.dashboard.pedagogicalAlerts}
        >
          <Bell className="h-5 w-5" />
          {alertCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs">
              {alertCount}
            </span>
          )}
        </button>

        {/* Logged-in Teacher Info Badge */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-2xs">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
            {activeTeacher?.name.charAt(0) || 'E'}
          </div>
          <span className="hidden md:inline max-w-[140px] truncate">{activeTeacher?.name}</span>
        </div>

        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(lang === 'fr' ? 'ar' : 'fr')}
          className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          title="Changer de langue / تغيير اللغة"
        >
          <Languages className="h-3.5 w-3.5 text-slate-500" />
          <span>{lang === 'fr' ? 'عربي' : 'FR'}</span>
        </button>

        {/* Lock Screen Button */}
        {data.settings.isPinEnabled && (
          <button
            onClick={lockApp}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            title={t.common.lockScreen}
          >
            <Lock className="h-5 w-5" />
          </button>
        )}

        {/* Logout Button */}
        <button
          onClick={logout}
          className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          title="Déconnexion / تسجيل الخروج"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};
